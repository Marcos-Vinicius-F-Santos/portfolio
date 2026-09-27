-- T-011 / ADR-008: transactional and idempotent publication.

alter table portfolio_editorial.operations drop constraint operations_type_check;
alter table portfolio_editorial.operations add constraint operations_type_check
  check (type in ('draft_command','publication'));
alter table portfolio_editorial.operations drop constraint operations_revision_check;
alter table portfolio_editorial.operations add constraint operations_revision_check check (revision >= 0);
alter table portfolio_editorial.operations drop constraint operations_revision_check;
alter table portfolio_editorial.operations add constraint operations_revision_check check (revision >= 0);

grant insert on portfolio_editorial.publications to portfolio_editorial_executor;
grant select, update on portfolio_editorial.site_state to portfolio_editorial_executor;
create policy publications_executor_select on portfolio_editorial.publications
  for select to portfolio_editorial_executor using (true);
create policy publications_executor_insert on portfolio_editorial.publications
  for insert to portfolio_editorial_executor with check (true);
create policy site_state_executor_select on portfolio_editorial.site_state
  for select to portfolio_editorial_executor using (true);
create policy site_state_executor_update on portfolio_editorial.site_state
  for update to portfolio_editorial_executor using (true) with check (true);

create function portfolio_editorial.build_publication_content()
returns jsonb language plpgsql stable security definer set search_path='' as $$
declare base_snapshot jsonb; result jsonb;
begin
  select p.snapshot into base_snapshot from portfolio_editorial.draft d
    left join portfolio_editorial.publications p on p.id=d.base_publication_id where d.id=1;
  select jsonb_build_object(
    'formatVersion',1,
    'defaultLocale','pt-BR',
    'locales',coalesce((select jsonb_agg(jsonb_build_object('code',code,'label',label,'direction',direction,'position',position) order by position)
      from portfolio_editorial.draft_locales where draft_id=1 and status='active'),'[]'::jsonb),
    'sections',coalesce(base_snapshot->'sections','[]'::jsonb),
    'entities',coalesce((select jsonb_object_agg(id,jsonb_strip_nulls(jsonb_build_object('kind',kind,'parentId',parent_id,'position',position,'data',data)) order by id)
      from portfolio_editorial.draft_entities where draft_id=1),'{}'::jsonb),
    'translations',coalesce((select jsonb_object_agg(locale_code,items order by locale_code) from (
      select t.locale_code,jsonb_object_agg(t.entity_id,t.fields order by t.entity_id) items
      from portfolio_editorial.draft_translations t join portfolio_editorial.draft_locales l
        on l.draft_id=t.draft_id and l.code=t.locale_code and l.status='active'
      where t.draft_id=1 group by t.locale_code) x),'{}'::jsonb),
    'technologies',coalesce(base_snapshot->'technologies','{}'::jsonb),
    'media',coalesce(base_snapshot->'media','{}'::jsonb) || coalesce((select jsonb_object_agg(m.id::text,
      jsonb_build_object('source','managed','mime',m.mime,'bytes',m.bytes) order by m.id)
      from portfolio_editorial.media m join portfolio_editorial.draft_media_refs r on r.media_id=m.id
      where r.draft_id=1 and m.status='ready'),'{}'::jsonb)
  ) into result;
  return result;
end $$;

create function portfolio_editorial.publish_draft(
  expected_revision bigint, operation_id uuid, review_hash text, actor uuid
) returns jsonb language plpgsql security definer set search_path='' as $$
declare current_revision bigint; existing portfolio_editorial.operations%rowtype;
  validation jsonb; request_hash text; content jsonb; active_snapshot jsonb;
  publication_id uuid; created_at timestamptz; snapshot jsonb; snapshot_hash text; receipt jsonb;
begin
  actor := portfolio_editorial.require_editorial_admin(actor);
  request_hash := encode(extensions.digest(jsonb_build_object('revision',expected_revision,'reviewHash',review_hash)::text,'sha256'),'hex');
  select * into existing from portfolio_editorial.operations o where o.operation_id=publish_draft.operation_id;
  if found then
    if existing.actor_id<>actor or existing.request_hash<>request_hash or existing.type<>'publication' then
      raise exception 'operation id already used with another request' using errcode='23505'; end if;
    return existing.result || jsonb_build_object('repeated',true);
  end if;
  select revision into current_revision from portfolio_editorial.draft where id=1 for update;
  perform 1 from portfolio_editorial.site_state where id=1 for update;
  if current_revision<>expected_revision then raise exception 'revision conflict' using errcode='40001',detail=current_revision::text; end if;
  validation := portfolio_editorial.validate_publication(expected_revision,actor);
  if validation->>'valid'<>'true' then raise exception 'draft validation failed' using errcode='22023',detail=(validation->'errors')::text; end if;
  if validation->>'reviewHash'<>review_hash then raise exception 'review hash conflict' using errcode='40001'; end if;
  content := portfolio_editorial.build_publication_content();
  select p.snapshot into active_snapshot from portfolio_editorial.site_state s
    left join portfolio_editorial.publications p on p.id=s.active_publication_id where s.id=1;
  if active_snapshot - 'publicationId' - 'createdAt' = content then
    publication_id := (active_snapshot->>'publicationId')::uuid;
  else
    publication_id := gen_random_uuid(); created_at := clock_timestamp();
    snapshot := content || jsonb_build_object('publicationId',publication_id,'createdAt',created_at);
    snapshot_hash := encode(extensions.digest(snapshot::text,'sha256'),'hex');
    insert into portfolio_editorial.publications(id,format_version,snapshot,hash,source_revision)
      values(publication_id,1,snapshot,snapshot_hash,current_revision);
    update portfolio_editorial.site_state set active_publication_id=publication_id,updated_at=now() where id=1;
  end if;
  update portfolio_editorial.draft set base_publication_id=publication_id,updated_at=now() where id=1;
  receipt:=jsonb_build_object('operationId',operation_id,'revision',current_revision,'publicationId',publication_id,'repeated',false);
  insert into portfolio_editorial.operations(operation_id,actor_id,type,request_hash,revision,result)
    values(operation_id,actor,'publication',request_hash,current_revision,receipt);
  return receipt;
end $$;

create function public.publish_editor_draft(expected_revision bigint,operation_id uuid,review_hash text)
returns jsonb language sql security definer set search_path='' as $$
 select portfolio_editorial.publish_draft(expected_revision,operation_id,review_hash,
  coalesce(nullif(current_setting('request.jwt.claim.sub',true),''),nullif(current_setting('request.jwt.claims',true),'')::jsonb->>'sub')::uuid)
$$;
revoke all on function portfolio_editorial.build_publication_content(),
 portfolio_editorial.publish_draft(bigint,uuid,text,uuid) from public,anon,authenticated,service_role;
revoke all on function public.publish_editor_draft(bigint,uuid,text) from public,anon;
grant execute on function public.publish_editor_draft(bigint,uuid,text) to authenticated;
grant create on schema portfolio_editorial to portfolio_editorial_executor;
alter function portfolio_editorial.build_publication_content() owner to portfolio_editorial_executor;
alter function portfolio_editorial.publish_draft(bigint,uuid,text,uuid) owner to portfolio_editorial_executor;
grant create on schema public to portfolio_editorial_executor;
alter function public.publish_editor_draft(bigint,uuid,text) owner to portfolio_editorial_executor;
revoke create on schema public from portfolio_editorial_executor;
revoke create on schema portfolio_editorial from portfolio_editorial_executor;
