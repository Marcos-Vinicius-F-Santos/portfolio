-- T-006 / ADR-008 / ADR-009. SVG upload intentionally remains blocked.

do $$
begin
  if not exists (select 1 from pg_roles where rolname = 'portfolio_editorial_executor') then
    create role portfolio_editorial_executor nologin noinherit nobypassrls;
  end if;
end
$$;
grant portfolio_editorial_executor to postgres;
grant usage, create on schema portfolio_editorial to portfolio_editorial_executor;

create table portfolio_editorial.media (
  id uuid primary key,
  draft_id smallint not null default 1 references portfolio_editorial.draft(id) on delete cascade,
  revision bigint not null check (revision >= 0),
  actor_id uuid not null,
  purpose text not null check (purpose in ('project_image', 'skill_icon', 'curriculum')),
  bucket text not null check (bucket in ('editorial-project-images', 'editorial-skill-icons', 'editorial-curricula')),
  path text not null,
  original_name text not null check (length(trim(original_name)) > 0),
  mime text not null,
  bytes bigint not null check (bytes > 0),
  checksum text check (checksum is null or checksum ~ '^[0-9a-f]{64}$'),
  status text not null default 'pending' check (status in ('pending', 'ready', 'rejected', 'deleting')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (bucket, path),
  check (
    (purpose = 'project_image' and bucket = 'editorial-project-images' and mime in ('image/png', 'image/jpeg') and bytes <= 1048576)
    or (purpose = 'skill_icon' and bucket = 'editorial-skill-icons' and mime in ('image/png', 'image/jpeg') and bytes <= 1048576)
    or (purpose = 'curriculum' and bucket = 'editorial-curricula' and mime = 'application/pdf')
  )
);

create table portfolio_editorial.draft_media_refs (
  draft_id smallint not null default 1,
  entity_id text not null,
  field text not null check (field in ('projectImage', 'skillIcon', 'curriculum')),
  media_id uuid not null references portfolio_editorial.media(id) on delete restrict,
  position integer not null default 0 check (position >= 0),
  primary key (draft_id, entity_id, field, position),
  unique (draft_id, media_id),
  foreign key (draft_id, entity_id)
    references portfolio_editorial.draft_entities(draft_id, id) on delete cascade
);

create index media_draft_status_idx on portfolio_editorial.media (draft_id, status, created_at);
create index media_actor_revision_idx on portfolio_editorial.media (actor_id, revision);
create index draft_media_refs_media_idx on portfolio_editorial.draft_media_refs (media_id);

alter table portfolio_editorial.media enable row level security;
alter table portfolio_editorial.media force row level security;
alter table portfolio_editorial.draft_media_refs enable row level security;
alter table portfolio_editorial.draft_media_refs force row level security;

grant select on public.portfolio_admins to portfolio_editorial_executor;
create policy portfolio_admins_editorial_executor_select
  on public.portfolio_admins for select to portfolio_editorial_executor
  using (true);

grant select, insert, update on portfolio_editorial.media to portfolio_editorial_executor;
grant select, insert, update, delete on portfolio_editorial.draft_media_refs to portfolio_editorial_executor;
grant select on portfolio_editorial.draft to portfolio_editorial_executor;
create policy draft_media_executor_select on portfolio_editorial.draft
  for select to portfolio_editorial_executor using (true);
create policy media_executor_all on portfolio_editorial.media
  for all to portfolio_editorial_executor using (true) with check (true);
create policy draft_media_refs_executor_all on portfolio_editorial.draft_media_refs
  for all to portfolio_editorial_executor using (true) with check (true);
create policy media_owner_all on portfolio_editorial.media
  for all to portfolio_editorial_owner using (true) with check (true);
create policy draft_media_refs_owner_all on portfolio_editorial.draft_media_refs
  for all to portfolio_editorial_owner using (true) with check (true);

create function portfolio_editorial.require_editorial_admin(actor uuid)
returns uuid language plpgsql security invoker set search_path = '' as $$
begin
  if actor is null or not exists (
    select 1 from public.portfolio_admins where user_id = actor
  ) then raise exception 'editorial admin required' using errcode = '42501'; end if;
  return actor;
end
$$;

create function portfolio_editorial.reserve_media(
  expected_revision bigint, purpose text, original_name text, mime text, bytes bigint, actor uuid
) returns table(media_id uuid, bucket text, path text)
language plpgsql security definer set search_path = '' as $$
declare current_revision bigint; new_id uuid := gen_random_uuid(); chosen_bucket text; extension text;
begin
  actor := portfolio_editorial.require_editorial_admin(actor);
  select revision into current_revision from portfolio_editorial.draft where id = 1;
  if current_revision <> expected_revision then raise exception 'revision conflict' using errcode = '40001'; end if;
  if purpose = 'project_image' and mime in ('image/png','image/jpeg') and bytes between 1 and 1048576 then
    chosen_bucket := 'editorial-project-images';
  elsif purpose = 'skill_icon' and mime in ('image/png','image/jpeg') and bytes between 1 and 1048576 then
    chosen_bucket := 'editorial-skill-icons';
  elsif purpose = 'curriculum' and mime = 'application/pdf' and bytes > 0 then
    chosen_bucket := 'editorial-curricula';
  else raise exception 'invalid media type or size' using errcode = '22023'; end if;
  extension := case mime when 'image/png' then '.png' when 'image/jpeg' then '.jpg' else '.pdf' end;
  media_id := new_id; bucket := chosen_bucket; path := actor::text || '/' || new_id::text || extension;
  insert into portfolio_editorial.media
    (id, revision, actor_id, purpose, bucket, path, original_name, mime, bytes)
  values (media_id, expected_revision, actor, purpose, bucket, path, original_name, mime, bytes);
  return next;
end
$$;

create function portfolio_editorial.can_access_pending_media(requested_bucket text, requested_path text, actor uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from portfolio_editorial.media m
    where m.bucket = requested_bucket and m.path = requested_path
      and m.actor_id = actor and m.status in ('pending','ready')
  ) and exists (select 1 from public.portfolio_admins where user_id = actor)
$$;

create function portfolio_editorial.finalize_media(expected_revision bigint, requested_media_id uuid, actor uuid)
returns void language plpgsql security definer set search_path = '' as $$
declare item portfolio_editorial.media%rowtype; object_mime text; object_bytes bigint;
begin
  actor := portfolio_editorial.require_editorial_admin(actor);
  select * into item from portfolio_editorial.media where id = requested_media_id for update;
  if not found or item.actor_id <> actor or item.revision <> expected_revision or item.status <> 'pending' then
    raise exception 'media reservation unavailable' using errcode = '22023';
  end if;
  select metadata ->> 'mimetype', (metadata ->> 'size')::bigint into object_mime, object_bytes
  from storage.objects where bucket_id = item.bucket and name = item.path;
  if not found or object_mime <> item.mime or object_bytes <> item.bytes then
    raise exception 'stored object metadata mismatch' using errcode = '22023';
  end if;
  update portfolio_editorial.media set status = 'ready', updated_at = now() where id = item.id;
end
$$;

create function portfolio_editorial.validate_media_reference()
returns trigger language plpgsql set search_path = '' as $$
begin
  if not exists (
    select 1 from portfolio_editorial.media
    where id = new.media_id and draft_id = new.draft_id and status = 'ready'
  ) then raise exception 'media must exist and be ready'; end if;
  return new;
end
$$;
create trigger validate_media_reference before insert or update on portfolio_editorial.draft_media_refs
for each row execute function portfolio_editorial.validate_media_reference();

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types) values
  ('editorial-project-images','editorial-project-images',false,1048576,array['image/png','image/jpeg']),
  ('editorial-skill-icons','editorial-skill-icons',false,1048576,array['image/png','image/jpeg']),
  ('editorial-curricula','editorial-curricula',false,null,array['application/pdf'])
