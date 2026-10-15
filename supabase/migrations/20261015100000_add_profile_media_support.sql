-- T-017: suporte à imagem pública de perfil no Storage editorial da instância.
-- O bucket continua isolado por projeto Supabase; somente a imagem publicada é pública.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'editorial-profile-images',
  'editorial-profile-images',
  true,
  3145728,
  array['image/png', 'image/jpeg', 'image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

alter table portfolio_editorial.draft_entities
  drop constraint if exists draft_entities_kind_check;
alter table portfolio_editorial.draft_entities
  add constraint draft_entities_kind_check check (kind in (
    'presentation', 'profile', 'about', 'result', 'experience', 'skillCategory', 'skill',
    'academic', 'project', 'contact', 'projectLink', 'projectImage', 'curriculum',
    'interfaceText', 'listItem'
  ));

alter table portfolio_editorial.media
  drop constraint if exists media_mime_bytes_check;

alter table portfolio_editorial.media
  add constraint media_mime_bytes_check check (
    (purpose = 'project_image' and bucket = 'editorial-project-images' and mime in ('image/png', 'image/jpeg', 'image/webp') and bytes <= 3145728)
    or (purpose = 'skill_icon' and bucket = 'editorial-skill-icons' and mime in ('image/png', 'image/jpeg', 'image/svg+xml') and bytes <= 1048576)
    or (purpose = 'curriculum' and bucket = 'editorial-curricula' and mime = 'application/pdf')
    or (purpose = 'profile_image' and bucket = 'editorial-profile-images' and mime in ('image/png', 'image/jpeg', 'image/webp') and bytes <= 3145728)
  );

alter table portfolio_editorial.draft_media_refs
  drop constraint if exists draft_media_refs_field_check;

alter table portfolio_editorial.draft_media_refs
  add constraint draft_media_refs_field_check
  check (field in ('projectImage', 'skillIcon', 'curriculum', 'profileImage'));

create or replace function portfolio_editorial.reserve_media(
  expected_revision bigint, purpose text, original_name text, mime text, bytes bigint, actor uuid
) returns table(media_id uuid, bucket text, path text)
language plpgsql security definer set search_path = '' as $$
declare
  current_revision bigint;
  new_id uuid := gen_random_uuid();
  chosen_bucket text;
  file_extension text;
begin
  actor := portfolio_editorial.require_editorial_admin(actor);
  select revision into current_revision from portfolio_editorial.draft where id = 1;
  if current_revision <> expected_revision then
    raise exception 'revision conflict' using errcode = '40001';
  end if;

  if purpose = 'project_image' and mime in ('image/png', 'image/jpeg', 'image/webp') and bytes between 1 and 3145728 then
    chosen_bucket := 'editorial-project-images';
  elsif purpose = 'skill_icon' and mime in ('image/png', 'image/jpeg', 'image/svg+xml') and bytes between 1 and 1048576 then
    chosen_bucket := 'editorial-skill-icons';
  elsif purpose = 'curriculum' and mime = 'application/pdf' and bytes > 0 then
    chosen_bucket := 'editorial-curricula';
  elsif purpose = 'profile_image' and mime in ('image/png', 'image/jpeg', 'image/webp') and bytes between 1 and 3145728 then
    chosen_bucket := 'editorial-profile-images';
  else
    raise exception 'invalid media type or size' using errcode = '22023';
  end if;

  file_extension := case mime
    when 'image/png' then '.png'
    when 'image/jpeg' then '.jpg'
    when 'image/webp' then '.webp'
    when 'image/svg+xml' then '.svg'
    else '.pdf'
  end;

  media_id := new_id;
  bucket := chosen_bucket;
  path := actor::text || '/' || new_id::text || file_extension;

  insert into portfolio_editorial.media(
    id, revision, actor_id, purpose, bucket, path, original_name, mime, bytes
  ) values (
    media_id, expected_revision, actor, purpose, bucket, path, original_name, mime, bytes
  );

  return next;
end $$;

create or replace function public.associate_editorial_media(
  expected_revision bigint, operation_id uuid, entity_id text, media_id uuid, field_name text, media_position integer default 0
) returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  actor uuid;
  current_revision bigint;
  existing portfolio_editorial.operations%rowtype;
  request_hash text;
  receipt jsonb;
begin
  actor := portfolio_editorial.require_editorial_admin(coalesce(
    nullif(current_setting('request.jwt.claim.sub', true), ''),
    nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub'
  )::uuid);
  if entity_id is null or field_name not in ('projectImage', 'skillIcon', 'curriculum', 'profileImage') or media_position < 0 then
    raise exception 'invalid media association' using errcode = '22023';
  end if;
  request_hash := encode(extensions.digest(jsonb_build_object(
    'entityId', entity_id, 'mediaId', media_id, 'field', field_name, 'position', media_position
  )::text, 'sha256'), 'hex');
  select * into existing from portfolio_editorial.operations where operations.operation_id = associate_editorial_media.operation_id;
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
  if not exists (
    select 1
    from portfolio_editorial.draft_entities de
    where de.draft_id = 1 and de.id = associate_editorial_media.entity_id
  )
     or not exists (
       select 1
       from portfolio_editorial.media m
       where m.id = associate_editorial_media.media_id
         and m.draft_id = 1
         and m.status = 'ready'
     ) then
    raise exception 'entity or ready media not found' using errcode = '22023';
  end if;
  insert into portfolio_editorial.draft_media_refs(draft_id, media_id, entity_id, field, position)
  values (1, media_id, entity_id, field_name, media_position)
  on conflict (draft_id, entity_id, field, position) do update set media_id = excluded.media_id;
  update portfolio_editorial.draft set revision = revision + 1, updated_at = now() where id = 1 returning revision into current_revision;
  receipt = jsonb_build_object('operationId', operation_id, 'revision', current_revision, 'repeated', false);
  insert into portfolio_editorial.operations(operation_id, actor_id, type, request_hash, revision, result)
  values (operation_id, actor, 'draft_command', request_hash, current_revision, receipt);
  return receipt;
end $$;

create or replace function portfolio_editorial.build_publication_content()
returns jsonb language plpgsql stable security definer set search_path = '' as $$
declare
  base_snapshot jsonb;
  result jsonb;
begin
  select p.snapshot into base_snapshot
  from portfolio_editorial.draft d
  left join portfolio_editorial.publications p on p.id = d.base_publication_id
  where d.id = 1;
  select jsonb_build_object(
    'formatVersion', 1,
    'defaultLocale', 'pt-BR',
    'locales', coalesce((select jsonb_agg(jsonb_build_object('code', code, 'label', label, 'direction', direction, 'position', position) order by position)
      from portfolio_editorial.draft_locales where draft_id = 1 and status = 'active'), '[]'::jsonb),
    'sections', coalesce(base_snapshot->'sections', '[]'::jsonb),
    'entities', coalesce((select jsonb_object_agg(id, jsonb_strip_nulls(jsonb_build_object('kind', kind, 'parentId', parent_id, 'position', position, 'data', data)) order by id)
      from portfolio_editorial.draft_entities where draft_id = 1), '{}'::jsonb),
    'translations', coalesce((select jsonb_object_agg(locale_code, items order by locale_code) from (
      select t.locale_code, jsonb_object_agg(t.entity_id, t.fields order by t.entity_id) items
      from portfolio_editorial.draft_translations t
      join portfolio_editorial.draft_locales l on l.draft_id = t.draft_id and l.code = t.locale_code and l.status = 'active'
      where t.draft_id = 1 group by t.locale_code
    ) x), '{}'::jsonb),
    'technologies', coalesce(base_snapshot->'technologies', '{}'::jsonb),
    'media', coalesce(base_snapshot->'media', '{}'::jsonb) || coalesce((select jsonb_object_agg(m.id::text,
      jsonb_build_object('source', 'managed', 'mime', m.mime, 'bytes', m.bytes, 'assetPath', m.path) order by m.id)
      from portfolio_editorial.media m
      join portfolio_editorial.draft_media_refs r on r.media_id = m.id
      where r.draft_id = 1 and m.status = 'ready'), '{}'::jsonb)
  ) into result;
  return result;
end $$;

grant usage on schema storage to portfolio_editorial_executor;
grant select on storage.objects to portfolio_editorial_executor;

drop policy if exists editorial_media_executor_select on storage.objects;
create policy editorial_media_executor_select
  on storage.objects for select to portfolio_editorial_executor
  using (exists (
    select 1 from portfolio_editorial.media m
    where m.bucket = bucket_id and m.path = name and m.status in ('pending', 'ready')
  ));

alter function portfolio_editorial.reserve_media(bigint, text, text, text, bigint, uuid) owner to portfolio_editorial_executor;
alter function portfolio_editorial.build_publication_content() owner to portfolio_editorial_executor;

revoke all on function public.associate_editorial_media(bigint, uuid, text, uuid, text, integer) from public, anon;
grant execute on function public.associate_editorial_media(bigint, uuid, text, uuid, text, integer) to authenticated;
