-- Avoid PL/pgSQL parameter/column ambiguity in the media reference upsert.
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
  if associate_editorial_media.entity_id is null
     or associate_editorial_media.field_name not in ('projectImage', 'skillIcon', 'curriculum', 'profileImage')
     or associate_editorial_media.media_position < 0 then
    raise exception 'invalid media association' using errcode = '22023';
  end if;
  request_hash := encode(extensions.digest(jsonb_build_object(
    'entityId', associate_editorial_media.entity_id,
    'mediaId', associate_editorial_media.media_id,
    'field', associate_editorial_media.field_name,
    'position', associate_editorial_media.media_position
  )::text, 'sha256'), 'hex');
  select * into existing
  from portfolio_editorial.operations operations
  where operations.operation_id = associate_editorial_media.operation_id;
  if found then
    if existing.actor_id <> actor or existing.request_hash <> request_hash then
      raise exception 'operation id already used with another request' using errcode = '23505';
    end if;
    return existing.result || jsonb_build_object('repeated', true);
  end if;
  select revision into current_revision
  from portfolio_editorial.draft
  where portfolio_editorial.draft.id = 1
  for update;
  if current_revision <> associate_editorial_media.expected_revision then
    raise exception 'revision conflict' using errcode = '40001', detail = current_revision::text;
  end if;
  if not exists (
    select 1 from portfolio_editorial.draft_entities de
    where de.draft_id = 1 and de.id = associate_editorial_media.entity_id
  ) or not exists (
    select 1 from portfolio_editorial.media m
    where m.id = associate_editorial_media.media_id and m.draft_id = 1 and m.status = 'ready'
  ) then
    raise exception 'entity or ready media not found' using errcode = '22023';
  end if;
  insert into portfolio_editorial.draft_media_refs(draft_id, media_id, entity_id, field, position)
  values (1, associate_editorial_media.media_id, associate_editorial_media.entity_id, associate_editorial_media.field_name, associate_editorial_media.media_position)
  on conflict on constraint draft_media_refs_pkey do update set media_id = excluded.media_id;
  update portfolio_editorial.draft
  set revision = revision + 1, updated_at = now()
  where portfolio_editorial.draft.id = 1
  returning revision into current_revision;
  receipt = jsonb_build_object('operationId', associate_editorial_media.operation_id, 'revision', current_revision, 'repeated', false);
  insert into portfolio_editorial.operations(operation_id, actor_id, type, request_hash, revision, result)
  values (associate_editorial_media.operation_id, actor, 'draft_command', request_hash, current_revision, receipt);
  return receipt;
end $$;

revoke all on function public.associate_editorial_media(bigint, uuid, text, uuid, text, integer) from public, anon;
grant execute on function public.associate_editorial_media(bigint, uuid, text, uuid, text, integer) to authenticated;
