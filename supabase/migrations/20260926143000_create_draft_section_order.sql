-- T-020: private, revisioned section order with presentation fixed first.
create table portfolio_editorial.draft_sections(
  draft_id smallint not null default 1 references portfolio_editorial.draft(id) on delete cascade,
  id text not null check(id ~ '^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$'),
  kind text not null check(kind in('presentation','about','results','experiences','skills','education','projects','contact')),
  position integer not null check(position>=0),
  primary key(draft_id,id), unique(draft_id,position), unique(draft_id,kind)
);
alter table portfolio_editorial.draft_sections enable row level security;
alter table portfolio_editorial.draft_sections force row level security;
grant select,insert,update,delete on portfolio_editorial.draft_sections to portfolio_editorial_executor;
create policy draft_sections_executor_all on portfolio_editorial.draft_sections for all to portfolio_editorial_executor using(true) with check(true);
insert into portfolio_editorial.draft_sections(draft_id,id,kind,position)
select 1,s.value->>'id',s.value->>'kind',(s.value->>'position')::integer
from portfolio_editorial.draft d join portfolio_editorial.publications p on p.id=d.base_publication_id
cross join lateral jsonb_array_elements(p.snapshot->'sections') s;

create function portfolio_editorial.set_section_order(expected_revision bigint,operation_id uuid,section_ids text[],actor uuid)
returns jsonb language plpgsql security definer set search_path='' as $$
declare current_revision bigint;existing portfolio_editorial.operations%rowtype;request_hash text;receipt jsonb;i integer;
begin
 actor:=portfolio_editorial.require_editorial_admin(actor);request_hash:=encode(extensions.digest(to_jsonb(section_ids)::text,'sha256'),'hex');
 select * into existing from portfolio_editorial.operations where operations.operation_id=set_section_order.operation_id;
 if found then if existing.actor_id<>actor or existing.request_hash<>request_hash then raise exception 'operation id already used' using errcode='23505';end if;return existing.result||jsonb_build_object('repeated',true);end if;
 select revision into current_revision from portfolio_editorial.draft where id=1 for update;
 if current_revision<>expected_revision then raise exception 'revision conflict' using errcode='40001';end if;
 if section_ids[1]<>'presentation-section' or cardinality(section_ids)<>(select count(*) from portfolio_editorial.draft_sections where draft_id=1)
  or cardinality(section_ids)<>cardinality(array(select distinct x from unnest(section_ids)x))
  or exists(select 1 from unnest(section_ids)x where not exists(select 1 from portfolio_editorial.draft_sections s where s.draft_id=1 and s.id=x)) then raise exception 'invalid section order' using errcode='22023';end if;
 update portfolio_editorial.draft_sections set position=position+1000 where draft_id=1;
 for i in 1..cardinality(section_ids) loop update portfolio_editorial.draft_sections set position=i-1 where draft_id=1 and id=section_ids[i];end loop;
 current_revision:=current_revision+1;update portfolio_editorial.draft set revision=current_revision,updated_at=now() where id=1;
 receipt:=jsonb_build_object('operationId',operation_id,'revision',current_revision,'repeated',false);
 insert into portfolio_editorial.operations(operation_id,actor_id,type,request_hash,revision,result)values(operation_id,actor,'draft_command',request_hash,current_revision,receipt);return receipt;
end $$;
create function public.set_editor_section_order(expected_revision bigint,operation_id uuid,section_ids text[])
returns jsonb language sql security definer set search_path='' as $$select portfolio_editorial.set_section_order(expected_revision,operation_id,section_ids,coalesce(nullif(current_setting('request.jwt.claim.sub',true),''),nullif(current_setting('request.jwt.claims',true),'')::jsonb->>'sub')::uuid)$$;

