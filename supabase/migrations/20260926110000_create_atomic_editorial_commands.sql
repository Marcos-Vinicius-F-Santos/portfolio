-- T-008 / ADR-008: atomic, revisioned and idempotent draft commands.

create table portfolio_editorial.operations (
  operation_id uuid primary key,
  actor_id uuid not null,
  type text not null check (type in ('draft_command')),
  request_hash text not null check (request_hash ~ '^[0-9a-f]{64}$'),
  revision bigint not null check (revision > 0),
  result jsonb not null check (jsonb_typeof(result) = 'object'),
  created_at timestamptz not null default now()
);
alter table portfolio_editorial.operations enable row level security;
alter table portfolio_editorial.operations force row level security;
create index operations_actor_created_idx
  on portfolio_editorial.operations (actor_id, created_at desc);

grant select, update on portfolio_editorial.draft to portfolio_editorial_executor;
grant select, insert, update, delete on portfolio_editorial.draft_entities to portfolio_editorial_executor;
grant select, insert, update, delete on portfolio_editorial.draft_translations to portfolio_editorial_executor;
grant select on portfolio_editorial.draft_locales, portfolio_editorial.technologies to portfolio_editorial_executor;
grant select, insert on portfolio_editorial.operations to portfolio_editorial_executor;
grant usage on schema extensions to portfolio_editorial_executor;
grant execute on function extensions.digest(text,text) to portfolio_editorial_executor;
grant usage on schema extensions to portfolio_editorial_executor;
grant execute on function extensions.digest(text,text) to portfolio_editorial_executor;

create policy draft_executor_update on portfolio_editorial.draft
  for update to portfolio_editorial_executor using (true) with check (true);
create policy draft_entities_executor_all on portfolio_editorial.draft_entities
  for all to portfolio_editorial_executor using (true) with check (true);
create policy draft_translations_executor_all on portfolio_editorial.draft_translations
  for all to portfolio_editorial_executor using (true) with check (true);
create policy draft_locales_executor_select on portfolio_editorial.draft_locales
  for select to portfolio_editorial_executor using (true);
create policy technologies_executor_select on portfolio_editorial.technologies
  for select to portfolio_editorial_executor using (true);
create policy operations_executor_all on portfolio_editorial.operations
  for all to portfolio_editorial_executor using (true) with check (true);
create policy operations_owner_all on portfolio_editorial.operations
  for all to portfolio_editorial_owner using (true) with check (true);

create function portfolio_editorial.allowed_entity_fields(entity_kind text, translated boolean)
returns text[] language sql immutable set search_path = '' as $$
  select case
    when translated and entity_kind = 'presentation' then array['eyebrow','title','displayName','summary']
    when translated and entity_kind = 'about' then array['title','body']
    when translated and entity_kind = 'result' then array['title','description','value']
    when translated and entity_kind = 'experience' then array['title','context']
    when translated and entity_kind = 'skillCategory' then array['label']
    when translated and entity_kind = 'skill' then array['name']
    when translated and entity_kind = 'academic' then array['name','institution']
    when translated and entity_kind = 'project' then array['name','description','problemContext','solution','role']
    when translated and entity_kind = 'contact' then array['label']
    when translated and entity_kind = 'projectLink' then array['label']
    when translated and entity_kind = 'projectImage' then array['alt']
    when translated and entity_kind = 'curriculum' then array['label']
    when translated and entity_kind in ('interfaceText','listItem') then array['text']
    when not translated and entity_kind = 'experience' then array['startDate','endDate']
    when not translated and entity_kind = 'skill' then array['technologyId','iconMediaId']
    when not translated and entity_kind = 'academic' then array['startDate','endDate','isCurrent']
    when not translated and entity_kind = 'project' then array['type']
    when not translated and entity_kind = 'contact' then array['symbol','href']
    when not translated and entity_kind = 'projectLink' then array['href']
    when not translated and entity_kind = 'projectImage' then array['mediaId']
    when not translated and entity_kind = 'curriculum' then array['mediaId','localeCode']
    when not translated and entity_kind = 'interfaceText' then array['key']
    when not translated and entity_kind = 'listItem' then array['collection']
    else array[]::text[] end
$$;

