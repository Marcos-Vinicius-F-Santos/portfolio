-- Reconciliation for T-018: authenticated draft reader and stable technology associations.

grant select on portfolio_editorial.publications to portfolio_editorial_executor;
create policy publications_executor_select_for_draft on portfolio_editorial.publications
  for select to portfolio_editorial_executor using (true);

create function portfolio_editorial.read_draft(actor uuid)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare result jsonb; base jsonb;
begin
  actor := portfolio_editorial.require_editorial_admin(actor);
  select p.snapshot into base from portfolio_editorial.draft d
    left join portfolio_editorial.publications p on p.id=d.base_publication_id where d.id=1;
  select jsonb_build_object(
    'formatVersion',1,'revision',d.revision,'basePublicationId',d.base_publication_id,
    'defaultLocale',d.default_locale,
    'locales',(select coalesce(jsonb_agg(jsonb_build_object('code',code,'label',label,'direction',direction,'status',status,'position',position) order by position),'[]'::jsonb) from portfolio_editorial.draft_locales where draft_id=1),
    'sections',coalesce(base->'sections','[]'::jsonb),
    'entities',(select coalesce(jsonb_object_agg(id,jsonb_build_object('kind',kind,'position',position,'data',data)||case when parent_id is null then '{}'::jsonb else jsonb_build_object('parentId',parent_id) end),'{}'::jsonb) from portfolio_editorial.draft_entities where draft_id=1),
    'translations',(select coalesce(jsonb_object_agg(locale_code,items),'{}'::jsonb) from (select locale_code,jsonb_object_agg(entity_id,fields) items from portfolio_editorial.draft_translations where draft_id=1 group by locale_code) x),
    'technologies',(select coalesce(jsonb_object_agg(id,jsonb_build_object('label',label,'aliases',to_jsonb(aliases))||case when bundled_asset is null then '{}'::jsonb else jsonb_build_object('iconMediaId','asset-'||id) end),'{}'::jsonb) from portfolio_editorial.technologies),
    'media',coalesce(base->'media','{}'::jsonb)
  ) into result from portfolio_editorial.draft d where d.id=1;
  return result;
end $$;

create function public.get_editor_draft()
returns jsonb language sql security definer set search_path = '' as $$
  select portfolio_editorial.read_draft(coalesce(nullif(current_setting('request.jwt.claim.sub',true),''),nullif(current_setting('request.jwt.claims',true),'')::jsonb->>'sub')::uuid)
$$;

create function portfolio_editorial.set_draft_technologies(expected_revision bigint,operation_id uuid,entity_id text,technology_ids text[],actor uuid)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare current_revision bigint; existing portfolio_editorial.operations%rowtype; request_hash text; receipt jsonb;
begin
  actor:=portfolio_editorial.require_editorial_admin(actor);
  request_hash:=encode(extensions.digest(jsonb_build_object('type','set_technologies','entityId',entity_id,'technologyIds',technology_ids)::text,'sha256'),'hex');
  select * into existing from portfolio_editorial.operations where operations.operation_id=set_draft_technologies.operation_id;
  if found then
    if existing.actor_id<>actor or existing.request_hash<>request_hash then raise exception 'operation id already used with another request' using errcode='23505'; end if;
    return existing.result||jsonb_build_object('repeated',true);
  end if;
  select revision into current_revision from portfolio_editorial.draft where id=1 for update;
  if current_revision<>expected_revision then raise exception 'revision conflict' using errcode='40001',detail=current_revision::text; end if;
  if technology_ids is null or cardinality(technology_ids)<>cardinality(array(select distinct x from unnest(technology_ids) x))
    or not exists(select 1 from portfolio_editorial.draft_entities where draft_id=1 and id=entity_id and kind='project')
    or exists(select 1 from unnest(technology_ids) x where not exists(select 1 from portfolio_editorial.technologies t where t.id=x)) then
    raise exception 'invalid technology association' using errcode='22023';
  end if;
  update portfolio_editorial.draft_entities set data=jsonb_set(data,'{technologyIds}',to_jsonb(technology_ids),true) where draft_id=1 and id=entity_id;
  current_revision:=current_revision+1;
  update portfolio_editorial.draft set revision=current_revision,updated_at=now() where id=1;
  receipt:=jsonb_build_object('operationId',operation_id,'revision',current_revision,'repeated',false);
  insert into portfolio_editorial.operations(operation_id,actor_id,type,request_hash,revision,result) values(operation_id,actor,'draft_command',request_hash,current_revision,receipt);
  return receipt;
end $$;

create function public.set_editor_technologies(expected_revision bigint,operation_id uuid,entity_id text,technology_ids text[])
returns jsonb language sql security definer set search_path = '' as $$
  select portfolio_editorial.set_draft_technologies(expected_revision,operation_id,entity_id,technology_ids,
    coalesce(nullif(current_setting('request.jwt.claim.sub',true),''),nullif(current_setting('request.jwt.claims',true),'')::jsonb->>'sub')::uuid)
$$;

revoke all on function portfolio_editorial.read_draft(uuid),portfolio_editorial.set_draft_technologies(bigint,uuid,text,text[],uuid) from public,anon,authenticated,service_role;
revoke all on function public.get_editor_draft(),public.set_editor_technologies(bigint,uuid,text,text[]) from public,anon;
grant execute on function public.get_editor_draft(),public.set_editor_technologies(bigint,uuid,text,text[]) to authenticated;
grant create on schema portfolio_editorial to portfolio_editorial_executor;
alter function portfolio_editorial.read_draft(uuid) owner to portfolio_editorial_executor;
alter function portfolio_editorial.set_draft_technologies(bigint,uuid,text,text[],uuid) owner to portfolio_editorial_executor;
revoke create on schema portfolio_editorial from portfolio_editorial_executor;
grant create on schema public to portfolio_editorial_executor;
alter function public.get_editor_draft() owner to portfolio_editorial_executor;
alter function public.set_editor_technologies(bigint,uuid,text,text[]) owner to portfolio_editorial_executor;
revoke create on schema public from portfolio_editorial_executor;