create or replace function portfolio_editorial.build_publication_content()
returns jsonb language plpgsql stable security definer set search_path='' as $$
declare base_snapshot jsonb;result jsonb;begin
 select p.snapshot into base_snapshot from portfolio_editorial.draft d left join portfolio_editorial.publications p on p.id=d.base_publication_id where d.id=1;
 select jsonb_build_object('formatVersion',1,'defaultLocale','pt-BR',
 'locales',coalesce((select jsonb_agg(jsonb_build_object('code',code,'label',label,'direction',direction,'position',position)order by position)from portfolio_editorial.draft_locales where draft_id=1 and status='active'),'[]'::jsonb),
 'sections',coalesce((select jsonb_agg(jsonb_build_object('id',id,'kind',kind,'position',position)order by position)from portfolio_editorial.draft_sections where draft_id=1),'[]'::jsonb),
 'entities',coalesce((select jsonb_object_agg(id,jsonb_strip_nulls(jsonb_build_object('kind',kind,'parentId',parent_id,'position',position,'data',data))order by id)from portfolio_editorial.draft_entities where draft_id=1),'{}'::jsonb),
 'translations',coalesce((select jsonb_object_agg(locale_code,items order by locale_code)from(select t.locale_code,jsonb_object_agg(t.entity_id,t.fields order by t.entity_id)items from portfolio_editorial.draft_translations t join portfolio_editorial.draft_locales l on l.draft_id=t.draft_id and l.code=t.locale_code and l.status='active' where t.draft_id=1 group by t.locale_code)x),'{}'::jsonb),
 'technologies',coalesce(base_snapshot->'technologies','{}'::jsonb),
 'media',coalesce(base_snapshot->'media','{}'::jsonb)||coalesce((select jsonb_object_agg(m.id::text,jsonb_build_object('source','managed','mime',m.mime,'bytes',m.bytes)order by m.id)from portfolio_editorial.media m join portfolio_editorial.draft_media_refs r on r.media_id=m.id where r.draft_id=1 and m.status='ready'),'{}'::jsonb))into result;return result;end$$;

create or replace function portfolio_editorial.read_draft(actor uuid)
returns jsonb language plpgsql security definer set search_path='' as $$
declare result jsonb;base jsonb;begin actor:=portfolio_editorial.require_editorial_admin(actor);select p.snapshot into base from portfolio_editorial.draft d left join portfolio_editorial.publications p on p.id=d.base_publication_id where d.id=1;
 select jsonb_build_object('formatVersion',1,'revision',d.revision,'basePublicationId',d.base_publication_id,'defaultLocale',d.default_locale,
 'locales',(select coalesce(jsonb_agg(jsonb_build_object('code',code,'label',label,'direction',direction,'status',status,'position',position)order by position),'[]'::jsonb)from portfolio_editorial.draft_locales where draft_id=1),
 'sections',(select coalesce(jsonb_agg(jsonb_build_object('id',id,'kind',kind,'position',position)order by position),'[]'::jsonb)from portfolio_editorial.draft_sections where draft_id=1),
 'entities',(select coalesce(jsonb_object_agg(id,jsonb_build_object('kind',kind,'position',position,'data',data)||case when parent_id is null then'{}'::jsonb else jsonb_build_object('parentId',parent_id)end),'{}'::jsonb)from portfolio_editorial.draft_entities where draft_id=1),
 'translations',(select coalesce(jsonb_object_agg(locale_code,items),'{}'::jsonb)from(select locale_code,jsonb_object_agg(entity_id,fields)items from portfolio_editorial.draft_translations where draft_id=1 group by locale_code)x),
 'technologies',base->'technologies','media',coalesce(base->'media','{}'::jsonb))into result from portfolio_editorial.draft d where d.id=1;return result;end$$;

create function portfolio_editorial.sync_draft_sections_from_base()returns trigger language plpgsql security definer set search_path='' as $$begin
 if new.base_publication_id is distinct from old.base_publication_id or tg_op='UPDATE' then delete from portfolio_editorial.draft_sections where draft_id=new.id;insert into portfolio_editorial.draft_sections(draft_id,id,kind,position)select new.id,s.value->>'id',s.value->>'kind',(s.value->>'position')::integer from portfolio_editorial.publications p cross join lateral jsonb_array_elements(p.snapshot->'sections')s where p.id=new.base_publication_id;end if;return new;end$$;
create trigger sync_draft_sections after update of base_publication_id on portfolio_editorial.draft for each row execute function portfolio_editorial.sync_draft_sections_from_base();

revoke all on portfolio_editorial.draft_sections from public,anon,authenticated,service_role;
revoke all on function portfolio_editorial.set_section_order(bigint,uuid,text[],uuid),portfolio_editorial.sync_draft_sections_from_base() from public,anon,authenticated,service_role;
revoke all on function public.set_editor_section_order(bigint,uuid,text[]) from public,anon;
grant execute on function public.set_editor_section_order(bigint,uuid,text[]) to authenticated;
alter table portfolio_editorial.draft_sections owner to portfolio_editorial_owner;
grant create on schema portfolio_editorial to portfolio_editorial_executor;alter function portfolio_editorial.set_section_order(bigint,uuid,text[],uuid)owner to portfolio_editorial_executor;alter function portfolio_editorial.sync_draft_sections_from_base()owner to portfolio_editorial_executor;revoke create on schema portfolio_editorial from portfolio_editorial_executor;
grant create on schema public to portfolio_editorial_executor;alter function public.set_editor_section_order(bigint,uuid,text[])owner to portfolio_editorial_executor;revoke create on schema public from portfolio_editorial_executor;