create function portfolio_editorial.apply_draft_command(
  expected_revision bigint, operation_id uuid, command jsonb, actor uuid
) returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  current_revision bigint; command_type text; request_hash text;
  existing portfolio_editorial.operations%rowtype; entity portfolio_editorial.draft_entities%rowtype;
  entity_id text; entity_kind text; target_parent_id text; field_name text; locale_code text;
  new_position integer; ids text[]; current_ids text[]; item record; receipt jsonb;
begin
  actor := portfolio_editorial.require_editorial_admin(actor);
  if command is null or jsonb_typeof(command) <> 'object' then
    raise exception 'command must be an object' using errcode = '22023';
  end if;
  command_type := command ->> 'type';
  request_hash := encode(extensions.digest(command::text, 'sha256'), 'hex');
  select * into existing from portfolio_editorial.operations where operations.operation_id = apply_draft_command.operation_id;
  if found then
    if existing.actor_id <> actor or existing.request_hash <> request_hash then
      raise exception 'operation id already used with another request' using errcode = '23505';
    end if;
    return existing.result || jsonb_build_object('repeated', true);
  end if;

  select revision into current_revision from portfolio_editorial.draft where id = 1 for update;
  if current_revision <> expected_revision then
    raise exception 'revision conflict' using errcode = '40001', detail = current_revision::text;
  end if;

  entity_id := command ->> 'entityId';
  if command_type in ('set_field','set_translation','remove_entity') then
    select * into entity from portfolio_editorial.draft_entities where draft_id = 1 and id = entity_id;
    if not found then raise exception 'entity not found' using errcode = '22023'; end if;
  end if;

  if command_type = 'set_field' then
    field_name := command ->> 'field';
    if not (command ? 'value')
      or not (field_name = any(portfolio_editorial.allowed_entity_fields(entity.kind, false)))
      or (field_name = 'href' and (jsonb_typeof(command -> 'value') <> 'string'
        or (command ->> 'value') !~ '^(https://|mailto:|tel:)'))
      or (field_name in ('startDate','endDate') and command -> 'value' <> 'null'::jsonb
        and (jsonb_typeof(command -> 'value') <> 'string' or (command ->> 'value') !~ '^\d{4}-\d{2}-\d{2}$'))
      or (field_name = 'isCurrent' and jsonb_typeof(command -> 'value') <> 'boolean')
      or (field_name = 'type' and (command ->> 'value') not in ('professional','personal')) then
      raise exception 'field is not editable for entity kind' using errcode = '22023';
    end if;
    update portfolio_editorial.draft_entities set data = jsonb_set(data, array[field_name], command -> 'value', true)
    where draft_id = 1 and id = entity_id;
  elsif command_type = 'set_translation' then
    field_name := command ->> 'field'; locale_code := command ->> 'locale';
    if jsonb_typeof(command -> 'value') <> 'string'
      or (command ->> 'value') ~ '<[^>]+>'
      or not (field_name = any(portfolio_editorial.allowed_entity_fields(entity.kind, true)))
      or not exists (select 1 from portfolio_editorial.draft_locales where draft_id = 1 and code = locale_code) then
      raise exception 'invalid translated field' using errcode = '22023';
    end if;
    insert into portfolio_editorial.draft_translations(draft_id,entity_id,locale_code,fields)
    values (1,entity_id,locale_code,jsonb_build_object(field_name,command -> 'value'))
    on conflict on constraint draft_translations_pkey do update
      set fields = jsonb_set(portfolio_editorial.draft_translations.fields,array[field_name],command -> 'value',true);
  elsif command_type = 'add_entity' then
    entity_kind := command ->> 'kind'; target_parent_id := command ->> 'parentId'; new_position := (command ->> 'position')::integer;
    if entity_id !~ '^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$' or new_position < 0
      or jsonb_typeof(command -> 'data') <> 'object' or jsonb_typeof(command -> 'translations') <> 'object'
      or exists (select 1 from jsonb_object_keys(command -> 'data') key where not (key = any(portfolio_editorial.allowed_entity_fields(entity_kind,false))))
      or (target_parent_id is not null and not exists(select 1 from portfolio_editorial.draft_entities where draft_id=1 and id=target_parent_id)) then
      raise exception 'invalid entity payload' using errcode = '22023';
    end if;
    update portfolio_editorial.draft_entities set position = position + 100000
      where draft_id=1 and kind=entity_kind and parent_id is not distinct from target_parent_id and position >= new_position;
    update portfolio_editorial.draft_entities set position = position - 99999
      where draft_id=1 and kind=entity_kind and parent_id is not distinct from target_parent_id and position >= 100000;
    insert into portfolio_editorial.draft_entities(draft_id,id,kind,parent_id,position,data)
      values(1,entity_id,entity_kind,target_parent_id,new_position,command -> 'data');
    for item in select key,value from jsonb_each(command -> 'translations') loop
      if not exists(select 1 from portfolio_editorial.draft_locales where draft_id=1 and code=item.key)
        or jsonb_typeof(item.value) <> 'object'
        or exists(select 1 from jsonb_object_keys(item.value) key where not (key = any(portfolio_editorial.allowed_entity_fields(entity_kind,true)))) then
        raise exception 'invalid entity translations' using errcode = '22023';
      end if;
      insert into portfolio_editorial.draft_translations(draft_id,entity_id,locale_code,fields) values(1,entity_id,item.key,item.value);
    end loop;
  elsif command_type = 'remove_entity' then
    delete from portfolio_editorial.draft_entities where draft_id=1 and id=entity_id;
  elsif command_type = 'reorder_collection' then
    entity_kind := command ->> 'kind'; target_parent_id := command ->> 'parentId';
    select array_agg(value order by ordinality) into ids from jsonb_array_elements_text(command -> 'entityIds') with ordinality;
    select array_agg(id order by id) into current_ids from portfolio_editorial.draft_entities
      where draft_id=1 and kind=entity_kind and draft_entities.parent_id is not distinct from target_parent_id;
    if ids is null or (select array_agg(x order by x) from unnest(ids) x) is distinct from current_ids
      or cardinality(ids) <> (select count(distinct x) from unnest(ids) x) then
      raise exception 'reorder must contain the exact collection' using errcode = '22023';
    end if;
    update portfolio_editorial.draft_entities set position = position + 100000
      where draft_id=1 and kind=entity_kind and draft_entities.parent_id is not distinct from target_parent_id;
    for new_position in 1..cardinality(ids) loop
      update portfolio_editorial.draft_entities set position=new_position-1 where draft_id=1 and id=ids[new_position];
    end loop;
  else raise exception 'unknown command type' using errcode = '22023'; end if;

  current_revision := current_revision + 1;
  update portfolio_editorial.draft set revision=current_revision,updated_at=now() where id=1;
  receipt := jsonb_build_object('operationId',operation_id,'revision',current_revision,'repeated',false);
  insert into portfolio_editorial.operations(operation_id,actor_id,type,request_hash,revision,result)
    values(operation_id,actor,'draft_command',request_hash,current_revision,receipt);
  return receipt;
