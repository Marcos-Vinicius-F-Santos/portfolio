-- T-013 / ADR-008: idempotent discard back to the active publication.
alter table portfolio_editorial.operations drop constraint operations_type_check;
alter table portfolio_editorial.operations add constraint operations_type_check
 check(type in('draft_command','publication','discard'));
grant insert,update,delete on portfolio_editorial.draft_locales to portfolio_editorial_executor;
create policy draft_locales_executor_write on portfolio_editorial.draft_locales
 for all to portfolio_editorial_executor using(true) with check(true);

create function portfolio_editorial.discard_draft(expected_revision bigint,operation_id uuid,actor uuid)
returns jsonb language plpgsql security definer set search_path='' as $$
declare current_revision bigint; existing portfolio_editorial.operations%rowtype; request_hash text;
 snapshot jsonb; receipt jsonb; locale record; entity record; translation record;
begin
 actor:=portfolio_editorial.require_editorial_admin(actor);
 request_hash:=encode(extensions.digest(jsonb_build_object('revision',expected_revision,'type','discard')::text,'sha256'),'hex');
 select * into existing from portfolio_editorial.operations o where o.operation_id=discard_draft.operation_id;
 if found then
  if existing.actor_id<>actor or existing.request_hash<>request_hash or existing.type<>'discard' then
   raise exception 'operation id already used with another request' using errcode='23505';end if;
  return existing.result||jsonb_build_object('repeated',true);
 end if;
 select revision into current_revision from portfolio_editorial.draft where id=1 for update;
 if current_revision<>expected_revision then raise exception 'revision conflict' using errcode='40001',detail=current_revision::text;end if;
 select p.snapshot into snapshot from portfolio_editorial.site_state s join portfolio_editorial.publications p on p.id=s.active_publication_id where s.id=1;
 if snapshot is null then raise exception 'active publication unavailable' using errcode='22023';end if;
 set constraints all deferred;
 delete from portfolio_editorial.draft_media_refs where draft_id=1;
 delete from portfolio_editorial.draft_translations where draft_id=1;
 delete from portfolio_editorial.draft_entities where draft_id=1;
 delete from portfolio_editorial.draft_locales where draft_id=1 and code<>'pt-BR';
 for locale in select value from jsonb_array_elements(snapshot->'locales') loop
  insert into portfolio_editorial.draft_locales(draft_id,code,label,direction,status,position)
   values(1,locale.value->>'code',locale.value->>'label',locale.value->>'direction','active',(locale.value->>'position')::integer)
   on conflict(draft_id,code) do update set label=excluded.label,direction=excluded.direction,status='active',position=excluded.position;
 end loop;
 for entity in select key,value from jsonb_each(snapshot->'entities') loop
  insert into portfolio_editorial.draft_entities(draft_id,id,kind,parent_id,position,data)
   values(1,entity.key,entity.value->>'kind',entity.value->>'parentId',(entity.value->>'position')::integer,entity.value->'data');
 end loop;
 for locale in select key,value from jsonb_each(snapshot->'translations') loop
  for translation in select key,value from jsonb_each(locale.value) loop
   insert into portfolio_editorial.draft_translations(draft_id,entity_id,locale_code,fields)
    values(1,translation.key,locale.key,translation.value);
  end loop;
 end loop;
 current_revision:=current_revision+1;
 update portfolio_editorial.draft d set revision=current_revision,base_publication_id=s.active_publication_id,updated_at=now()
  from portfolio_editorial.site_state s where d.id=1 and s.id=1;
 receipt:=jsonb_build_object('operationId',operation_id,'revision',current_revision,'repeated',false);
 insert into portfolio_editorial.operations(operation_id,actor_id,type,request_hash,revision,result)
  values(operation_id,actor,'discard',request_hash,current_revision,receipt);
 return receipt;
end $$;

create function public.discard_editor_draft(expected_revision bigint,operation_id uuid)
returns jsonb language sql security definer set search_path='' as $$
 select portfolio_editorial.discard_draft(expected_revision,operation_id,
  coalesce(nullif(current_setting('request.jwt.claim.sub',true),''),nullif(current_setting('request.jwt.claims',true),'')::jsonb->>'sub')::uuid)
$$;
revoke all on function portfolio_editorial.discard_draft(bigint,uuid,uuid) from public,anon,authenticated,service_role;
revoke all on function public.discard_editor_draft(bigint,uuid) from public,anon;
grant execute on function public.discard_editor_draft(bigint,uuid) to authenticated;
grant create on schema portfolio_editorial to portfolio_editorial_executor;
alter function portfolio_editorial.discard_draft(bigint,uuid,uuid) owner to portfolio_editorial_executor;
grant create on schema public to portfolio_editorial_executor;
alter function public.discard_editor_draft(bigint,uuid) owner to portfolio_editorial_executor;
revoke create on schema public from portfolio_editorial_executor;
revoke create on schema portfolio_editorial from portfolio_editorial_executor;