on conflict (id) do update set public = false, file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy editorial_media_admin_insert on storage.objects for insert to authenticated
with check (portfolio_editorial.can_access_pending_media(bucket_id, name, (select auth.uid())));
create policy editorial_media_admin_select on storage.objects for select to authenticated
using (portfolio_editorial.can_access_pending_media(bucket_id, name, (select auth.uid())));

create function public.reserve_editorial_media(
  expected_revision bigint, purpose text, original_name text, mime text, bytes bigint
) returns table(media_id uuid, bucket text, path text)
language sql security definer set search_path = '' as $$
  select * from portfolio_editorial.reserve_media(expected_revision, purpose, original_name, mime, bytes,
    coalesce(nullif(current_setting('request.jwt.claim.sub', true), ''), nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub')::uuid)
$$;
create function public.finalize_editorial_media(expected_revision bigint, media_id uuid)
returns void language sql security definer set search_path = '' as $$
  select portfolio_editorial.finalize_media(expected_revision, media_id,
    coalesce(nullif(current_setting('request.jwt.claim.sub', true), ''), nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub')::uuid)
$$;

revoke all on portfolio_editorial.media, portfolio_editorial.draft_media_refs from public, anon, authenticated, service_role;
revoke all on function portfolio_editorial.require_editorial_admin(uuid),
  portfolio_editorial.reserve_media(bigint,text,text,text,bigint,uuid),
  portfolio_editorial.can_access_pending_media(text,text,uuid),
  portfolio_editorial.finalize_media(bigint,uuid,uuid),
  portfolio_editorial.validate_media_reference()
from public, anon, authenticated, service_role;
grant usage on schema portfolio_editorial to authenticated;
grant execute on function portfolio_editorial.can_access_pending_media(text,text,uuid) to authenticated;
revoke all on function public.reserve_editorial_media(bigint,text,text,text,bigint),
  public.finalize_editorial_media(bigint,uuid) from public, anon;
grant execute on function public.reserve_editorial_media(bigint,text,text,text,bigint),
  public.finalize_editorial_media(bigint,uuid) to authenticated;

alter table portfolio_editorial.media owner to portfolio_editorial_owner;
alter table portfolio_editorial.draft_media_refs owner to portfolio_editorial_owner;
alter function portfolio_editorial.require_editorial_admin(uuid) owner to portfolio_editorial_executor;
alter function portfolio_editorial.reserve_media(bigint,text,text,text,bigint,uuid) owner to portfolio_editorial_executor;
alter function portfolio_editorial.can_access_pending_media(text,text,uuid) owner to portfolio_editorial_executor;
alter function portfolio_editorial.finalize_media(bigint,uuid,uuid) owner to portfolio_editorial_executor;
alter function portfolio_editorial.validate_media_reference() owner to portfolio_editorial_owner;
grant create on schema public to portfolio_editorial_executor;
alter function public.reserve_editorial_media(bigint,text,text,text,bigint) owner to portfolio_editorial_executor;
alter function public.finalize_editorial_media(bigint,uuid) owner to portfolio_editorial_executor;
revoke create on schema public from portfolio_editorial_executor;
revoke create on schema portfolio_editorial from portfolio_editorial_executor;
