-- Finalize a sanitized SVG without exposing portfolio_editorial.media to
-- PostgREST/service_role direct table access.

create or replace function public.finalize_validated_editorial_svg(
  expected_revision bigint,
  requested_media_id uuid,
  requested_actor uuid,
  sanitized_path text,
  sanitized_bytes bigint,
  sanitized_checksum text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor uuid;
  item portfolio_editorial.media%rowtype;
  object_mime text;
  object_bytes bigint;
  expected_path text;
begin
  actor := portfolio_editorial.require_editorial_admin(requested_actor);

  select * into item
    from portfolio_editorial.media
   where id = requested_media_id
   for update;

  if not found
     or item.actor_id <> actor
     or item.revision <> expected_revision
     or item.status <> 'pending'
     or item.purpose <> 'skill_icon'
     or item.bucket <> 'editorial-skill-icons'
     or item.mime <> 'image/svg+xml' then
    raise exception 'media reservation unavailable' using errcode = '22023';
  end if;

  expected_path := item.actor_id::text || '/sanitized-' || item.id::text || '.svg';
  if sanitized_path is null or sanitized_path <> expected_path then
    raise exception 'invalid sanitized media path' using errcode = '22023';
  end if;
  if sanitized_bytes is null or sanitized_bytes <= 0 or sanitized_bytes > 1048576
     or sanitized_checksum is null
     or sanitized_checksum !~ '^[0-9a-f]{64}$' then
    raise exception 'invalid sanitized media metadata' using errcode = '22023';
  end if;

  select metadata ->> 'mimetype', (metadata ->> 'size')::bigint
    into object_mime, object_bytes
    from storage.objects
   where bucket_id = item.bucket
     and name = expected_path;

  if not found
     or object_mime <> 'image/svg+xml'
     or object_bytes <> sanitized_bytes then
    raise exception 'stored sanitized object metadata mismatch' using errcode = '22023';
  end if;

  update portfolio_editorial.media
     set path = expected_path,
         mime = 'image/svg+xml',
         bytes = object_bytes,
         checksum = sanitized_checksum,
         status = 'ready',
         updated_at = now()
   where id = item.id
     and status = 'pending';

  return jsonb_build_object(
    'media_id', item.id,
    'status', 'ready',
    'path', expected_path,
    'checksum', sanitized_checksum
  );
end;
$$;

revoke all on function public.finalize_validated_editorial_svg(bigint, uuid, uuid, text, bigint, text)
  from public, anon, authenticated, service_role;
grant execute on function public.finalize_validated_editorial_svg(bigint, uuid, uuid, text, bigint, text)
  to service_role;

grant create on schema public to portfolio_editorial_executor;
alter function public.finalize_validated_editorial_svg(bigint, uuid, uuid, text, bigint, text)
  owner to portfolio_editorial_executor;
revoke create on schema public from portfolio_editorial_executor;
