-- The editorial executor validates the uploaded object's metadata before a
-- reservation can become ready. Keep that access private to the definer role
-- and limited to objects represented by an editorial media row.
grant usage on schema storage to portfolio_editorial_executor;
grant select on storage.objects to portfolio_editorial_executor;

drop policy if exists editorial_media_executor_select on storage.objects;
create policy editorial_media_executor_select
  on storage.objects for select to portfolio_editorial_executor
  using (
    exists (
      select 1
      from portfolio_editorial.media m
      where m.bucket = bucket_id
        and m.path = name
        and m.status in ('pending', 'ready')
    )
  );
