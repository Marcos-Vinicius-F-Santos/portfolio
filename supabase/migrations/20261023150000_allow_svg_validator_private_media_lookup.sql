-- Let the SVG validator inspect one private media reservation without exposing
-- portfolio_editorial.media through PostgREST.

create or replace function public.get_pending_editorial_media(
  requested_media_id uuid,
  expected_revision bigint,
  requested_actor uuid
)
returns table(
  id uuid,
  actor_id uuid,
  revision bigint,
  bucket text,
  path text,
  status text,
  purpose text
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor uuid;
begin
  actor := portfolio_editorial.require_editorial_admin(requested_actor);

  return query
  select m.id, m.actor_id, m.revision, m.bucket, m.path, m.status, m.purpose
    from portfolio_editorial.media m
   where m.id = requested_media_id
     and m.actor_id = actor
     and m.revision = expected_revision
     and m.status = 'pending'
     and m.purpose = 'skill_icon';
end;
$$;

revoke all on function public.get_pending_editorial_media(uuid, bigint, uuid)
  from public, anon, authenticated, service_role;
grant execute on function public.get_pending_editorial_media(uuid, bigint, uuid)
  to service_role;
grant create on schema public to portfolio_editorial_executor;
alter function public.get_pending_editorial_media(uuid, bigint, uuid)
  owner to portfolio_editorial_executor;
revoke create on schema public from portfolio_editorial_executor;
