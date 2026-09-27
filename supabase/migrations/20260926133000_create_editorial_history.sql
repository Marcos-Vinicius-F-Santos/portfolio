-- T-014 / ADR-008: retained history and restore-to-draft.
alter table portfolio_editorial.operations drop constraint operations_type_check;
alter table portfolio_editorial.operations add constraint operations_type_check
 check(type in('draft_command','publication','discard','restore'));
grant update on portfolio_editorial.publications to portfolio_editorial_executor;
create policy publications_executor_retention_update on portfolio_editorial.publications
 for update to portfolio_editorial_executor using(true) with check(true);

create function portfolio_editorial.enforce_publication_retention()
returns trigger language plpgsql security definer set search_path='' as $$ begin
 with keep as materialized(
  select candidate.id from portfolio_editorial.publications candidate
  cross join portfolio_editorial.site_state s
  order by(candidate.id=s.active_publication_id) desc,candidate.sequence desc limit 10
 )
 update portfolio_editorial.publications p set retained=(p.id in(select id from keep));
 return new;
end $$;
create trigger enforce_publication_retention after update of active_publication_id on portfolio_editorial.site_state
 for each statement execute function portfolio_editorial.enforce_publication_retention();

create function portfolio_editorial.list_history(actor uuid)
returns jsonb language plpgsql stable security definer set search_path='' as $$
begin
 actor:=portfolio_editorial.require_editorial_admin(actor);
 return coalesce((select jsonb_agg(jsonb_build_object('publicationId',p.id,'sequence',p.sequence,
  'createdAt',p.created_at,'sourceRevision',p.source_revision,'retained',p.retained,
  'active',s.active_publication_id=p.id) order by p.sequence desc)
  from portfolio_editorial.publications p cross join portfolio_editorial.site_state s
  where p.retained or s.active_publication_id=p.id),'[]'::jsonb);
end $$;

create function portfolio_editorial.restore_publication(source_id uuid,expected_revision bigint,operation_id uuid,actor uuid)
returns jsonb language plpgsql security definer set search_path='' as $$
declare current_revision bigint;existing portfolio_editorial.operations%rowtype;request_hash text;snapshot jsonb;receipt jsonb;
 locale record;entity record;translation record;
begin
 actor:=portfolio_editorial.require_editorial_admin(actor);
 request_hash:=encode(extensions.digest(jsonb_build_object('source',source_id,'revision',expected_revision)::text,'sha256'),'hex');
 select * into existing from portfolio_editorial.operations o where o.operation_id=restore_publication.operation_id;
 if found then if existing.actor_id<>actor or existing.request_hash<>request_hash or existing.type<>'restore' then raise exception 'operation id already used' using errcode='23505';end if;return existing.result||jsonb_build_object('repeated',true);end if;
 select revision into current_revision from portfolio_editorial.draft where id=1 for update;
 if current_revision<>expected_revision then raise exception 'revision conflict' using errcode='40001';end if;
 select p.snapshot into snapshot from portfolio_editorial.publications p where p.id=source_id and p.retained;
 if snapshot is null then raise exception 'retained publication unavailable' using errcode='22023';end if;
 set constraints all deferred;
 delete from portfolio_editorial.draft_media_refs where draft_id=1;delete from portfolio_editorial.draft_translations where draft_id=1;delete from portfolio_editorial.draft_entities where draft_id=1;delete from portfolio_editorial.draft_locales where draft_id=1 and code<>'pt-BR';
 for locale in select value from jsonb_array_elements(snapshot->'locales') loop insert into portfolio_editorial.draft_locales(draft_id,code,label,direction,status,position) values(1,locale.value->>'code',locale.value->>'label',locale.value->>'direction','active',(locale.value->>'position')::int) on conflict(draft_id,code) do update set label=excluded.label,direction=excluded.direction,status='active',position=excluded.position;end loop;
 for entity in select key,value from jsonb_each(snapshot->'entities') loop insert into portfolio_editorial.draft_entities(draft_id,id,kind,parent_id,position,data) values(1,entity.key,entity.value->>'kind',entity.value->>'parentId',(entity.value->>'position')::int,entity.value->'data');end loop;
 for locale in select key,value from jsonb_each(snapshot->'translations') loop for translation in select key,value from jsonb_each(locale.value) loop insert into portfolio_editorial.draft_translations(draft_id,entity_id,locale_code,fields) values(1,translation.key,locale.key,translation.value);end loop;end loop;
 current_revision:=current_revision+1;update portfolio_editorial.draft set revision=current_revision,base_publication_id=source_id,updated_at=now() where id=1;
 receipt:=jsonb_build_object('operationId',operation_id,'revision',current_revision,'sourcePublicationId',source_id,'repeated',false);
 insert into portfolio_editorial.operations(operation_id,actor_id,type,request_hash,revision,result) values(operation_id,actor,'restore',request_hash,current_revision,receipt);return receipt;
end $$;

create function public.get_editor_history() returns jsonb language sql stable security definer set search_path='' as $$ select portfolio_editorial.list_history(coalesce(nullif(current_setting('request.jwt.claim.sub',true),''),nullif(current_setting('request.jwt.claims',true),'')::jsonb->>'sub')::uuid) $$;
create function public.restore_editor_publication(publication_id uuid,expected_revision bigint,operation_id uuid) returns jsonb language sql security definer set search_path='' as $$ select portfolio_editorial.restore_publication(publication_id,expected_revision,operation_id,coalesce(nullif(current_setting('request.jwt.claim.sub',true),''),nullif(current_setting('request.jwt.claims',true),'')::jsonb->>'sub')::uuid) $$;
revoke all on function portfolio_editorial.enforce_publication_retention(),portfolio_editorial.list_history(uuid),portfolio_editorial.restore_publication(uuid,bigint,uuid,uuid) from public,anon,authenticated,service_role;
revoke all on function public.get_editor_history(),public.restore_editor_publication(uuid,bigint,uuid) from public,anon;
grant execute on function public.get_editor_history(),public.restore_editor_publication(uuid,bigint,uuid) to authenticated;
grant create on schema portfolio_editorial to portfolio_editorial_executor;
alter function portfolio_editorial.enforce_publication_retention() owner to portfolio_editorial_executor;
alter function portfolio_editorial.list_history(uuid) owner to portfolio_editorial_executor;alter function portfolio_editorial.restore_publication(uuid,bigint,uuid,uuid) owner to portfolio_editorial_executor;
grant create on schema public to portfolio_editorial_executor;alter function public.get_editor_history() owner to portfolio_editorial_executor;alter function public.restore_editor_publication(uuid,bigint,uuid) owner to portfolio_editorial_executor;revoke create on schema public from portfolio_editorial_executor;revoke create on schema portfolio_editorial from portfolio_editorial_executor;
