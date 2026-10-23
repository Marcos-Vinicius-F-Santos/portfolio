-- The SVG validator reads the sanitized object before finalizing the private
-- media row. Keep the lookup limited to the reservation's deterministic paths.

drop policy if exists editorial_media_executor_select on storage.objects;
create policy editorial_media_executor_select
  on storage.objects for select to portfolio_editorial_executor
  using (
    exists (
      select 1
      from portfolio_editorial.media m
      where m.bucket = bucket_id
        and m.status in ('pending', 'ready')
        and (
          m.path = name
          or name = m.actor_id::text || '/sanitized-' || m.id::text || '.svg'
        )
    )
  );
