-- ADR-012: centralize creation and editing of the shared editorial skill catalog.

alter table portfolio_editorial.media drop constraint if exists media_check;
alter table portfolio_editorial.media
  add constraint media_mime_bytes_check check (
    (purpose = 'project_image' and bucket = 'editorial-project-images' and mime in ('image/png', 'image/jpeg') and bytes <= 1048576)
    or (purpose = 'skill_icon' and bucket = 'editorial-skill-icons' and mime in ('image/png', 'image/jpeg', 'image/svg+xml') and bytes <= 1048576)
    or (purpose = 'curriculum' and bucket = 'editorial-curricula' and mime = 'application/pdf')
  );

create or replace function public.get_editorial_technology_catalog()
returns jsonb
language plpgsql security definer set search_path = '' as $$
declare actor uuid; result jsonb;
begin
  actor := portfolio_editorial.require_editorial_admin(
    coalesce(nullif(current_setting('request.jwt.claim.sub', true), ''),
      nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub')::uuid);
  select coalesce(jsonb_agg(jsonb_build_object(
    'id', t.id,
    'label', t.label,
    'bundledAsset', t.bundled_asset,
    'iconMediaId', t.icon_media_id,
    'iconBucket', m.bucket,
    'iconPath', m.path,
    'iconMime', m.mime
  ) order by lower(t.label), t.id), '[]'::jsonb)
  into result
  from portfolio_editorial.technologies t
  left join portfolio_editorial.media m
    on m.id = t.icon_media_id and m.status = 'ready';
  return result;
end $$;

create or replace function public.update_editorial_technology(
  expected_revision bigint,
  operation_id uuid,
  technology_id text,
  technology_label text,
  icon_media_id uuid default null
)
returns jsonb
language plpgsql security definer set search_path = '' as $$
declare actor uuid; current_revision bigint; existing portfolio_editorial.operations%rowtype;
  request_hash text; receipt jsonb;
begin
  actor := portfolio_editorial.require_editorial_admin(
    coalesce(nullif(current_setting('request.jwt.claim.sub', true), ''),
      nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub')::uuid);
  if technology_id is null or technology_id !~ '^[a-z0-9][a-z0-9._:-]{0,127}$'
    or technology_label is null or length(trim(technology_label)) = 0 then
    raise exception 'invalid technology' using errcode = '22023';
  end if;
  if icon_media_id is not null and not exists (
    select 1 from portfolio_editorial.media
    where id = icon_media_id and actor_id = actor and status = 'ready' and purpose = 'skill_icon'
  ) then raise exception 'invalid skill icon' using errcode = '22023'; end if;
  request_hash := encode(extensions.digest(jsonb_build_object(
    'id', technology_id, 'label', trim(technology_label), 'icon', icon_media_id
  )::text, 'sha256'), 'hex');
  select * into existing from portfolio_editorial.operations
    where operations.operation_id = update_editorial_technology.operation_id;
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
  update portfolio_editorial.technologies
    set label = trim(technology_label), icon_media_id = update_editorial_technology.icon_media_id,
        updated_at = now()
    where id = update_editorial_technology.technology_id;
  if not found then raise exception 'technology not found' using errcode = '22023'; end if;
  update portfolio_editorial.draft set revision = revision + 1, updated_at = now()
    where id = 1 returning revision into current_revision;
  receipt := jsonb_build_object('operationId', operation_id, 'revision', current_revision, 'repeated', false);
  insert into portfolio_editorial.operations(operation_id, actor_id, type, request_hash, revision, result)
    values(operation_id, actor, 'draft_command', request_hash, current_revision, receipt);
  return receipt;
end $$;

revoke all on function public.get_editorial_technology_catalog() from public, anon;
grant execute on function public.get_editorial_technology_catalog() to authenticated;
revoke all on function public.update_editorial_technology(bigint, uuid, text, text, uuid) from public, anon;
grant execute on function public.update_editorial_technology(bigint, uuid, text, text, uuid) to authenticated;
