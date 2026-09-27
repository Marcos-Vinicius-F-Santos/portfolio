-- ADR-011: shared technology catalog with an optional managed icon.
alter table portfolio_editorial.technologies
  add column if not exists icon_media_id uuid references portfolio_editorial.media(id) on delete set null;

update storage.buckets set allowed_mime_types = array['image/png','image/jpeg','image/svg+xml']
where id = 'editorial-skill-icons';

create or replace function portfolio_editorial.reserve_media(
  expected_revision bigint, purpose text, original_name text, mime text, bytes bigint, actor uuid
) returns table(media_id uuid, bucket text, path text)
language plpgsql security definer set search_path = '' as $$
declare current_revision bigint; new_id uuid := gen_random_uuid(); chosen_bucket text; file_extension text;
begin
  actor := portfolio_editorial.require_editorial_admin(actor);
  select revision into current_revision from portfolio_editorial.draft where id=1;
  if current_revision <> expected_revision then raise exception 'revision conflict' using errcode='40001'; end if;
  if purpose='project_image' and mime in ('image/png','image/jpeg') and bytes between 1 and 1048576 then chosen_bucket='editorial-project-images';
  elsif purpose='skill_icon' and mime in ('image/png','image/jpeg','image/svg+xml') and bytes between 1 and 1048576 then chosen_bucket='editorial-skill-icons';
  elsif purpose='curriculum' and mime='application/pdf' and bytes>0 then chosen_bucket='editorial-curricula';
  else raise exception 'invalid media type or size' using errcode='22023'; end if;
  file_extension := case mime when 'image/png' then '.png' when 'image/jpeg' then '.jpg' when 'image/svg+xml' then '.svg' else '.pdf' end;
  media_id=new_id; bucket=chosen_bucket; path=actor::text||'/'||new_id::text||file_extension;
  insert into portfolio_editorial.media(id,revision,actor_id,purpose,bucket,path,original_name,mime,bytes) values(media_id,expected_revision,actor,purpose,bucket,path,original_name,mime,bytes);
  return next;
end $$;

create or replace function public.create_editorial_technology(
  expected_revision bigint, operation_id uuid, technology_id text, technology_label text, icon_media_id uuid default null
) returns jsonb language plpgsql security definer set search_path = '' as $$
declare actor uuid; current_revision bigint; existing portfolio_editorial.operations%rowtype; request_hash text; receipt jsonb;
begin
  actor := portfolio_editorial.require_editorial_admin(coalesce(nullif(current_setting('request.jwt.claim.sub',true),''),nullif(current_setting('request.jwt.claims',true),'')::jsonb->>'sub')::uuid);
  if technology_id is null or technology_id !~ '^[a-z0-9][a-z0-9._:-]{0,127}$' or technology_label is null or length(trim(technology_label))=0 then raise exception 'invalid technology' using errcode='22023'; end if;
  if icon_media_id is not null and not exists(select 1 from portfolio_editorial.media where id=icon_media_id and actor_id=actor and status='ready' and purpose='skill_icon') then raise exception 'invalid skill icon' using errcode='22023'; end if;
  request_hash := encode(extensions.digest(jsonb_build_object('id',technology_id,'label',technology_label,'icon',icon_media_id)::text,'sha256'),'hex');
  select * into existing from portfolio_editorial.operations where operations.operation_id=create_editorial_technology.operation_id;
  if found then if existing.actor_id<>actor or existing.request_hash<>request_hash then raise exception 'operation id already used with another request' using errcode='23505'; end if; return existing.result||jsonb_build_object('repeated',true); end if;
  select revision into current_revision from portfolio_editorial.draft where id=1 for update;
  if current_revision<>expected_revision then raise exception 'revision conflict' using errcode='40001',detail=current_revision::text; end if;
  insert into portfolio_editorial.technologies(id,label,icon_media_id) values(technology_id,technology_label,icon_media_id);
  update portfolio_editorial.draft set revision=revision+1,updated_at=now() where id=1 returning revision into current_revision;
  receipt=jsonb_build_object('operationId',operation_id,'revision',current_revision,'repeated',false);
  insert into portfolio_editorial.operations(operation_id,actor_id,type,request_hash,revision,result) values(operation_id,actor,'draft_command',request_hash,current_revision,receipt);
  return receipt;
end $$;
revoke all on function public.create_editorial_technology(bigint,uuid,text,text,uuid) from public,anon;
grant execute on function public.create_editorial_technology(bigint,uuid,text,text,uuid) to authenticated;

create or replace function portfolio_editorial.read_draft(actor uuid)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare result jsonb; base jsonb;
begin
  actor := portfolio_editorial.require_editorial_admin(actor);
  select p.snapshot into base from portfolio_editorial.draft d left join portfolio_editorial.publications p on p.id=d.base_publication_id where d.id=1;
  select jsonb_build_object(
    'formatVersion',1,'revision',d.revision,'basePublicationId',d.base_publication_id,'defaultLocale',d.default_locale,
    'locales',(select coalesce(jsonb_agg(jsonb_build_object('code',code,'label',label,'direction',direction,'status',status,'position',position) order by position),'[]'::jsonb) from portfolio_editorial.draft_locales where draft_id=1),
    'sections',coalesce(base->'sections','[]'::jsonb),
    'entities',(select coalesce(jsonb_object_agg(id,jsonb_build_object('kind',kind,'position',position,'data',data)||case when parent_id is null then '{}'::jsonb else jsonb_build_object('parentId',parent_id) end),'{}'::jsonb) from portfolio_editorial.draft_entities where draft_id=1),
    'translations',(select coalesce(jsonb_object_agg(locale_code,items),'{}'::jsonb) from (select locale_code,jsonb_object_agg(entity_id,fields) items from portfolio_editorial.draft_translations where draft_id=1 group by locale_code)x),
    'technologies',(select coalesce(jsonb_object_agg(id,jsonb_build_object('label',label,'aliases',to_jsonb(aliases))||case when icon_media_id is not null then jsonb_build_object('iconMediaId',icon_media_id::text) when bundled_asset is not null then jsonb_build_object('iconMediaId','asset-'||id) else '{}'::jsonb end),'{}'::jsonb) from portfolio_editorial.technologies),
    'media',coalesce(base->'media','{}'::jsonb)
  ) into result from portfolio_editorial.draft d where d.id=1;
  return result;
end $$;
