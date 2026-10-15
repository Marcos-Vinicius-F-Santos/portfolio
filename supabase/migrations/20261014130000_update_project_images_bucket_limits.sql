-- ADR-015: Support WebP and 3 MB media limits for project images in public and editorial storage.

-- 1. Storage buckets configuration
update storage.buckets
set allowed_mime_types = array['image/png', 'image/jpeg', 'image/webp'],
    file_size_limit = 3145728
where id in ('project-images', 'editorial-project-images');

-- 2. Public portfolio_project_images table constraints
alter table public.portfolio_project_images
  drop constraint if exists portfolio_project_images_mime_type_check;

alter table public.portfolio_project_images
  add constraint portfolio_project_images_mime_type_check
  check (mime_type in ('image/png', 'image/jpeg', 'image/webp'));

alter table public.portfolio_project_images
  drop constraint if exists portfolio_project_images_size_bytes_check;

alter table public.portfolio_project_images
  add constraint portfolio_project_images_size_bytes_check
  check (size_bytes > 0 and size_bytes <= 3145728);

-- 3. Private editorial media constraints
alter table portfolio_editorial.media
  drop constraint if exists media_mime_bytes_check;

alter table portfolio_editorial.media
  add constraint media_mime_bytes_check check (
    (purpose = 'project_image' and bucket = 'editorial-project-images' and mime in ('image/png', 'image/jpeg', 'image/webp') and bytes <= 3145728)
    or (purpose = 'skill_icon' and bucket = 'editorial-skill-icons' and mime in ('image/png', 'image/jpeg', 'image/svg+xml') and bytes <= 1048576)
    or (purpose = 'curriculum' and bucket = 'editorial-curricula' and mime = 'application/pdf')
  );

-- 4. Media reservation function supporting WebP and 3 MB limit
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

