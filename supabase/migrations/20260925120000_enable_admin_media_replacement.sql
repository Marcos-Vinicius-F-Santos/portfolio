grant delete on storage.objects to authenticated;

create policy storage_admin_delete
  on storage.objects for delete
  to authenticated
  using (
    bucket_id in ('project-images', 'curricula')
    and exists (
      select 1
      from public.portfolio_admins
      where user_id = (select auth.uid())
    )
  );

create or replace function public.replace_portfolio_project_image(
  p_image_id uuid,
  p_storage_path text,
  p_original_name text,
  p_mime_type text,
  p_size_bytes bigint
)
returns text
language plpgsql
set search_path = public
as $$
declare
  previous_storage_path text;
begin
  select storage_path
    into previous_storage_path
    from public.portfolio_project_images
   where id = p_image_id
   for update;

  if previous_storage_path is null then
    raise exception 'Project image not found';
  end if;

  update public.portfolio_project_images
     set storage_path = p_storage_path,
         original_name = p_original_name,
         mime_type = p_mime_type,
         size_bytes = p_size_bytes
   where id = p_image_id;

  return previous_storage_path;
end;
$$;

create or replace function public.replace_portfolio_curriculum(
  p_locale text,
  p_storage_path text,
  p_original_name text,
  p_mime_type text,
  p_size_bytes bigint
)
returns text
language plpgsql
set search_path = public
as $$
declare
  previous_storage_path text;
begin
  select storage_path
    into previous_storage_path
    from public.portfolio_files
   where file_type = 'curriculum'
     and locale = p_locale
   for update;

  if previous_storage_path is null then
    raise exception 'Curriculum not found';
  end if;

  update public.portfolio_files
     set storage_path = p_storage_path,
         original_name = p_original_name,
         mime_type = p_mime_type,
         size_bytes = p_size_bytes
   where file_type = 'curriculum'
     and locale = p_locale;

  return previous_storage_path;
end;
$$;

revoke execute on function public.replace_portfolio_project_image(uuid, text, text, text, bigint) from public, anon;
revoke execute on function public.replace_portfolio_curriculum(text, text, text, text, bigint) from public, anon;
grant execute on function public.replace_portfolio_project_image(uuid, text, text, text, bigint) to authenticated;
grant execute on function public.replace_portfolio_curriculum(text, text, text, text, bigint) to authenticated;

-- Rollback:
-- drop function if exists public.replace_portfolio_project_image(uuid, text, text, text, bigint);
-- drop function if exists public.replace_portfolio_curriculum(text, text, text, text, bigint);
-- drop policy if exists storage_admin_delete on storage.objects;
-- revoke delete on storage.objects from authenticated;