end
$$;

create function public.save_editor_command(expected_revision bigint, operation_id uuid, command jsonb)
returns jsonb language sql security definer set search_path = '' as $$
  select portfolio_editorial.apply_draft_command(expected_revision,operation_id,command,
    coalesce(nullif(current_setting('request.jwt.claim.sub',true),''),nullif(current_setting('request.jwt.claims',true),'')::jsonb->>'sub')::uuid)
$$;

revoke all on portfolio_editorial.operations from public,anon,authenticated,service_role;
revoke all on function portfolio_editorial.allowed_entity_fields(text,boolean),
  portfolio_editorial.apply_draft_command(bigint,uuid,jsonb,uuid) from public,anon,authenticated,service_role;
revoke all on function public.save_editor_command(bigint,uuid,jsonb) from public,anon;
grant execute on function public.save_editor_command(bigint,uuid,jsonb) to authenticated;

alter table portfolio_editorial.operations owner to portfolio_editorial_owner;
grant create on schema portfolio_editorial to portfolio_editorial_executor;
alter function portfolio_editorial.allowed_entity_fields(text,boolean) owner to portfolio_editorial_executor;
alter function portfolio_editorial.apply_draft_command(bigint,uuid,jsonb,uuid) owner to portfolio_editorial_executor;
grant create on schema public to portfolio_editorial_executor;
alter function public.save_editor_command(bigint,uuid,jsonb) owner to portfolio_editorial_executor;
revoke create on schema public from portfolio_editorial_executor;
revoke create on schema portfolio_editorial from portfolio_editorial_executor;
