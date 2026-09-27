do $$
begin
  if (select count(*) from storage.buckets where id like 'editorial-%' and not public) <> 3 then
    raise exception 'private editorial buckets missing';
  end if;
  if exists (
    select 1 from storage.buckets
    where id in ('editorial-project-images','editorial-skill-icons')
      and (file_size_limit <> 1048576 or allowed_mime_types && array['image/svg+xml'])
  ) then raise exception 'image limits or SVG gate are invalid'; end if;
  if has_table_privilege('anon', 'portfolio_editorial.media', 'select')
    or has_table_privilege('authenticated', 'portfolio_editorial.media', 'select') then
    raise exception 'private media table leaked';
  end if;
  if has_function_privilege('anon', 'public.reserve_editorial_media(bigint,text,text,text,bigint)', 'execute') then
    raise exception 'anon can reserve media';
  end if;
end
$$;

