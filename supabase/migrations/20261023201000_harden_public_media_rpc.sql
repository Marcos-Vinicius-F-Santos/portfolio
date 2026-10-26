-- Keep the public RPC invoker-scoped. Only the private helper crosses the
-- editorial schema boundary with SECURITY DEFINER.

create or replace function public.get_public_media_reference(
  media_id uuid,
  publication_id uuid default null
)
returns table(bucket text, path text, mime text, bytes bigint)
language sql
stable
security invoker
set search_path = ''
as $$
  select *
    from portfolio_editorial.get_public_media_reference(media_id, publication_id)
$$;

grant usage on schema portfolio_editorial to anon, authenticated;
grant execute on function portfolio_editorial.get_public_media_reference(uuid, uuid)
  to anon, authenticated;
grant execute on function public.get_public_media_reference(uuid, uuid)
  to anon, authenticated;

alter function public.get_public_media_reference(uuid, uuid)
  owner to portfolio_editorial_executor;

