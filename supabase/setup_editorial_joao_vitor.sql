
-- =====================================================================
-- SETUP EDITORIAL CMS & STORAGE — JOÃO VITOR DIAS FERNANDES
-- =====================================================================
-- 0. Buckets de Storage e Políticas para Upload de Currículos e Imagens

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('project-images', 'project-images', true, 1048576, array['image/png', 'image/jpeg']),
  ('skill-icons', 'skill-icons', true, 1048576, array['image/png', 'image/jpeg', 'image/svg+xml']),
  ('curricula', 'curricula', true, 52428800, array['application/pdf'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists storage_public_read on storage.objects;
create policy storage_public_read
  on storage.objects for select
  to anon, authenticated
  using (bucket_id in ('project-images', 'skill-icons', 'curricula'));

drop policy if exists storage_admin_insert on storage.objects;
create policy storage_admin_insert
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id in ('project-images', 'skill-icons', 'curricula')
    and exists (
      select 1 from public.portfolio_admins
      where user_id = (select auth.uid())
    )
  );

drop policy if exists storage_admin_update on storage.objects;
create policy storage_admin_update
  on storage.objects for update
  to authenticated
  using (
    bucket_id in ('project-images', 'skill-icons', 'curricula')
    and exists (
      select 1 from public.portfolio_admins
      where user_id = (select auth.uid())
    )
  )
  with check (
    bucket_id in ('project-images', 'skill-icons', 'curricula')
    and exists (
      select 1 from public.portfolio_admins
      where user_id = (select auth.uid())
    )
  );

grant delete on storage.objects to authenticated;

drop policy if exists storage_admin_delete on storage.objects;
create policy storage_admin_delete
  on storage.objects for delete
  to authenticated
  using (
    bucket_id in ('project-images', 'skill-icons', 'curricula')
    and exists (
      select 1 from public.portfolio_admins
      where user_id = (select auth.uid())
    )
  );

-- Políticas em portfolio_files para currículos
alter table public.portfolio_files enable row level security;

drop policy if exists portfolio_files_public_read on public.portfolio_files;
create policy portfolio_files_public_read
  on public.portfolio_files for select
  to anon, authenticated
  using (true);

drop policy if exists portfolio_files_admin_insert on public.portfolio_files;
create policy portfolio_files_admin_insert
  on public.portfolio_files for insert
  to authenticated
  with check (exists (
    select 1 from public.portfolio_admins
    where user_id = (select auth.uid())
  ));

drop policy if exists portfolio_files_admin_update on public.portfolio_files;
create policy portfolio_files_admin_update
  on public.portfolio_files for update
  to authenticated
  using (exists (
    select 1 from public.portfolio_admins
    where user_id = (select auth.uid())
  ))
  with check (exists (
    select 1 from public.portfolio_admins
    where user_id = (select auth.uid())
  ));

drop policy if exists portfolio_files_admin_delete on public.portfolio_files;
create policy portfolio_files_admin_delete
  on public.portfolio_files for delete
  to authenticated
  using (exists (
    select 1 from public.portfolio_admins
    where user_id = (select auth.uid())
  ));

-- RPCs de substituição de mídias no catálogo público
create or replace function public.replace_portfolio_curriculum(
  p_locale text,
  p_storage_path text,
  p_original_name text,
  p_mime_type text,
  p_size_bytes bigint
)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  previous_storage_path text;
  v_user_id uuid;
begin
  v_user_id := auth.uid();
  if v_user_id is null or not exists (select 1 from public.portfolio_admins where user_id = v_user_id) then
    raise exception 'Unauthorized' using errcode = '42501';
  end if;

  select storage_path into previous_storage_path
  from public.portfolio_files
  where file_type = 'curriculum' and locale = p_locale;

  if previous_storage_path is null then
    insert into public.portfolio_files (file_type, locale, storage_path, original_name, mime_type, size_bytes)
    values ('curriculum', p_locale, p_storage_path, p_original_name, p_mime_type, p_size_bytes);
    return p_storage_path;
  else
    update public.portfolio_files
    set storage_path = p_storage_path,
        original_name = p_original_name,
        mime_type = p_mime_type,
        size_bytes = p_size_bytes,
        updated_at = now()
    where file_type = 'curriculum' and locale = p_locale;
    return previous_storage_path;
  end if;
end;
$$;

revoke execute on function public.replace_portfolio_curriculum(text, text, text, text, bigint) from public, anon;
grant execute on function public.replace_portfolio_curriculum(text, text, text, text, bigint) to authenticated;

create or replace function public.replace_portfolio_project_image(
  p_image_id uuid,
  p_storage_path text,
  p_original_name text,
  p_mime_type text,
  p_size_bytes bigint
)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  previous_storage_path text;
  v_user_id uuid;
begin
  v_user_id := auth.uid();
  if v_user_id is null or not exists (select 1 from public.portfolio_admins where user_id = v_user_id) then
    raise exception 'Unauthorized' using errcode = '42501';
  end if;

  select storage_path into previous_storage_path
  from public.portfolio_project_images
  where id = p_image_id;

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

revoke execute on function public.replace_portfolio_project_image(uuid, text, text, text, bigint) from public, anon;
grant execute on function public.replace_portfolio_project_image(uuid, text, text, text, bigint) to authenticated;


-- Migration: 20260926093000_create_private_editorial_schema.sql
-- T-005 / ADR-008: private editorial persistence only.
-- RPCs, media workflow and publication commands are introduced by later tasks.

do $$
begin
  if not exists (select 1 from pg_roles where rolname = 'portfolio_editorial_owner') then
    create role portfolio_editorial_owner nologin noinherit nobypassrls;
  end if;
end
$$;

-- Supabase's migration role is not a superuser; membership lets migrations
-- create and evolve objects owned by the dedicated NOLOGIN role.
grant portfolio_editorial_owner to postgres;

create schema if not exists portfolio_editorial authorization portfolio_editorial_owner;
revoke all on schema portfolio_editorial from public, anon, authenticated, service_role;

create table if not exists portfolio_editorial.draft (
  id smallint primary key default 1 check (id = 1),
  revision bigint not null default 0 check (revision >= 0),
  base_publication_id uuid,
  default_locale text not null default 'pt-BR' check (default_locale = 'pt-BR'),
  updated_at timestamptz not null default now()
);

create table if not exists portfolio_editorial.draft_locales (
  draft_id smallint not null default 1,
  code text not null check (code ~ '^[a-z]{2,3}(-[A-Z]{2})?$'),
  label text not null check (length(trim(label)) > 0),
  direction text not null default 'ltr' check (direction = 'ltr'),
  status text not null default 'preparation' check (status in ('preparation', 'active')),
  position integer not null check (position >= 0),
  primary key (draft_id, code),
  unique (draft_id, position),
  foreign key (draft_id) references portfolio_editorial.draft(id) on delete cascade
);

create table if not exists portfolio_editorial.technologies (
  id text primary key check (id ~ '^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$'),
  label text not null check (length(trim(label)) > 0),
  aliases text[] not null default '{}',
  bundled_asset text,
  license_reference text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists portfolio_editorial.draft_entities (
  draft_id smallint not null default 1,
  id text not null check (id ~ '^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$'),
  kind text not null check (kind in (
    'presentation', 'about', 'result', 'experience', 'skillCategory', 'skill',
    'academic', 'project', 'contact', 'projectLink', 'projectImage', 'curriculum',
    'interfaceText', 'listItem'
  )),
  parent_id text,
  position integer not null check (position >= 0),
  data jsonb not null default '{}'::jsonb check (jsonb_typeof(data) = 'object'),
  primary key (draft_id, id),
  unique nulls not distinct (draft_id, kind, parent_id, position),
  foreign key (draft_id) references portfolio_editorial.draft(id) on delete cascade,
  foreign key (draft_id, parent_id)
    references portfolio_editorial.draft_entities(draft_id, id)
    on delete cascade deferrable initially deferred,
  check (parent_id is null or parent_id <> id)
);

create table if not exists portfolio_editorial.draft_translations (
  draft_id smallint not null default 1,
  entity_id text not null,
  locale_code text not null,
  fields jsonb not null default '{}'::jsonb check (jsonb_typeof(fields) = 'object'),
  primary key (draft_id, entity_id, locale_code),
  foreign key (draft_id, entity_id)
    references portfolio_editorial.draft_entities(draft_id, id) on delete cascade,
  foreign key (draft_id, locale_code)
    references portfolio_editorial.draft_locales(draft_id, code) on delete cascade
);

create table if not exists portfolio_editorial.publications (
  id uuid primary key,
  sequence bigint generated always as identity unique,
  format_version integer not null check (format_version = 1),
  snapshot jsonb not null check (
    jsonb_typeof(snapshot) = 'object'
    and snapshot ->> 'formatVersion' = format_version::text
  ),
  hash text not null unique check (hash ~ '^[0-9a-f]{64}$'),
  created_at timestamptz not null default now(),
  source_revision bigint not null check (source_revision >= 0),
  retained boolean not null default true
);

alter table portfolio_editorial.draft
  drop constraint if exists draft_base_publication_fk;
  alter table portfolio_editorial.draft add constraint draft_base_publication_fk
  foreign key (base_publication_id) references portfolio_editorial.publications(id)
  on delete restrict;

create table if not exists portfolio_editorial.site_state (
  id smallint primary key default 1 check (id = 1),
  active_publication_id uuid references portfolio_editorial.publications(id) on delete restrict,
  editorial_enabled boolean not null default false,
  updated_at timestamptz not null default now()
);

create index if not exists draft_entities_parent_idx
  on portfolio_editorial.draft_entities (draft_id, parent_id, position);
create index if not exists draft_entities_kind_idx
  on portfolio_editorial.draft_entities (draft_id, kind, position);
create index if not exists draft_translations_locale_idx
  on portfolio_editorial.draft_translations (draft_id, locale_code, entity_id);
create index if not exists publications_created_at_idx
  on portfolio_editorial.publications (created_at desc);
create index if not exists publications_retained_idx
  on portfolio_editorial.publications (retained, sequence desc);

create function portfolio_editorial.protect_default_locale()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if old.code = 'pt-BR' and (
    tg_op = 'DELETE'
    or new.code <> 'pt-BR'
    or new.status <> 'active'
    or new.direction <> 'ltr'
  ) then
    raise exception 'pt-BR is the required active default locale';
  end if;
  return case when tg_op = 'DELETE' then old else new end;
end
$$;

drop trigger if exists protect_default_locale on portfolio_editorial.draft_locales;
create trigger protect_default_locale
before update or delete on portfolio_editorial.draft_locales
for each row execute function portfolio_editorial.protect_default_locale();

create function portfolio_editorial.protect_publication_payload()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.id <> old.id
    or new.sequence <> old.sequence
    or new.format_version <> old.format_version
    or new.snapshot <> old.snapshot
    or new.hash <> old.hash
    or new.created_at <> old.created_at
    or new.source_revision <> old.source_revision then
    raise exception 'published snapshot payload is immutable';
  end if;
  return new;
end
$$;

drop trigger if exists protect_publication_payload on portfolio_editorial.publications;
create trigger protect_publication_payload
before update on portfolio_editorial.publications
for each row execute function portfolio_editorial.protect_publication_payload();

insert into portfolio_editorial.draft (id) values (1) on conflict (id) do nothing;
insert into portfolio_editorial.draft_locales
  (draft_id, code, label, direction, status, position)
values (1, 'pt-BR', 'Português', 'ltr', 'active', 0) on conflict (draft_id, code) do nothing;
insert into portfolio_editorial.site_state (id) values (1) on conflict (id) do nothing;

alter table portfolio_editorial.draft enable row level security;
alter table portfolio_editorial.draft_locales enable row level security;
alter table portfolio_editorial.technologies enable row level security;
alter table portfolio_editorial.draft_entities enable row level security;
alter table portfolio_editorial.draft_translations enable row level security;
alter table portfolio_editorial.publications enable row level security;
alter table portfolio_editorial.site_state enable row level security;

alter table portfolio_editorial.draft force row level security;
alter table portfolio_editorial.draft_locales force row level security;
alter table portfolio_editorial.technologies force row level security;
alter table portfolio_editorial.draft_entities force row level security;
alter table portfolio_editorial.draft_translations force row level security;
alter table portfolio_editorial.publications force row level security;
alter table portfolio_editorial.site_state force row level security;

revoke all privileges on all tables in schema portfolio_editorial
  from public, anon, authenticated, service_role;
revoke all privileges on all sequences in schema portfolio_editorial
  from public, anon, authenticated, service_role;
revoke all privileges on all functions in schema portfolio_editorial
  from public, anon, authenticated, service_role;

alter table portfolio_editorial.draft owner to portfolio_editorial_owner;
alter table portfolio_editorial.draft_locales owner to portfolio_editorial_owner;
alter table portfolio_editorial.technologies owner to portfolio_editorial_owner;
alter table portfolio_editorial.draft_entities owner to portfolio_editorial_owner;
alter table portfolio_editorial.draft_translations owner to portfolio_editorial_owner;
alter table portfolio_editorial.publications owner to portfolio_editorial_owner;
alter table portfolio_editorial.site_state owner to portfolio_editorial_owner;
alter sequence portfolio_editorial.publications_sequence_seq owner to portfolio_editorial_owner;
alter function portfolio_editorial.protect_default_locale() owner to portfolio_editorial_owner;
alter function portfolio_editorial.protect_publication_payload() owner to portfolio_editorial_owner;


-- Migration: 20260926100000_create_private_editorial_media_flow.sql
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

create table if not exists portfolio_editorial.media (
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

create table if not exists portfolio_editorial.draft_media_refs (
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

create index if not exists media_draft_status_idx on portfolio_editorial.media (draft_id, status, created_at);
create index if not exists media_actor_revision_idx on portfolio_editorial.media (actor_id, revision);
create index if not exists draft_media_refs_media_idx on portfolio_editorial.draft_media_refs (media_id);

alter table portfolio_editorial.media enable row level security;
alter table portfolio_editorial.media force row level security;
alter table portfolio_editorial.draft_media_refs enable row level security;
alter table portfolio_editorial.draft_media_refs force row level security;

grant select on public.portfolio_admins to portfolio_editorial_executor;
drop policy if exists portfolio_admins_editorial_executor_select on public.portfolio_admins;
create policy portfolio_admins_editorial_executor_select on public.portfolio_admins for select to portfolio_editorial_executor
  using (true);

grant select, insert, update on portfolio_editorial.media to portfolio_editorial_executor;
grant select, insert, update, delete on portfolio_editorial.draft_media_refs to portfolio_editorial_executor;
grant select on portfolio_editorial.draft to portfolio_editorial_executor;
drop policy if exists draft_media_executor_select on portfolio_editorial.draft;
create policy draft_media_executor_select on portfolio_editorial.draft
  for select to portfolio_editorial_executor using (true);
drop policy if exists media_executor_all on portfolio_editorial.media;
create policy media_executor_all on portfolio_editorial.media
  for all to portfolio_editorial_executor using (true) with check (true);
drop policy if exists draft_media_refs_executor_all on portfolio_editorial.draft_media_refs;
create policy draft_media_refs_executor_all on portfolio_editorial.draft_media_refs
  for all to portfolio_editorial_executor using (true) with check (true);
drop policy if exists media_owner_all on portfolio_editorial.media;
create policy media_owner_all on portfolio_editorial.media
  for all to portfolio_editorial_owner using (true) with check (true);
drop policy if exists draft_media_refs_owner_all on portfolio_editorial.draft_media_refs;
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
drop trigger if exists validate_media_reference on portfolio_editorial.draft_media_refs;
create trigger validate_media_reference before insert or update on portfolio_editorial.draft_media_refs
for each row execute function portfolio_editorial.validate_media_reference();

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types) values
  ('editorial-project-images','editorial-project-images',false,1048576,array['image/png','image/jpeg']),
  ('editorial-skill-icons','editorial-skill-icons',false,1048576,array['image/png','image/jpeg']),
  ('editorial-curricula','editorial-curricula',false,null,array['application/pdf'])
on conflict (id) do update set public = false, file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists editorial_media_admin_insert on storage.objects;
create policy editorial_media_admin_insert on storage.objects for insert to authenticated
with check (portfolio_editorial.can_access_pending_media(bucket_id, name, (select auth.uid())));
drop policy if exists editorial_media_admin_select on storage.objects;
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


-- Importação do snapshot inicial editorial de João Vitor
do $$ declare payload jsonb := '{"formatVersion":1,"publicationId":"00000000-0000-4000-8000-000000000001","createdAt":"2026-10-05T12:00:00.000Z","defaultLocale":"pt-BR","locales":[{"code":"pt-BR","label":"Português","direction":"ltr","position":0},{"code":"en","label":"English","direction":"ltr","position":1}],"sections":[{"id":"presentation-section","kind":"presentation","position":0},{"id":"about-section","kind":"about","position":1},{"id":"results-section","kind":"results","position":2},{"id":"experiences-section","kind":"experiences","position":3},{"id":"projects-section","kind":"projects","position":4},{"id":"skills-section","kind":"skills","position":5},{"id":"education-section","kind":"education","position":6},{"id":"contact-section","kind":"contact","position":7}],"entities":{"copy-eyebrow":{"kind":"interfaceText","position":0,"data":{"key":"eyebrow"}},"copy-presentationTitle":{"kind":"interfaceText","position":1,"data":{"key":"presentationTitle"}},"copy-intro":{"kind":"interfaceText","position":2,"data":{"key":"intro"}},"copy-navigation":{"kind":"interfaceText","position":3,"data":{"key":"navigation"}},"copy-aboutTitle":{"kind":"interfaceText","position":4,"data":{"key":"aboutTitle"}},"copy-aboutBody":{"kind":"interfaceText","position":5,"data":{"key":"aboutBody"}},"copy-experienceTitle":{"kind":"interfaceText","position":6,"data":{"key":"experienceTitle"}},"copy-experienceBody":{"kind":"interfaceText","position":7,"data":{"key":"experienceBody"}},"copy-experiencePeriodLabel":{"kind":"interfaceText","position":8,"data":{"key":"experiencePeriodLabel"}},"copy-experienceContextLabel":{"kind":"interfaceText","position":9,"data":{"key":"experienceContextLabel"}},"copy-experienceResponsibilitiesLabel":{"kind":"interfaceText","position":10,"data":{"key":"experienceResponsibilitiesLabel"}},"copy-experienceTechnicalDecisionsLabel":{"kind":"interfaceText","position":11,"data":{"key":"experienceTechnicalDecisionsLabel"}},"copy-experienceResultsLabel":{"kind":"interfaceText","position":12,"data":{"key":"experienceResultsLabel"}},"copy-stackTitle":{"kind":"interfaceText","position":13,"data":{"key":"stackTitle"}},"copy-stackBody":{"kind":"interfaceText","position":14,"data":{"key":"stackBody"}},"copy-skillsLanguagesRuntimeLabel":{"kind":"interfaceText","position":15,"data":{"key":"skillsLanguagesRuntimeLabel"}},"copy-skillsCorporateIntegrationsLabel":{"kind":"interfaceText","position":16,"data":{"key":"skillsCorporateIntegrationsLabel"}},"copy-skillsFrontendLabel":{"kind":"interfaceText","position":17,"data":{"key":"skillsFrontendLabel"}},"copy-skillsDevopsObservabilityLabel":{"kind":"interfaceText","position":18,"data":{"key":"skillsDevopsObservabilityLabel"}},"copy-skillsDatabasesLabel":{"kind":"interfaceText","position":19,"data":{"key":"skillsDatabasesLabel"}},"copy-skillsVersionControlLabel":{"kind":"interfaceText","position":20,"data":{"key":"skillsVersionControlLabel"}},"copy-educationTitle":{"kind":"interfaceText","position":21,"data":{"key":"educationTitle"}},"copy-educationBody":{"kind":"interfaceText","position":22,"data":{"key":"educationBody"}},"copy-educationDataScience":{"kind":"interfaceText","position":23,"data":{"key":"educationDataScience"}},"copy-educationAppliedStatistics":{"kind":"interfaceText","position":24,"data":{"key":"educationAppliedStatistics"}},"copy-educationGraphicDesign":{"kind":"interfaceText","position":25,"data":{"key":"educationGraphicDesign"}},"copy-educationInstitutionLabel":{"kind":"interfaceText","position":26,"data":{"key":"educationInstitutionLabel"}},"copy-educationPeriodLabel":{"kind":"interfaceText","position":27,"data":{"key":"educationPeriodLabel"}},"copy-educationCompetenciesLabel":{"kind":"interfaceText","position":28,"data":{"key":"educationCompetenciesLabel"}},"copy-educationContentLabel":{"kind":"interfaceText","position":29,"data":{"key":"educationContentLabel"}},"copy-educationCurrentLabel":{"kind":"interfaceText","position":30,"data":{"key":"educationCurrentLabel"}},"copy-contactTitle":{"kind":"interfaceText","position":31,"data":{"key":"contactTitle"}},"copy-contactBody":{"kind":"interfaceText","position":32,"data":{"key":"contactBody"}},"copy-contactLinkedinLabel":{"kind":"interfaceText","position":33,"data":{"key":"contactLinkedinLabel"}},"copy-contactGithubLabel":{"kind":"interfaceText","position":34,"data":{"key":"contactGithubLabel"}},"copy-contactEmailLabel":{"kind":"interfaceText","position":35,"data":{"key":"contactEmailLabel"}},"copy-contactPhoneLabel":{"kind":"interfaceText","position":36,"data":{"key":"contactPhoneLabel"}},"copy-contactCurriculumPtLabel":{"kind":"interfaceText","position":37,"data":{"key":"contactCurriculumPtLabel"}},"copy-contactCurriculumEnLabel":{"kind":"interfaceText","position":38,"data":{"key":"contactCurriculumEnLabel"}},"copy-contactCurriculumDownloadLabel":{"kind":"interfaceText","position":39,"data":{"key":"contactCurriculumDownloadLabel"}},"copy-languageLabel":{"kind":"interfaceText","position":40,"data":{"key":"languageLabel"}},"copy-resultsTitle":{"kind":"interfaceText","position":41,"data":{"key":"resultsTitle"}},"copy-resultsTimeReductionLabel":{"kind":"interfaceText","position":42,"data":{"key":"resultsTimeReductionLabel"}},"copy-resultsTimeReduction":{"kind":"interfaceText","position":43,"data":{"key":"resultsTimeReduction"}},"copy-resultsStepsReductionLabel":{"kind":"interfaceText","position":44,"data":{"key":"resultsStepsReductionLabel"}},"copy-resultsStepsReduction":{"kind":"interfaceText","position":45,"data":{"key":"resultsStepsReduction"}},"copy-resultsUsersServedLabel":{"kind":"interfaceText","position":46,"data":{"key":"resultsUsersServedLabel"}},"copy-resultsUsersServed":{"kind":"interfaceText","position":47,"data":{"key":"resultsUsersServed"}},"copy-resultsProductivityGainLabel":{"kind":"interfaceText","position":48,"data":{"key":"resultsProductivityGainLabel"}},"copy-resultsProductivityGain":{"kind":"interfaceText","position":49,"data":{"key":"resultsProductivityGain"}},"copy-projectsTitle":{"kind":"interfaceText","position":50,"data":{"key":"projectsTitle"}},"copy-professionalProjectsTitle":{"kind":"interfaceText","position":51,"data":{"key":"professionalProjectsTitle"}},"copy-personalProjectsTitle":{"kind":"interfaceText","position":52,"data":{"key":"personalProjectsTitle"}},"copy-projectDescriptionLabel":{"kind":"interfaceText","position":53,"data":{"key":"projectDescriptionLabel"}},"copy-projectContextLabel":{"kind":"interfaceText","position":54,"data":{"key":"projectContextLabel"}},"copy-projectRoleLabel":{"kind":"interfaceText","position":55,"data":{"key":"projectRoleLabel"}},"copy-projectTechnicalDecisionsLabel":{"kind":"interfaceText","position":56,"data":{"key":"projectTechnicalDecisionsLabel"}},"copy-projectTechnologiesLabel":{"kind":"interfaceText","position":57,"data":{"key":"projectTechnologiesLabel"}},"copy-projectResultsLabel":{"kind":"interfaceText","position":58,"data":{"key":"projectResultsLabel"}},"copy-projectLearningsLabel":{"kind":"interfaceText","position":59,"data":{"key":"projectLearningsLabel"}},"copy-projectLinksLabel":{"kind":"interfaceText","position":60,"data":{"key":"projectLinksLabel"}},"8a1135e2-b735-438b-a819-381511b94840":{"kind":"experience","position":0,"data":{"startDate":"2025-09-01","endDate":"2026-09-01"}},"8a1135e2-b735-438b-a819-381511b94840-responsibilities-1":{"kind":"listItem","parentId":"8a1135e2-b735-438b-a819-381511b94840","position":0,"data":{"collection":"responsibilities"}},"8a1135e2-b735-438b-a819-381511b94840-responsibilities-2":{"kind":"listItem","parentId":"8a1135e2-b735-438b-a819-381511b94840","position":1,"data":{"collection":"responsibilities"}},"8a1135e2-b735-438b-a819-381511b94840-responsibilities-3":{"kind":"listItem","parentId":"8a1135e2-b735-438b-a819-381511b94840","position":2,"data":{"collection":"responsibilities"}},"8a1135e2-b735-438b-a819-381511b94840-responsibilities-4":{"kind":"listItem","parentId":"8a1135e2-b735-438b-a819-381511b94840","position":3,"data":{"collection":"responsibilities"}},"8a1135e2-b735-438b-a819-381511b94840-technicalDecisions-1":{"kind":"listItem","parentId":"8a1135e2-b735-438b-a819-381511b94840","position":4,"data":{"collection":"technicalDecisions"}},"8a1135e2-b735-438b-a819-381511b94840-technicalDecisions-2":{"kind":"listItem","parentId":"8a1135e2-b735-438b-a819-381511b94840","position":5,"data":{"collection":"technicalDecisions"}},"8a1135e2-b735-438b-a819-381511b94840-technicalDecisions-3":{"kind":"listItem","parentId":"8a1135e2-b735-438b-a819-381511b94840","position":6,"data":{"collection":"technicalDecisions"}},"8a1135e2-b735-438b-a819-381511b94840-results-1":{"kind":"listItem","parentId":"8a1135e2-b735-438b-a819-381511b94840","position":7,"data":{"collection":"results"}},"8a1135e2-b735-438b-a819-381511b94840-results-2":{"kind":"listItem","parentId":"8a1135e2-b735-438b-a819-381511b94840","position":8,"data":{"collection":"results"}},"8a1135e2-b735-438b-a819-381511b94840-results-3":{"kind":"listItem","parentId":"8a1135e2-b735-438b-a819-381511b94840","position":9,"data":{"collection":"results"}},"147c2bd9-9ca4-4155-b6ab-8bf4dcf6c9a9":{"kind":"experience","position":1,"data":{"startDate":"2024-08-01","endDate":"2025-01-01"}},"147c2bd9-9ca4-4155-b6ab-8bf4dcf6c9a9-responsibilities-1":{"kind":"listItem","parentId":"147c2bd9-9ca4-4155-b6ab-8bf4dcf6c9a9","position":0,"data":{"collection":"responsibilities"}},"147c2bd9-9ca4-4155-b6ab-8bf4dcf6c9a9-responsibilities-2":{"kind":"listItem","parentId":"147c2bd9-9ca4-4155-b6ab-8bf4dcf6c9a9","position":1,"data":{"collection":"responsibilities"}},"147c2bd9-9ca4-4155-b6ab-8bf4dcf6c9a9-responsibilities-3":{"kind":"listItem","parentId":"147c2bd9-9ca4-4155-b6ab-8bf4dcf6c9a9","position":2,"data":{"collection":"responsibilities"}},"147c2bd9-9ca4-4155-b6ab-8bf4dcf6c9a9-technicalDecisions-1":{"kind":"listItem","parentId":"147c2bd9-9ca4-4155-b6ab-8bf4dcf6c9a9","position":3,"data":{"collection":"technicalDecisions"}},"147c2bd9-9ca4-4155-b6ab-8bf4dcf6c9a9-technicalDecisions-2":{"kind":"listItem","parentId":"147c2bd9-9ca4-4155-b6ab-8bf4dcf6c9a9","position":4,"data":{"collection":"technicalDecisions"}},"147c2bd9-9ca4-4155-b6ab-8bf4dcf6c9a9-results-1":{"kind":"listItem","parentId":"147c2bd9-9ca4-4155-b6ab-8bf4dcf6c9a9","position":5,"data":{"collection":"results"}},"5ab9dd44-8d76-4490-a254-d7bd01029e37":{"kind":"experience","position":2,"data":{"startDate":"2024-03-01","endDate":"2025-03-01"}},"5ab9dd44-8d76-4490-a254-d7bd01029e37-responsibilities-1":{"kind":"listItem","parentId":"5ab9dd44-8d76-4490-a254-d7bd01029e37","position":0,"data":{"collection":"responsibilities"}},"5ab9dd44-8d76-4490-a254-d7bd01029e37-responsibilities-2":{"kind":"listItem","parentId":"5ab9dd44-8d76-4490-a254-d7bd01029e37","position":1,"data":{"collection":"responsibilities"}},"5ab9dd44-8d76-4490-a254-d7bd01029e37-technicalDecisions-1":{"kind":"listItem","parentId":"5ab9dd44-8d76-4490-a254-d7bd01029e37","position":2,"data":{"collection":"technicalDecisions"}},"5ab9dd44-8d76-4490-a254-d7bd01029e37-technicalDecisions-2":{"kind":"listItem","parentId":"5ab9dd44-8d76-4490-a254-d7bd01029e37","position":3,"data":{"collection":"technicalDecisions"}},"5ab9dd44-8d76-4490-a254-d7bd01029e37-results-1":{"kind":"listItem","parentId":"5ab9dd44-8d76-4490-a254-d7bd01029e37","position":4,"data":{"collection":"results"}},"c2250aa4-f25d-4ad2-9e8d-41a8c0d08bfb":{"kind":"experience","position":3,"data":{"startDate":"2023-05-01","endDate":"2023-10-01"}},"c2250aa4-f25d-4ad2-9e8d-41a8c0d08bfb-responsibilities-1":{"kind":"listItem","parentId":"c2250aa4-f25d-4ad2-9e8d-41a8c0d08bfb","position":0,"data":{"collection":"responsibilities"}},"c2250aa4-f25d-4ad2-9e8d-41a8c0d08bfb-responsibilities-2":{"kind":"listItem","parentId":"c2250aa4-f25d-4ad2-9e8d-41a8c0d08bfb","position":1,"data":{"collection":"responsibilities"}},"c2250aa4-f25d-4ad2-9e8d-41a8c0d08bfb-responsibilities-3":{"kind":"listItem","parentId":"c2250aa4-f25d-4ad2-9e8d-41a8c0d08bfb","position":2,"data":{"collection":"responsibilities"}},"c2250aa4-f25d-4ad2-9e8d-41a8c0d08bfb-technicalDecisions-1":{"kind":"listItem","parentId":"c2250aa4-f25d-4ad2-9e8d-41a8c0d08bfb","position":3,"data":{"collection":"technicalDecisions"}},"c2250aa4-f25d-4ad2-9e8d-41a8c0d08bfb-technicalDecisions-2":{"kind":"listItem","parentId":"c2250aa4-f25d-4ad2-9e8d-41a8c0d08bfb","position":4,"data":{"collection":"technicalDecisions"}},"c2250aa4-f25d-4ad2-9e8d-41a8c0d08bfb-technicalDecisions-3":{"kind":"listItem","parentId":"c2250aa4-f25d-4ad2-9e8d-41a8c0d08bfb","position":5,"data":{"collection":"technicalDecisions"}},"c2250aa4-f25d-4ad2-9e8d-41a8c0d08bfb-results-1":{"kind":"listItem","parentId":"c2250aa4-f25d-4ad2-9e8d-41a8c0d08bfb","position":6,"data":{"collection":"results"}},"5b468d55-a913-465e-a69a-a052348efd26":{"kind":"project","position":0,"data":{"type":"personal","technologyIds":["angular","typescript","python","fastapi","postgresql","redis","docker"]}},"5b468d55-a913-465e-a69a-a052348efd26-technicalDecisions-1":{"kind":"listItem","parentId":"5b468d55-a913-465e-a69a-a052348efd26","position":0,"data":{"collection":"technicalDecisions"}},"5b468d55-a913-465e-a69a-a052348efd26-technicalDecisions-2":{"kind":"listItem","parentId":"5b468d55-a913-465e-a69a-a052348efd26","position":1,"data":{"collection":"technicalDecisions"}},"5b468d55-a913-465e-a69a-a052348efd26-technicalDecisions-3":{"kind":"listItem","parentId":"5b468d55-a913-465e-a69a-a052348efd26","position":2,"data":{"collection":"technicalDecisions"}},"5b468d55-a913-465e-a69a-a052348efd26-results-1":{"kind":"listItem","parentId":"5b468d55-a913-465e-a69a-a052348efd26","position":3,"data":{"collection":"results"}},"5b468d55-a913-465e-a69a-a052348efd26-results-2":{"kind":"listItem","parentId":"5b468d55-a913-465e-a69a-a052348efd26","position":4,"data":{"collection":"results"}},"5b468d55-a913-465e-a69a-a052348efd26-learnings-1":{"kind":"listItem","parentId":"5b468d55-a913-465e-a69a-a052348efd26","position":5,"data":{"collection":"learnings"}},"5b468d55-a913-465e-a69a-a052348efd26-learnings-2":{"kind":"listItem","parentId":"5b468d55-a913-465e-a69a-a052348efd26","position":6,"data":{"collection":"learnings"}},"5b468d55-a913-465e-a69a-a052348efd26-link-1":{"kind":"projectLink","parentId":"5b468d55-a913-465e-a69a-a052348efd26","position":0,"data":{"href":"https://github.com/joaovitordf"}},"3f6fa6a5-f038-4ae5-a186-42a376465892":{"kind":"project","position":1,"data":{"type":"personal","technologyIds":["python","opencv","yolov8","mediapipe","flutter","rest-apis"]}},"3f6fa6a5-f038-4ae5-a186-42a376465892-technicalDecisions-1":{"kind":"listItem","parentId":"3f6fa6a5-f038-4ae5-a186-42a376465892","position":0,"data":{"collection":"technicalDecisions"}},"3f6fa6a5-f038-4ae5-a186-42a376465892-technicalDecisions-2":{"kind":"listItem","parentId":"3f6fa6a5-f038-4ae5-a186-42a376465892","position":1,"data":{"collection":"technicalDecisions"}},"3f6fa6a5-f038-4ae5-a186-42a376465892-technicalDecisions-3":{"kind":"listItem","parentId":"3f6fa6a5-f038-4ae5-a186-42a376465892","position":2,"data":{"collection":"technicalDecisions"}},"3f6fa6a5-f038-4ae5-a186-42a376465892-technicalDecisions-4":{"kind":"listItem","parentId":"3f6fa6a5-f038-4ae5-a186-42a376465892","position":3,"data":{"collection":"technicalDecisions"}},"3f6fa6a5-f038-4ae5-a186-42a376465892-results-1":{"kind":"listItem","parentId":"3f6fa6a5-f038-4ae5-a186-42a376465892","position":4,"data":{"collection":"results"}},"3f6fa6a5-f038-4ae5-a186-42a376465892-results-2":{"kind":"listItem","parentId":"3f6fa6a5-f038-4ae5-a186-42a376465892","position":5,"data":{"collection":"results"}},"3f6fa6a5-f038-4ae5-a186-42a376465892-learnings-1":{"kind":"listItem","parentId":"3f6fa6a5-f038-4ae5-a186-42a376465892","position":6,"data":{"collection":"learnings"}},"3f6fa6a5-f038-4ae5-a186-42a376465892-learnings-2":{"kind":"listItem","parentId":"3f6fa6a5-f038-4ae5-a186-42a376465892","position":7,"data":{"collection":"learnings"}},"3f6fa6a5-f038-4ae5-a186-42a376465892-link-1":{"kind":"projectLink","parentId":"3f6fa6a5-f038-4ae5-a186-42a376465892","position":0,"data":{"href":"https://github.com/joaovitordf"}},"languages-runtime":{"kind":"skillCategory","position":0,"data":{}},"skill-typescript":{"kind":"skill","parentId":"languages-runtime","position":0,"data":{"technologyId":"typescript","iconMediaId":"asset-typescript"}},"skill-python":{"kind":"skill","parentId":"languages-runtime","position":1,"data":{"technologyId":"python"}},"skill-java":{"kind":"skill","parentId":"languages-runtime","position":2,"data":{"technologyId":"java","iconMediaId":"asset-java"}},"skill-php":{"kind":"skill","parentId":"languages-runtime","position":3,"data":{"technologyId":"php"}},"skill-javascript":{"kind":"skill","parentId":"languages-runtime","position":4,"data":{"technologyId":"javascript","iconMediaId":"asset-javascript"}},"skill-dart":{"kind":"skill","parentId":"languages-runtime","position":5,"data":{"technologyId":"dart"}},"corporate-integrations":{"kind":"skillCategory","position":1,"data":{}},"skill-fastapi":{"kind":"skill","parentId":"corporate-integrations","position":0,"data":{"technologyId":"fastapi"}},"skill-spring-boot":{"kind":"skill","parentId":"corporate-integrations","position":1,"data":{"technologyId":"spring-boot"}},"skill-laravel":{"kind":"skill","parentId":"corporate-integrations","position":2,"data":{"technologyId":"laravel"}},"skill-rest-apis":{"kind":"skill","parentId":"corporate-integrations","position":3,"data":{"technologyId":"rest-apis","iconMediaId":"asset-rest-apis"}},"skill-jsf":{"kind":"skill","parentId":"corporate-integrations","position":4,"data":{"technologyId":"jsf"}},"frontend":{"kind":"skillCategory","position":2,"data":{}},"skill-angular":{"kind":"skill","parentId":"frontend","position":0,"data":{"technologyId":"angular"}},"skill-flutter":{"kind":"skill","parentId":"frontend","position":1,"data":{"technologyId":"flutter"}},"skill-html":{"kind":"skill","parentId":"frontend","position":2,"data":{"technologyId":"html","iconMediaId":"asset-html"}},"skill-css":{"kind":"skill","parentId":"frontend","position":3,"data":{"technologyId":"css","iconMediaId":"asset-css"}},"skill-react":{"kind":"skill","parentId":"frontend","position":4,"data":{"technologyId":"react","iconMediaId":"asset-react"}},"devops-observability":{"kind":"skillCategory","position":3,"data":{}},"skill-docker":{"kind":"skill","parentId":"devops-observability","position":0,"data":{"technologyId":"docker","iconMediaId":"asset-docker"}},"skill-gradle":{"kind":"skill","parentId":"devops-observability","position":1,"data":{"technologyId":"gradle"}},"skill-maven":{"kind":"skill","parentId":"devops-observability","position":2,"data":{"technologyId":"maven"}},"skill-grafana":{"kind":"skill","parentId":"devops-observability","position":3,"data":{"technologyId":"grafana","iconMediaId":"asset-grafana"}},"databases":{"kind":"skillCategory","position":4,"data":{}},"skill-postgresql":{"kind":"skill","parentId":"databases","position":0,"data":{"technologyId":"postgresql","iconMediaId":"asset-postgresql"}},"skill-supabase":{"kind":"skill","parentId":"databases","position":1,"data":{"technologyId":"supabase"}},"skill-mysql":{"kind":"skill","parentId":"databases","position":2,"data":{"technologyId":"mysql","iconMediaId":"asset-mysql"}},"skill-oracle-database":{"kind":"skill","parentId":"databases","position":3,"data":{"technologyId":"oracle-database"}},"version-control":{"kind":"skillCategory","position":5,"data":{}},"skill-git":{"kind":"skill","parentId":"version-control","position":0,"data":{"technologyId":"git","iconMediaId":"asset-git"}},"skill-github":{"kind":"skill","parentId":"version-control","position":1,"data":{"technologyId":"github","iconMediaId":"asset-github"}},"skill-gitlab":{"kind":"skill","parentId":"version-control","position":2,"data":{"technologyId":"gitlab"}},"skill-gitkraken":{"kind":"skill","parentId":"version-control","position":3,"data":{"technologyId":"gitkraken"}},"skill-opencv":{"kind":"skill","parentId":"version-control","position":4,"data":{"technologyId":"opencv"}},"skill-yolov8":{"kind":"skill","parentId":"version-control","position":5,"data":{"technologyId":"yolov8"}},"computer-science":{"kind":"academic","position":0,"data":{"startDate":"2020-01-20","endDate":"2025-08-20","isCurrent":false}},"computer-science-competencies-1":{"kind":"listItem","parentId":"computer-science","position":0,"data":{"collection":"competencies"}},"computer-science-competencies-2":{"kind":"listItem","parentId":"computer-science","position":1,"data":{"collection":"competencies"}},"computer-science-competencies-3":{"kind":"listItem","parentId":"computer-science","position":2,"data":{"collection":"competencies"}},"computer-science-competencies-4":{"kind":"listItem","parentId":"computer-science","position":3,"data":{"collection":"competencies"}},"computer-science-competencies-5":{"kind":"listItem","parentId":"computer-science","position":4,"data":{"collection":"competencies"}},"computer-science-competencies-6":{"kind":"listItem","parentId":"computer-science","position":5,"data":{"collection":"competencies"}},"computer-science-competencies-7":{"kind":"listItem","parentId":"computer-science","position":6,"data":{"collection":"competencies"}},"computer-science-competencies-8":{"kind":"listItem","parentId":"computer-science","position":7,"data":{"collection":"competencies"}},"computer-science-studiedContent-1":{"kind":"listItem","parentId":"computer-science","position":8,"data":{"collection":"studiedContent"}},"computer-science-studiedContent-2":{"kind":"listItem","parentId":"computer-science","position":9,"data":{"collection":"studiedContent"}},"computer-science-studiedContent-3":{"kind":"listItem","parentId":"computer-science","position":10,"data":{"collection":"studiedContent"}},"linkedin":{"kind":"contact","position":0,"data":{"symbol":"linkedin","href":"https://www.linkedin.com/in/xjoaovitordf/"}},"github":{"kind":"contact","position":1,"data":{"symbol":"github","href":"https://github.com/joaovitordf"}},"email":{"kind":"contact","position":2,"data":{"symbol":"email","href":"mailto:profissional.joaovitordf@gmail.com"}},"phone":{"kind":"contact","position":3,"data":{"symbol":"phone","href":"tel:+553799429018"}}},"translations":{"pt-BR":{"copy-eyebrow":{"text":"Portfólio profissional"},"copy-presentationTitle":{"text":"Apresentação"},"copy-intro":{"text":"João Vitor Dias Fernandes é bacharel em Ciência da Computação (IFMG) com atuação em engenharia de software e desenvolvimento web. Possui experiência na construção de sistemas em produção, interfaces em tempo real com vídeo contínuo e telemetria IoT, APIs RESTful, automação e visão computacional."},"copy-navigation":{"text":"Navegação principal"},"copy-aboutTitle":{"text":"Sobre mim"},"copy-aboutBody":{"text":"Bacharel em Ciência da Computação pelo Instituto Federal de Minas Gerais (IFMG), com experiência em desenvolvimento de software e aplicações web. Atuei no desenvolvimento de sistemas em produção, plataformas de monitoramento industrial e projetos envolvendo APIs, processamento de dados e visão computacional."},"copy-experienceTitle":{"text":"Experiências"},"copy-experienceBody":{"text":"Experiências profissionais em engenharia de software e desenvolvimento front-end e fullstack."},"copy-experiencePeriodLabel":{"text":"Período"},"copy-experienceContextLabel":{"text":"Contexto"},"copy-experienceResponsibilitiesLabel":{"text":"Responsabilidades"},"copy-experienceTechnicalDecisionsLabel":{"text":"Decisões técnicas"},"copy-experienceResultsLabel":{"text":"Resultados"},"copy-stackTitle":{"text":"Habilidades"},"copy-stackBody":{"text":"Tecnologias, linguagens, frameworks e ferramentas aplicadas em projetos e sistemas em produção."},"copy-skillsLanguagesRuntimeLabel":{"text":"Linguagens e runtime"},"copy-skillsCorporateIntegrationsLabel":{"text":"Backend e APIs"},"copy-skillsFrontendLabel":{"text":"Frontend e Mobile"},"copy-skillsDevopsObservabilityLabel":{"text":"DevOps e ferramentas"},"copy-skillsDatabasesLabel":{"text":"Bancos de dados"},"copy-skillsVersionControlLabel":{"text":"Visão computacional e Versionamento"},"copy-educationTitle":{"text":"Formação acadêmica"},"copy-educationBody":{"text":"Graduação realizada no Instituto Federal de Minas Gerais (IFMG)."},"copy-educationDataScience":{"text":"Ciência da Computação"},"copy-educationAppliedStatistics":{"text":"Estatística Aplicada"},"copy-educationGraphicDesign":{"text":"Design Gráfico"},"copy-educationInstitutionLabel":{"text":"Instituição"},"copy-educationPeriodLabel":{"text":"Período"},"copy-educationCompetenciesLabel":{"text":"Competências desenvolvidas"},"copy-educationContentLabel":{"text":"Conteúdos estudados"},"copy-educationCurrentLabel":{"text":"Em andamento"},"copy-contactTitle":{"text":"Contato"},"copy-contactBody":{"text":"Canais profissionais e currículos."},"copy-contactLinkedinLabel":{"text":"LinkedIn"},"copy-contactGithubLabel":{"text":"GitHub"},"copy-contactEmailLabel":{"text":"E-mail"},"copy-contactPhoneLabel":{"text":"Telefone"},"copy-contactCurriculumPtLabel":{"text":"Currículo em português"},"copy-contactCurriculumEnLabel":{"text":"Currículo em inglês"},"copy-contactCurriculumDownloadLabel":{"text":"Baixar currículo"},"copy-languageLabel":{"text":"Idioma"},"copy-resultsTitle":{"text":"Resultados profissionais"},"copy-resultsTimeReductionLabel":{"text":"Otimização de carregamento"},"copy-resultsTimeReduction":{"text":"Redução de 85% no tamanho do pacote inicial de carregamento da aplicação com refatoração modular e lazy loading."},"copy-resultsStepsReductionLabel":{"text":"Eficiência de processamento"},"copy-resultsStepsReduction":{"text":"Redução de 83,6% no tempo total de processamento em pipeline de visão computacional."},"copy-resultsUsersServedLabel":{"text":"Clientes atendidos"},"copy-resultsUsersServed":{"text":"Plataforma de automação industrial e visão computacional impactando diretamente mais de 50 clientes corporativos."},"copy-resultsProductivityGainLabel":{"text":"Aceleração de entrega"},"copy-resultsProductivityGain":{"text":"Redução de 60% no tempo de entrega de novas telas com criação de biblioteca padronizada de componentes reutilizáveis."},"copy-projectsTitle":{"text":"Projetos"},"copy-professionalProjectsTitle":{"text":"Projetos profissionais"},"copy-personalProjectsTitle":{"text":"Projetos pessoais"},"copy-projectDescriptionLabel":{"text":"Descrição"},"copy-projectContextLabel":{"text":"Contexto"},"copy-projectRoleLabel":{"text":"Papel desempenhado"},"copy-projectTechnicalDecisionsLabel":{"text":"Decisões técnicas"},"copy-projectTechnologiesLabel":{"text":"Tecnologias"},"copy-projectResultsLabel":{"text":"Resultados"},"copy-projectLearningsLabel":{"text":"Aprendizados"},"copy-projectLinksLabel":{"text":"Links relacionados"},"8a1135e2-b735-438b-a819-381511b94840":{"title":"Desenvolvedor Front-end · SensorEng","context":"Atuação remota em equipe ágil em plataforma de automação industrial e visão computacional na SensorEng, impactando diretamente mais de 50 clientes corporativos."},"8a1135e2-b735-438b-a819-381511b94840-responsibilities-1":{"text":"Liderei a refatoração arquitetural de um monólito legado para uma estrutura modular, implementando carregamento sob demanda e reduzindo em 85% o tamanho do pacote inicial de carregamento da aplicação."},"8a1135e2-b735-438b-a819-381511b94840-responsibilities-2":{"text":"Desenvolvi e evoluí interfaces para monitoramento industrial em tempo real, integrando transmissão de vídeo contínua, inferências de modelos de Inteligência Artificial e telemetria de sensores IoT com mapas georreferenciados."},"8a1135e2-b735-438b-a819-381511b94840-responsibilities-3":{"text":"Criei uma biblioteca interna com componentes reutilizáveis (tabelas dinâmicas, filtros e modais) aplicados em todo o sistema, padronizando a interface de usuário e acelerando em 60% a entrega de novas telas."},"8a1135e2-b735-438b-a819-381511b94840-responsibilities-4":{"text":"Implementei controle de níveis de permissão por perfil de usuário com proteção de rotas e autenticação, assegurando o isolamento seguro de dados entre múltiplas empresas clientes."},"8a1135e2-b735-438b-a819-381511b94840-technicalDecisions-1":{"text":"Arquitetura modular em Angular com lazy loading de rotas."},"8a1135e2-b735-438b-a819-381511b94840-technicalDecisions-2":{"text":"Integração de WebSockets e streaming de vídeo de baixa latência."},"8a1135e2-b735-438b-a819-381511b94840-technicalDecisions-3":{"text":"Controle de acesso baseado em papéis (RBAC) com Route Guards."},"8a1135e2-b735-438b-a819-381511b94840-results-1":{"text":"Redução de 85% no tamanho do pacote inicial de carregamento da aplicação com refatoração modular e lazy loading."},"8a1135e2-b735-438b-a819-381511b94840-results-2":{"text":"Redução de 60% no tempo de entrega de novas telas com criação de biblioteca padronizada de componentes reutilizáveis."},"8a1135e2-b735-438b-a819-381511b94840-results-3":{"text":"Plataforma de automação industrial e visão computacional impactando diretamente mais de 50 clientes corporativos."},"147c2bd9-9ca4-4155-b6ab-8bf4dcf6c9a9":{"title":"Desenvolvedor Júnior Fullstack · Avante Sistemas","context":"Atuação presencial na Avante Sistemas em Formiga (MG), contribuindo para sistemas de gestão empresarial utilizados por diferentes segmentos de negócio."},"147c2bd9-9ca4-4155-b6ab-8bf4dcf6c9a9-responsibilities-1":{"text":"Desenvolvi e mantive funcionalidades em sistemas ERP voltados à gestão empresarial, contribuindo para a evolução dos módulos e processos do sistema."},"147c2bd9-9ca4-4155-b6ab-8bf4dcf6c9a9-responsibilities-2":{"text":"Analisei e corrigi problemas no código e no banco de dados, realizando consultas e ajustes para manutenção e estabilidade dos sistemas."},"147c2bd9-9ca4-4155-b6ab-8bf4dcf6c9a9-responsibilities-3":{"text":"Contribuí para a implementação de novas funcionalidades e adequações dos sistemas às necessidades dos diferentes setores da empresa."},"147c2bd9-9ca4-4155-b6ab-8bf4dcf6c9a9-technicalDecisions-1":{"text":"Otimização de queries relacionais e índices no banco de dados."},"147c2bd9-9ca4-4155-b6ab-8bf4dcf6c9a9-technicalDecisions-2":{"text":"Modularização de rotinas de processamento de regras de negócio."},"147c2bd9-9ca4-4155-b6ab-8bf4dcf6c9a9-results-1":{"text":"Maior estabilidade operacional e redução de falhas em relatórios e rotinas críticas."},"5ab9dd44-8d76-4490-a254-d7bd01029e37":{"title":"Estagiário de Engenharia de Software","context":"Atuação híbrida como aluno bolsista em projeto de extensão no Polo de Inovação do Instituto Federal de Minas Gerais em parceria com o setor privado, desenvolvendo uma plataforma web para automação e concessão de crédito comercial."},"5ab9dd44-8d76-4490-a254-d7bd01029e37-responsibilities-1":{"text":"Desenvolvi serviços de leitura e extração automatizada de dados em documentos usando Visão Computacional e OCR, permitindo o reconhecimento e a classificação de mais de 20 tipos de arquivos (como contratos sociais, demonstrativos financeiros, CNH e documentos veiculares)."},"5ab9dd44-8d76-4490-a254-d7bd01029e37-responsibilities-2":{"text":"Contribuí para a integração entre os diferentes componentes da aplicação e para a manutenção dos serviços existentes."},"5ab9dd44-8d76-4490-a254-d7bd01029e37-technicalDecisions-1":{"text":"Pipelines de OCR para extração e estruturação automatizada de dados."},"5ab9dd44-8d76-4490-a254-d7bd01029e37-technicalDecisions-2":{"text":"Classificação supervisionada de tipos de documentos comerciais."},"5ab9dd44-8d76-4490-a254-d7bd01029e37-results-1":{"text":"Automação do fluxo de concessão e validação de documentos de crédito."},"c2250aa4-f25d-4ad2-9e8d-41a8c0d08bfb":{"title":"Estagiário de Engenharia de Software","context":"Atuação no Polo de Inovação do Instituto Federal de Minas Gerais, desenvolvendo um aplicativo de celular para controle de jornada e frequência dos servidores e colaboradores do campus."},"c2250aa4-f25d-4ad2-9e8d-41a8c0d08bfb-responsibilities-1":{"text":"Desenvolvi uma aplicação mobile multiplataforma integrada ao SUAP, implementando injeção de scripts para autenticação automatizada e registro de ponto."},"c2250aa4-f25d-4ad2-9e8d-41a8c0d08bfb-responsibilities-2":{"text":"Implementei rotinas de web scraping em tempo real para extração e renderização simplificada do histórico de presença do dia (entradas e saídas), mitigando divergências na conferência de frequência."},"c2250aa4-f25d-4ad2-9e8d-41a8c0d08bfb-responsibilities-3":{"text":"Estruturei armazenamento local de credenciais e módulo de agendamento de lembretes com alarmes sonoros, além de validação de conectividade via Wi-Fi institucional para garantir conformidade no registro."},"c2250aa4-f25d-4ad2-9e8d-41a8c0d08bfb-technicalDecisions-1":{"text":"Aplicação móvel multiplataforma com armazenamento seguro de credenciais."},"c2250aa4-f25d-4ad2-9e8d-41a8c0d08bfb-technicalDecisions-2":{"text":"Web scraping integrado ao SUAP para sincronização instantânea de frequência."},"c2250aa4-f25d-4ad2-9e8d-41a8c0d08bfb-technicalDecisions-3":{"text":"Validação de rede Wi-Fi institucional para auditoria de presença."},"c2250aa4-f25d-4ad2-9e8d-41a8c0d08bfb-results-1":{"text":"Mitigação de divergências em registros de ponto e maior pontualidade institucional."},"5b468d55-a913-465e-a69a-a052348efd26":{"name":"Russian Mastery","description":"Plataforma full-stack para aprendizado do idioma russo com repetição espaçada SM-2, simulador de teclado cirílico e sistema de gamificação.","problemContext":"O aprendizado de idiomas com alfabetos distintos exige retenção duradoura de vocabulário, treino de digitação e acompanhamento contínuo de revisões.","solution":"Plataforma completa com front-end reativo, teclado cirílico interativo em tela, exercícios dinâmicos, gamificação com XP/níveis e API RESTful rápida.","role":"Arquiteto e Desenvolvedor Full-Stack do projeto."},"5b468d55-a913-465e-a69a-a052348efd26-technicalDecisions-1":{"text":"Implementação do algoritmo de repetição espaçada SM-2 (SuperMemo-2)."},"5b468d55-a913-465e-a69a-a052348efd26-technicalDecisions-2":{"text":"API RESTful em FastAPI com cache Redis para otimização de consultas da base de +43.000 palavras."},"5b468d55-a913-465e-a69a-a052348efd26-technicalDecisions-3":{"text":"Autenticação JWT, controle de acesso RBAC e conteinerização completa com Docker."},"5b468d55-a913-465e-a69a-a052348efd26-results-1":{"text":"Base de dados com mais de 43.000 palavras e sentenças catalogadas."},"5b468d55-a913-465e-a69a-a052348efd26-results-2":{"text":"Simulador de digitação cirílica interativo com reprodução de pronúncia."},"5b468d55-a913-465e-a69a-a052348efd26-learnings-1":{"text":"Domínio de algoritmos de repetição espaçada para retenção de memória."},"5b468d55-a913-465e-a69a-a052348efd26-learnings-2":{"text":"Arquitetura de cache multi-nível em Redis com persistência PostgreSQL."},"5b468d55-a913-465e-a69a-a052348efd26-link-1":{"label":"GitHub"},"3f6fa6a5-f038-4ae5-a186-42a376465892":{"name":"Pipeline de Visão Computacional para Boxe","description":"Pipeline de visão computacional em tempo real para estimativa de pose, rastreamento de atletas e contagem automatizada de golpes em lutas de boxe (TCC).","problemContext":"A análise esportiva e a arbitragem em esportes de combate exigem detecção precisa de golpes em alta velocidade sem interferência de oclusões e movimentação rápida.","solution":"Pipeline que combina estimativa de pose com modelos YOLO fine-tuned, ROIs dinâmicas, máquina de estados finitos (FSM) para validação de golpes e streaming via celular.","role":"Pesquisador e Desenvolvedor (Trabalho de Conclusão de Curso em Ciência da Computação - IFMG)."},"3f6fa6a5-f038-4ae5-a186-42a376465892-technicalDecisions-1":{"text":"Treinamento e fine-tuning de modelos YOLO em dataset customizado."},"3f6fa6a5-f038-4ae5-a186-42a376465892-technicalDecisions-2":{"text":"Segmentação geométrica com ROIs dinâmicas para o corpo dos atletas, reduzindo em 83,6% o tempo total de processamento."},"3f6fa6a5-f038-4ae5-a186-42a376465892-technicalDecisions-3":{"text":"Autômato de estados finitos (FSM) para contagem de golpes válidos e identificação de faltas."},"3f6fa6a5-f038-4ae5-a186-42a376465892-technicalDecisions-4":{"text":"Integração de app mobile com servidor assíncrono para streaming de vídeo ao vivo."},"3f6fa6a5-f038-4ae5-a186-42a376465892-results-1":{"text":"Redução de 83,6% no tempo de processamento comparado à abordagem de clusterização."},"3f6fa6a5-f038-4ae5-a186-42a376465892-results-2":{"text":"Detecção e contagem automatizada de golpes com alta acurácia."},"3f6fa6a5-f038-4ae5-a186-42a376465892-learnings-1":{"text":"Otimização de inferência de redes neurais para visão computacional em tempo real."},"3f6fa6a5-f038-4ae5-a186-42a376465892-learnings-2":{"text":"Modelagem de máquinas de estados aplicadas a eventos esportivos complexos."},"3f6fa6a5-f038-4ae5-a186-42a376465892-link-1":{"label":"GitHub"},"languages-runtime":{"label":"Linguagens e runtime"},"skill-typescript":{"name":"TypeScript"},"skill-python":{"name":"Python"},"skill-java":{"name":"Java"},"skill-php":{"name":"PHP"},"skill-javascript":{"name":"JavaScript"},"skill-dart":{"name":"Dart"},"corporate-integrations":{"label":"Backend e APIs"},"skill-fastapi":{"name":"FastAPI"},"skill-spring-boot":{"name":"Spring Boot"},"skill-laravel":{"name":"Laravel"},"skill-rest-apis":{"name":"REST APIs"},"skill-jsf":{"name":"JSF"},"frontend":{"label":"Frontend e Mobile"},"skill-angular":{"name":"Angular"},"skill-flutter":{"name":"Flutter"},"skill-html":{"name":"HTML"},"skill-css":{"name":"CSS"},"skill-react":{"name":"React"},"devops-observability":{"label":"DevOps e ferramentas"},"skill-docker":{"name":"Docker"},"skill-gradle":{"name":"Gradle"},"skill-maven":{"name":"Maven"},"skill-grafana":{"name":"Grafana"},"databases":{"label":"Bancos de dados"},"skill-postgresql":{"name":"PostgreSQL"},"skill-supabase":{"name":"Supabase"},"skill-mysql":{"name":"MySQL"},"skill-oracle-database":{"name":"Oracle Database"},"version-control":{"label":"Visão computacional e Versionamento"},"skill-git":{"name":"Git"},"skill-github":{"name":"GitHub"},"skill-gitlab":{"name":"GitLab"},"skill-gitkraken":{"name":"GitKraken"},"skill-opencv":{"name":"OpenCV"},"skill-yolov8":{"name":"YOLOv8"},"computer-science":{"name":"Ciência da Computação","institution":"Instituto Federal de Minas Gerais (IFMG)"},"computer-science-competencies-1":{"text":"Visão Computacional"},"computer-science-competencies-2":{"text":"Inteligência Artificial"},"computer-science-competencies-3":{"text":"Engenharia de Software"},"computer-science-competencies-4":{"text":"Algoritmos e Estruturas de Dados"},"computer-science-competencies-5":{"text":"Redes de Computadores"},"computer-science-competencies-6":{"text":"Bancos de Dados Relacionais"},"computer-science-competencies-7":{"text":"Sistemas Distribuídos"},"computer-science-competencies-8":{"text":"Programação Web e Mobile"},"computer-science-studiedContent-1":{"text":"Bacharelado em Ciência da Computação"},"computer-science-studiedContent-2":{"text":"Trabalho de Conclusão de Curso em Visão Computacional para Análise e Contagem de Golpes em Lutas de Boxe"},"computer-science-studiedContent-3":{"text":"Projetos de extensão e inovação tecnológica com automação, OCR e desenvolvimento web/mobile"},"linkedin":{"label":"LinkedIn"},"github":{"label":"GitHub"},"email":{"label":"E-mail"},"phone":{"label":"Telefone"}},"en":{"copy-eyebrow":{"text":"Professional portfolio"},"copy-presentationTitle":{"text":"Presentation"},"copy-intro":{"text":"João Vitor Dias Fernandes is a Computer Science graduate from IFMG with hands-on experience in software engineering and web application development. Experienced in building production systems, real-time industrial monitoring platforms, and solutions involving APIs, automated data processing, and computer vision."},"copy-navigation":{"text":"Main navigation"},"copy-aboutTitle":{"text":"About me"},"copy-aboutBody":{"text":"Computer Science graduate from the Federal Institute of Minas Gerais (IFMG), with hands-on experience in software engineering and web application development. Experienced in building production systems, real-time industrial monitoring platforms, and solutions involving APIs, automated data processing, and computer vision."},"copy-experienceTitle":{"text":"Experience"},"copy-experienceBody":{"text":"Professional experience in software engineering, frontend and full-stack development."},"copy-experiencePeriodLabel":{"text":"Period"},"copy-experienceContextLabel":{"text":"Context"},"copy-experienceResponsibilitiesLabel":{"text":"Responsibilities"},"copy-experienceTechnicalDecisionsLabel":{"text":"Technical decisions"},"copy-experienceResultsLabel":{"text":"Results"},"copy-stackTitle":{"text":"Skills"},"copy-stackBody":{"text":"Technologies, languages, frameworks and tools applied in production systems and projects."},"copy-skillsLanguagesRuntimeLabel":{"text":"Languages and runtime"},"copy-skillsCorporateIntegrationsLabel":{"text":"Backend and APIs"},"copy-skillsFrontendLabel":{"text":"Frontend and Mobile"},"copy-skillsDevopsObservabilityLabel":{"text":"DevOps and tools"},"copy-skillsDatabasesLabel":{"text":"Databases"},"copy-skillsVersionControlLabel":{"text":"Computer Vision and Version Control"},"copy-educationTitle":{"text":"Academic background"},"copy-educationBody":{"text":"Bachelor of Science completed at Federal Institute of Minas Gerais (IFMG)."},"copy-educationDataScience":{"text":"Computer Science"},"copy-educationAppliedStatistics":{"text":"Applied Statistics"},"copy-educationGraphicDesign":{"text":"Graphic Design"},"copy-educationInstitutionLabel":{"text":"Institution"},"copy-educationPeriodLabel":{"text":"Period"},"copy-educationCompetenciesLabel":{"text":"Developed competencies"},"copy-educationContentLabel":{"text":"Studied content"},"copy-educationCurrentLabel":{"text":"In progress"},"copy-contactTitle":{"text":"Contact"},"copy-contactBody":{"text":"Professional channels and resumes."},"copy-contactLinkedinLabel":{"text":"LinkedIn"},"copy-contactGithubLabel":{"text":"GitHub"},"copy-contactEmailLabel":{"text":"Email"},"copy-contactPhoneLabel":{"text":"Phone"},"copy-contactCurriculumPtLabel":{"text":"Resume in Portuguese"},"copy-contactCurriculumEnLabel":{"text":"Resume in English"},"copy-contactCurriculumDownloadLabel":{"text":"Download resume"},"copy-languageLabel":{"text":"Language"},"copy-resultsTitle":{"text":"Professional results"},"copy-resultsTimeReductionLabel":{"text":"Bundle optimization"},"copy-resultsTimeReduction":{"text":"85% reduction in initial application bundle size through modular architectural refactoring and lazy loading."},"copy-resultsStepsReductionLabel":{"text":"Processing efficiency"},"copy-resultsStepsReduction":{"text":"83.6% reduction in total processing time in a computer vision pipeline."},"copy-resultsUsersServedLabel":{"text":"Clients served"},"copy-resultsUsersServed":{"text":"Industrial automation and computer vision platform directly impacting 50+ enterprise clients."},"copy-resultsProductivityGainLabel":{"text":"Delivery acceleration"},"copy-resultsProductivityGain":{"text":"60% reduction in development time for new screens by creating an internal reusable component library."},"copy-projectsTitle":{"text":"Projects"},"copy-professionalProjectsTitle":{"text":"Professional projects"},"copy-personalProjectsTitle":{"text":"Personal projects"},"copy-projectDescriptionLabel":{"text":"Description"},"copy-projectContextLabel":{"text":"Context"},"copy-projectRoleLabel":{"text":"Role"},"copy-projectTechnicalDecisionsLabel":{"text":"Technical decisions"},"copy-projectTechnologiesLabel":{"text":"Technologies"},"copy-projectResultsLabel":{"text":"Results"},"copy-projectLearningsLabel":{"text":"Learnings"},"copy-projectLinksLabel":{"text":"Related links"},"8a1135e2-b735-438b-a819-381511b94840":{"title":"Frontend Developer · SensorEng","context":"Remote agile software development at SensorEng in an industrial automation and computer vision platform directly serving over 50 enterprise clients."},"8a1135e2-b735-438b-a819-381511b94840-responsibilities-1":{"text":"Led architectural refactoring from a legacy monolith to a modular codebase with lazy loading, reducing the initial bundle size by 85%."},"8a1135e2-b735-438b-a819-381511b94840-responsibilities-2":{"text":"Built real-time industrial monitoring interfaces integrating live video feeds, AI inference overlays, and IoT sensor telemetry over interactive maps."},"8a1135e2-b735-438b-a819-381511b94840-responsibilities-3":{"text":"Authored an internal reusable UI component library (dynamic data tables, filters, modals), standardizing UI patterns and accelerating feature delivery by 60%."},"8a1135e2-b735-438b-a819-381511b94840-responsibilities-4":{"text":"Designed role-based access control (RBAC) with route guards and authentication token policies, enforcing multi-tenant data isolation."},"8a1135e2-b735-438b-a819-381511b94840-technicalDecisions-1":{"text":"Modular Angular architecture with route-level lazy loading."},"8a1135e2-b735-438b-a819-381511b94840-technicalDecisions-2":{"text":"WebSocket telemetry streaming and low-latency video feeds."},"8a1135e2-b735-438b-a819-381511b94840-technicalDecisions-3":{"text":"Role-based access control (RBAC) using Angular route guards."},"8a1135e2-b735-438b-a819-381511b94840-results-1":{"text":"85% reduction in initial application bundle size through modular refactoring and lazy loading."},"8a1135e2-b735-438b-a819-381511b94840-results-2":{"text":"60% reduction in development time for new screens via reusable component library."},"8a1135e2-b735-438b-a819-381511b94840-results-3":{"text":"Platform directly impacting 50+ enterprise clients."},"147c2bd9-9ca4-4155-b6ab-8bf4dcf6c9a9":{"title":"Junior Full-Stack Developer · Avante Sistemas","context":"On-site position at Avante Sistemas in Formiga, MG, building enterprise management solutions across diverse business segments."},"147c2bd9-9ca4-4155-b6ab-8bf4dcf6c9a9-responsibilities-1":{"text":"Developed and maintained features for Enterprise Resource Planning (ERP) software, supporting the evolution of business management modules and workflows."},"147c2bd9-9ca4-4155-b6ab-8bf4dcf6c9a9-responsibilities-2":{"text":"Diagnosed and resolved code and database defects, optimizing SQL queries and applying fixes to improve system stability and reliability."},"147c2bd9-9ca4-4155-b6ab-8bf4dcf6c9a9-responsibilities-3":{"text":"Contributed to implementing new features and tailoring software capabilities to the operational needs of various company departments."},"147c2bd9-9ca4-4155-b6ab-8bf4dcf6c9a9-technicalDecisions-1":{"text":"SQL query optimization and database schema refinements."},"147c2bd9-9ca4-4155-b6ab-8bf4dcf6c9a9-technicalDecisions-2":{"text":"Business process module enhancements."},"147c2bd9-9ca4-4155-b6ab-8bf4dcf6c9a9-results-1":{"text":"Improved system reliability and data processing accuracy."},"5ab9dd44-8d76-4490-a254-d7bd01029e37":{"title":"Software Engineering Intern","context":"Hybrid role as a scholarship research intern in an extension project at the IFMG Innovation Hub in partnership with the private sector, developing a web platform for commercial credit automation and approval."},"5ab9dd44-8d76-4490-a254-d7bd01029e37-responsibilities-1":{"text":"Developed automated document parsing and data extraction services using Computer Vision and OCR, enabling automatic identification and classification of over 20 document types (including articles of association, financial statements, driver’s licenses, and vehicle registrations)."},"5ab9dd44-8d76-4490-a254-d7bd01029e37-responsibilities-2":{"text":"Contributed to integrating application components and maintaining existing services."},"5ab9dd44-8d76-4490-a254-d7bd01029e37-technicalDecisions-1":{"text":"OCR automated extraction pipelines and dynamic parsing."},"5ab9dd44-8d76-4490-a254-d7bd01029e37-technicalDecisions-2":{"text":"Classification of financial and identity documents."},"5ab9dd44-8d76-4490-a254-d7bd01029e37-results-1":{"text":"Streamlined approval workflows and eliminated manual document entry."},"c2250aa4-f25d-4ad2-9e8d-41a8c0d08bfb":{"title":"Software Engineering Intern","context":"Work at the IFMG Innovation Hub, developing a mobile application for daily work hours and attendance tracking for campus faculty and staff."},"c2250aa4-f25d-4ad2-9e8d-41a8c0d08bfb-responsibilities-1":{"text":"Developed a cross-platform mobile application integrated with SUAP, implementing script injection for automated authentication and time-clock registration."},"c2250aa4-f25d-4ad2-9e8d-41a8c0d08bfb-responsibilities-2":{"text":"Built real-time web scraping routines to retrieve and display daily attendance history (clock-in/clock-out events), reducing discrepancies in attendance records."},"c2250aa4-f25d-4ad2-9e8d-41a8c0d08bfb-responsibilities-3":{"text":"Implemented secure local credential storage, a notification scheduling module with audio reminders, and institutional Wi-Fi validation to ensure valid attendance registration."},"c2250aa4-f25d-4ad2-9e8d-41a8c0d08bfb-technicalDecisions-1":{"text":"Cross-platform mobile client with secure local credential storage."},"c2250aa4-f25d-4ad2-9e8d-41a8c0d08bfb-technicalDecisions-2":{"text":"Real-time automated web scraping routines."},"c2250aa4-f25d-4ad2-9e8d-41a8c0d08bfb-technicalDecisions-3":{"text":"Institutional network boundary validation."},"c2250aa4-f25d-4ad2-9e8d-41a8c0d08bfb-results-1":{"text":"Eliminated punch discrepancies and automated administrative compliance."},"5b468d55-a913-465e-a69a-a052348efd26":{"name":"Russian Mastery","description":"Full-stack Russian language learning platform featuring SuperMemo-2 (SM-2) spaced repetition, on-screen Cyrillic keyboard simulator, and gamification.","problemContext":"Learning a language with a distinct alphabet requires dynamic spaced recall, Cyrillic typing muscle memory, and structured progression.","solution":"Full-stack web application with responsive UI, gamified practice sessions with XP and leveling, and an asynchronous backend.","role":"Full-Stack Architect and Developer."},"5b468d55-a913-465e-a69a-a052348efd26-technicalDecisions-1":{"text":"SuperMemo-2 (SM-2) algorithm implementation for spaced interval calculations."},"5b468d55-a913-465e-a69a-a052348efd26-technicalDecisions-2":{"text":"FastAPI RESTful service integrated with Redis caching for 43,000+ words database."},"5b468d55-a913-465e-a69a-a052348efd26-technicalDecisions-3":{"text":"JWT authentication, RBAC, and full Docker containerization."},"5b468d55-a913-465e-a69a-a052348efd26-results-1":{"text":"Database of 43,000+ words and contextual sentences."},"5b468d55-a913-465e-a69a-a052348efd26-results-2":{"text":"Interactive Cyrillic keyboard simulator with audio pronunciation support."},"5b468d55-a913-465e-a69a-a052348efd26-learnings-1":{"text":"Spaced repetition algorithms and dynamic memory scheduling."},"5b468d55-a913-465e-a69a-a052348efd26-learnings-2":{"text":"High-throughput Redis cache design paired with relational persistence."},"5b468d55-a913-465e-a69a-a052348efd26-link-1":{"label":"GitHub"},"3f6fa6a5-f038-4ae5-a186-42a376465892":{"name":"Computer Vision Pipeline for Boxing Matches","description":"Real-time computer vision pipeline for human pose estimation, athlete tracking, and automated strike counting in boxing matches (Bachelor Thesis).","problemContext":"Combat sports analytics and judging require accurate real-time detection of high-velocity strikes without failing under occlusion.","solution":"Computer vision pipeline integrating custom-trained YOLO models, dynamic ROIs, finite-state machine (FSM) strike validation, and live streaming.","role":"Researcher and Developer (Bachelor Thesis in Computer Science - IFMG)."},"3f6fa6a5-f038-4ae5-a186-42a376465892-technicalDecisions-1":{"text":"Custom YOLO model training and fine-tuning on annotated boxing footage."},"3f6fa6a5-f038-4ae5-a186-42a376465892-technicalDecisions-2":{"text":"Geometric segmentation with dynamic ROIs, reducing total processing time by 83.6%."},"3f6fa6a5-f038-4ae5-a186-42a376465892-technicalDecisions-3":{"text":"Finite-state machine (FSM) to classify and count valid strikes and fouls."},"3f6fa6a5-f038-4ae5-a186-42a376465892-technicalDecisions-4":{"text":"Asynchronous backend server streaming live video from a mobile device."},"3f6fa6a5-f038-4ae5-a186-42a376465892-results-1":{"text":"83.6% reduction in total pipeline processing time."},"3f6fa6a5-f038-4ae5-a186-42a376465892-results-2":{"text":"Reliable strike classification and automated count verification."},"3f6fa6a5-f038-4ae5-a186-42a376465892-learnings-1":{"text":"Real-time neural network inference optimizations for high-FPS video."},"3f6fa6a5-f038-4ae5-a186-42a376465892-learnings-2":{"text":"State machine modeling for complex kinetic sports events."},"3f6fa6a5-f038-4ae5-a186-42a376465892-link-1":{"label":"GitHub"},"languages-runtime":{"label":"Languages and runtime"},"skill-typescript":{"name":"TypeScript"},"skill-python":{"name":"Python"},"skill-java":{"name":"Java"},"skill-php":{"name":"PHP"},"skill-javascript":{"name":"JavaScript"},"skill-dart":{"name":"Dart"},"corporate-integrations":{"label":"Backend and APIs"},"skill-fastapi":{"name":"FastAPI"},"skill-spring-boot":{"name":"Spring Boot"},"skill-laravel":{"name":"Laravel"},"skill-rest-apis":{"name":"REST APIs"},"skill-jsf":{"name":"JSF"},"frontend":{"label":"Frontend and Mobile"},"skill-angular":{"name":"Angular"},"skill-flutter":{"name":"Flutter"},"skill-html":{"name":"HTML"},"skill-css":{"name":"CSS"},"skill-react":{"name":"React"},"devops-observability":{"label":"DevOps and tools"},"skill-docker":{"name":"Docker"},"skill-gradle":{"name":"Gradle"},"skill-maven":{"name":"Maven"},"skill-grafana":{"name":"Grafana"},"databases":{"label":"Databases"},"skill-postgresql":{"name":"PostgreSQL"},"skill-supabase":{"name":"Supabase"},"skill-mysql":{"name":"MySQL"},"skill-oracle-database":{"name":"Oracle Database"},"version-control":{"label":"Computer Vision and Version Control"},"skill-git":{"name":"Git"},"skill-github":{"name":"GitHub"},"skill-gitlab":{"name":"GitLab"},"skill-gitkraken":{"name":"GitKraken"},"skill-opencv":{"name":"OpenCV"},"skill-yolov8":{"name":"YOLOv8"},"computer-science":{"name":"Computer Science","institution":"Federal Institute of Minas Gerais (IFMG)"},"computer-science-competencies-1":{"text":"Computer Vision"},"computer-science-competencies-2":{"text":"Artificial Intelligence"},"computer-science-competencies-3":{"text":"Software Engineering"},"computer-science-competencies-4":{"text":"Algorithms and Data Structures"},"computer-science-competencies-5":{"text":"Computer Networks"},"computer-science-competencies-6":{"text":"Relational Databases"},"computer-science-competencies-7":{"text":"Distributed Systems"},"computer-science-competencies-8":{"text":"Web and Mobile Development"},"computer-science-studiedContent-1":{"text":"Bachelor''s Degree in Computer Science"},"computer-science-studiedContent-2":{"text":"Bachelor''s Thesis in Computer Vision for Boxing Matches Strike Detection and Counting"},"computer-science-studiedContent-3":{"text":"Extension and technological innovation projects in automation, OCR, and web/mobile development"},"linkedin":{"label":"LinkedIn"},"github":{"label":"GitHub"},"email":{"label":"Email"},"phone":{"label":"Phone"}}},"technologies":{"angular":{"label":"Angular","aliases":["Angular"]},"typescript":{"label":"TypeScript","iconMediaId":"asset-typescript","aliases":["TypeScript"]},"python":{"label":"Python","aliases":["Python"]},"fastapi":{"label":"FastAPI","aliases":["FastAPI"]},"postgresql":{"label":"PostgreSQL","iconMediaId":"asset-postgresql","aliases":["PostgreSQL"]},"redis":{"label":"Redis","aliases":[]},"docker":{"label":"Docker","iconMediaId":"asset-docker","aliases":["Docker"]},"opencv":{"label":"OpenCV","aliases":["OpenCV"]},"yolov8":{"label":"YOLOv8","aliases":["YOLOv8"]},"mediapipe":{"label":"MediaPipe","aliases":[]},"flutter":{"label":"Flutter","aliases":["Flutter"]},"rest-apis":{"label":"REST APIs","iconMediaId":"asset-rest-apis","aliases":["REST APIs"]},"java":{"label":"Java","iconMediaId":"asset-java","aliases":[]},"php":{"label":"PHP","aliases":[]},"javascript":{"label":"JavaScript","iconMediaId":"asset-javascript","aliases":[]},"dart":{"label":"Dart","aliases":[]},"spring-boot":{"label":"Spring Boot","aliases":[]},"laravel":{"label":"Laravel","aliases":[]},"jsf":{"label":"JSF","aliases":[]},"html":{"label":"HTML","iconMediaId":"asset-html","aliases":[]},"css":{"label":"CSS","iconMediaId":"asset-css","aliases":[]},"react":{"label":"React","iconMediaId":"asset-react","aliases":[]},"gradle":{"label":"Gradle","aliases":[]},"maven":{"label":"Maven","aliases":[]},"grafana":{"label":"Grafana","iconMediaId":"asset-grafana","aliases":[]},"supabase":{"label":"Supabase","aliases":[]},"mysql":{"label":"MySQL","iconMediaId":"asset-mysql","aliases":[]},"oracle-database":{"label":"Oracle Database","aliases":[]},"git":{"label":"Git","iconMediaId":"asset-git","aliases":[]},"github":{"label":"GitHub","iconMediaId":"asset-github","aliases":[]},"gitlab":{"label":"GitLab","aliases":[]},"gitkraken":{"label":"GitKraken","aliases":[]}},"media":{"asset-typescript":{"source":"bundled","mime":"image/png","bytes":619,"assetPath":"/assets/skills/typescript.png"},"asset-java":{"source":"bundled","mime":"image/png","bytes":1860,"assetPath":"/assets/skills/java.png"},"asset-javascript":{"source":"bundled","mime":"image/png","bytes":618,"assetPath":"/assets/skills/javascript.png"},"asset-rest-apis":{"source":"bundled","mime":"image/png","bytes":771,"assetPath":"/assets/skills/rest-apis.png"},"asset-html":{"source":"bundled","mime":"image/png","bytes":1028,"assetPath":"/assets/skills/html.png"},"asset-css":{"source":"bundled","mime":"image/png","bytes":1118,"assetPath":"/assets/skills/css.png"},"asset-react":{"source":"bundled","mime":"image/png","bytes":2494,"assetPath":"/assets/skills/react.png"},"asset-docker":{"source":"bundled","mime":"image/png","bytes":678,"assetPath":"/assets/skills/docker.png"},"asset-grafana":{"source":"bundled","mime":"image/png","bytes":2231,"assetPath":"/assets/skills/grafana.png"},"asset-postgresql":{"source":"bundled","mime":"image/png","bytes":1902,"assetPath":"/assets/skills/postgresql.png"},"asset-mysql":{"source":"bundled","mime":"image/png","bytes":1188,"assetPath":"/assets/skills/mysql.png"},"asset-git":{"source":"bundled","mime":"image/png","bytes":675,"assetPath":"/assets/skills/git.png"},"asset-github":{"source":"bundled","mime":"image/png","bytes":1028,"assetPath":"/assets/skills/github.png"}}}'::jsonb; begin
insert into portfolio_editorial.draft_locales(draft_id,code,label,direction,status,position) values (1,'en','English','ltr','active',1) on conflict(draft_id,code) do update set label=excluded.label,status=excluded.status,position=excluded.position;
insert into portfolio_editorial.draft_entities(draft_id,id,kind,parent_id,position,data) select 1,e.key,e.value->>'kind',nullif(e.value->>'parentId',''),(e.value->>'position')::int,e.value->'data' from jsonb_each(payload->'entities') e on conflict(draft_id,id) do update set kind=excluded.kind,parent_id=excluded.parent_id,position=excluded.position,data=excluded.data;
insert into portfolio_editorial.draft_translations(draft_id,entity_id,locale_code,fields) select 1,e.key,l.key,l.value->e.key from jsonb_each(payload->'entities') e cross join jsonb_each(payload->'translations') l on conflict(draft_id,entity_id,locale_code) do update set fields=excluded.fields;
insert into portfolio_editorial.technologies(id,label,aliases,bundled_asset) select t.key,t.value->>'label',array(select jsonb_array_elements_text(t.value->'aliases')),case when t.value ? 'iconMediaId' then payload->'media'->(t.value->>'iconMediaId')->>'assetPath' end from jsonb_each(payload->'technologies') t on conflict(id) do update set label=excluded.label,aliases=excluded.aliases,bundled_asset=excluded.bundled_asset;
insert into portfolio_editorial.publications(id,format_version,snapshot,hash,source_revision) values ('00000000-0000-4000-8000-000000000001',1,payload,'242724dab0b7fa9c73d4201737b0bcb56eef28fa496a79459cd7051e49b4bef6',0) on conflict(id) do nothing;
update portfolio_editorial.draft set base_publication_id='00000000-0000-4000-8000-000000000001',updated_at=now() where id=1;
update portfolio_editorial.site_state set active_publication_id='00000000-0000-4000-8000-000000000001',updated_at=now() where id=1;
end $$;

-- Migration: 20260926110000_create_atomic_editorial_commands.sql
-- T-008 / ADR-008: atomic, revisioned and idempotent draft commands.

create table if not exists portfolio_editorial.operations (
  operation_id uuid primary key,
  actor_id uuid not null,
  type text not null check (type in ('draft_command')),
  request_hash text not null check (request_hash ~ '^[0-9a-f]{64}$'),
  revision bigint not null check (revision > 0),
  result jsonb not null check (jsonb_typeof(result) = 'object'),
  created_at timestamptz not null default now()
);
alter table portfolio_editorial.operations enable row level security;
alter table portfolio_editorial.operations force row level security;
create index if not exists operations_actor_created_idx
  on portfolio_editorial.operations (actor_id, created_at desc);

grant select, update on portfolio_editorial.draft to portfolio_editorial_executor;
grant select, insert, update, delete on portfolio_editorial.draft_entities to portfolio_editorial_executor;
grant select, insert, update, delete on portfolio_editorial.draft_translations to portfolio_editorial_executor;
grant select on portfolio_editorial.draft_locales, portfolio_editorial.technologies to portfolio_editorial_executor;
grant select, insert on portfolio_editorial.operations to portfolio_editorial_executor;
grant usage on schema extensions to portfolio_editorial_executor;
grant execute on function extensions.digest(text,text) to portfolio_editorial_executor;
grant usage on schema extensions to portfolio_editorial_executor;
grant execute on function extensions.digest(text,text) to portfolio_editorial_executor;

drop policy if exists draft_executor_update on portfolio_editorial.draft;
create policy draft_executor_update on portfolio_editorial.draft
  for update to portfolio_editorial_executor using (true) with check (true);
drop policy if exists draft_entities_executor_all on portfolio_editorial.draft_entities;
create policy draft_entities_executor_all on portfolio_editorial.draft_entities
  for all to portfolio_editorial_executor using (true) with check (true);
drop policy if exists draft_translations_executor_all on portfolio_editorial.draft_translations;
create policy draft_translations_executor_all on portfolio_editorial.draft_translations
  for all to portfolio_editorial_executor using (true) with check (true);
drop policy if exists draft_locales_executor_select on portfolio_editorial.draft_locales;
create policy draft_locales_executor_select on portfolio_editorial.draft_locales
  for select to portfolio_editorial_executor using (true);
drop policy if exists technologies_executor_select on portfolio_editorial.technologies;
create policy technologies_executor_select on portfolio_editorial.technologies
  for select to portfolio_editorial_executor using (true);
drop policy if exists operations_executor_all on portfolio_editorial.operations;
create policy operations_executor_all on portfolio_editorial.operations
  for all to portfolio_editorial_executor using (true) with check (true);
drop policy if exists operations_owner_all on portfolio_editorial.operations;
create policy operations_owner_all on portfolio_editorial.operations
  for all to portfolio_editorial_owner using (true) with check (true);

create function portfolio_editorial.allowed_entity_fields(entity_kind text, translated boolean)
returns text[] language sql immutable set search_path = '' as $$
  select case
    when translated and entity_kind = 'presentation' then array['eyebrow','title','displayName','summary']
    when translated and entity_kind = 'about' then array['title','body']
    when translated and entity_kind = 'result' then array['title','description','value']
    when translated and entity_kind = 'experience' then array['title','context']
    when translated and entity_kind = 'skillCategory' then array['label']
    when translated and entity_kind = 'skill' then array['name']
    when translated and entity_kind = 'academic' then array['name','institution']
    when translated and entity_kind = 'project' then array['name','description','problemContext','solution','role']
    when translated and entity_kind = 'contact' then array['label']
    when translated and entity_kind = 'projectLink' then array['label']
    when translated and entity_kind = 'projectImage' then array['alt']
    when translated and entity_kind = 'curriculum' then array['label']
    when translated and entity_kind in ('interfaceText','listItem') then array['text']
    when not translated and entity_kind = 'experience' then array['startDate','endDate']
    when not translated and entity_kind = 'skill' then array['technologyId','iconMediaId']
    when not translated and entity_kind = 'academic' then array['startDate','endDate','isCurrent']
    when not translated and entity_kind = 'project' then array['type']
    when not translated and entity_kind = 'contact' then array['symbol','href']
    when not translated and entity_kind = 'projectLink' then array['href']
    when not translated and entity_kind = 'projectImage' then array['mediaId']
    when not translated and entity_kind = 'curriculum' then array['mediaId','localeCode']
    when not translated and entity_kind = 'interfaceText' then array['key']
    when not translated and entity_kind = 'listItem' then array['collection']
    else array[]::text[] end
$$;

create function portfolio_editorial.apply_draft_command(
  expected_revision bigint, operation_id uuid, command jsonb, actor uuid
) returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  current_revision bigint; command_type text; request_hash text;
  existing portfolio_editorial.operations%rowtype; entity portfolio_editorial.draft_entities%rowtype;
  entity_id text; entity_kind text; target_parent_id text; field_name text; locale_code text;
  new_position integer; ids text[]; current_ids text[]; item record; receipt jsonb;
begin
  actor := portfolio_editorial.require_editorial_admin(actor);
  if command is null or jsonb_typeof(command) <> 'object' then
    raise exception 'command must be an object' using errcode = '22023';
  end if;
  command_type := command ->> 'type';
  request_hash := encode(extensions.digest(command::text, 'sha256'), 'hex');
  select * into existing from portfolio_editorial.operations where operations.operation_id = apply_draft_command.operation_id;
  if found then
    if existing.actor_id <> actor or existing.request_hash <> request_hash then
      raise exception 'operation id already used with another request' using errcode = '23505';
    end if;
    return existing.result || jsonb_build_object('repeated', true);
  end if;

  select revision into current_revision from portfolio_editorial.draft where id = 1 for update;
  if current_revision <> expected_revision then
    raise exception 'revision conflict' using errcode = '40001', detail = current_revision::text;
  end if;

  entity_id := command ->> 'entityId';
  if command_type in ('set_field','set_translation','remove_entity') then
    select * into entity from portfolio_editorial.draft_entities where draft_id = 1 and id = entity_id;
    if not found then raise exception 'entity not found' using errcode = '22023'; end if;
  end if;

  if command_type = 'set_field' then
    field_name := command ->> 'field';
    if not (command ? 'value')
      or not (field_name = any(portfolio_editorial.allowed_entity_fields(entity.kind, false)))
      or (field_name = 'href' and (jsonb_typeof(command -> 'value') <> 'string'
        or (command ->> 'value') !~ '^(https://|mailto:|tel:)'))
      or (field_name in ('startDate','endDate') and command -> 'value' <> 'null'::jsonb
        and (jsonb_typeof(command -> 'value') <> 'string' or (command ->> 'value') !~ '^\d{4}-\d{2}-\d{2}$'))
      or (field_name = 'isCurrent' and jsonb_typeof(command -> 'value') <> 'boolean')
      or (field_name = 'type' and (command ->> 'value') not in ('professional','personal')) then
      raise exception 'field is not editable for entity kind' using errcode = '22023';
    end if;
    update portfolio_editorial.draft_entities set data = jsonb_set(data, array[field_name], command -> 'value', true)
    where draft_id = 1 and id = entity_id;
  elsif command_type = 'set_translation' then
    field_name := command ->> 'field'; locale_code := command ->> 'locale';
    if jsonb_typeof(command -> 'value') <> 'string'
      or (command ->> 'value') ~ '<[^>]+>'
      or not (field_name = any(portfolio_editorial.allowed_entity_fields(entity.kind, true)))
      or not exists (select 1 from portfolio_editorial.draft_locales where draft_id = 1 and code = locale_code) then
      raise exception 'invalid translated field' using errcode = '22023';
    end if;
    insert into portfolio_editorial.draft_translations(draft_id,entity_id,locale_code,fields)
    values (1,entity_id,locale_code,jsonb_build_object(field_name,command -> 'value'))
    on conflict on constraint draft_translations_pkey do update
      set fields = jsonb_set(portfolio_editorial.draft_translations.fields,array[field_name],command -> 'value',true);
  elsif command_type = 'add_entity' then
    entity_kind := command ->> 'kind'; target_parent_id := command ->> 'parentId'; new_position := (command ->> 'position')::integer;
    if entity_id !~ '^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$' or new_position < 0
      or jsonb_typeof(command -> 'data') <> 'object' or jsonb_typeof(command -> 'translations') <> 'object'
      or exists (select 1 from jsonb_object_keys(command -> 'data') key where not (key = any(portfolio_editorial.allowed_entity_fields(entity_kind,false))))
      or (target_parent_id is not null and not exists(select 1 from portfolio_editorial.draft_entities where draft_id=1 and id=target_parent_id)) then
      raise exception 'invalid entity payload' using errcode = '22023';
    end if;
    update portfolio_editorial.draft_entities set position = position + 100000
      where draft_id=1 and kind=entity_kind and parent_id is not distinct from target_parent_id and position >= new_position;
    update portfolio_editorial.draft_entities set position = position - 99999
      where draft_id=1 and kind=entity_kind and parent_id is not distinct from target_parent_id and position >= 100000;
    insert into portfolio_editorial.draft_entities(draft_id,id,kind,parent_id,position,data)
      values(1,entity_id,entity_kind,target_parent_id,new_position,command -> 'data');
    for item in select key,value from jsonb_each(command -> 'translations') loop
      if not exists(select 1 from portfolio_editorial.draft_locales where draft_id=1 and code=item.key)
        or jsonb_typeof(item.value) <> 'object'
        or exists(select 1 from jsonb_object_keys(item.value) key where not (key = any(portfolio_editorial.allowed_entity_fields(entity_kind,true)))) then
        raise exception 'invalid entity translations' using errcode = '22023';
      end if;
      insert into portfolio_editorial.draft_translations(draft_id,entity_id,locale_code,fields) values(1,entity_id,item.key,item.value);
    end loop;
  elsif command_type = 'remove_entity' then
    delete from portfolio_editorial.draft_entities where draft_id=1 and id=entity_id;
  elsif command_type = 'reorder_collection' then
    entity_kind := command ->> 'kind'; target_parent_id := command ->> 'parentId';
    select array_agg(value order by ordinality) into ids from jsonb_array_elements_text(command -> 'entityIds') with ordinality;
    select array_agg(id order by id) into current_ids from portfolio_editorial.draft_entities
      where draft_id=1 and kind=entity_kind and draft_entities.parent_id is not distinct from target_parent_id;
    if ids is null or (select array_agg(x order by x) from unnest(ids) x) is distinct from current_ids
      or cardinality(ids) <> (select count(distinct x) from unnest(ids) x) then
      raise exception 'reorder must contain the exact collection' using errcode = '22023';
    end if;
    update portfolio_editorial.draft_entities set position = position + 100000
      where draft_id=1 and kind=entity_kind and draft_entities.parent_id is not distinct from target_parent_id;
    for new_position in 1..cardinality(ids) loop
      update portfolio_editorial.draft_entities set position=new_position-1 where draft_id=1 and id=ids[new_position];
    end loop;
  else raise exception 'unknown command type' using errcode = '22023'; end if;

  current_revision := current_revision + 1;
  update portfolio_editorial.draft set revision=current_revision,updated_at=now() where id=1;
  receipt := jsonb_build_object('operationId',operation_id,'revision',current_revision,'repeated',false);
  insert into portfolio_editorial.operations(operation_id,actor_id,type,request_hash,revision,result)
    values(operation_id,actor,'draft_command',request_hash,current_revision,receipt);
  return receipt;
end
$$;

create function public.save_editor_command(expected_revision bigint, operation_id uuid, command jsonb)
returns jsonb language sql security definer set search_path = '' as $$
  select portfolio_editorial.apply_draft_command(expected_revision,operation_id,command,
    coalesce(nullif(current_setting('request.jwt.claim.sub',true),''),nullif(current_setting('request.jwt.claims',true),'')::jsonb->>'sub')::uuid)
$$;

revoke all on portfolio_editorial.operations from public,anon,authenticated,service_role;
revoke all on function portfolio_editorial.allowed_entity_fields(text,boolean),
  portfolio_editorial.apply_draft_command(bigint,uuid,jsonb,uuid) from public,anon,authenticated,service_role;
revoke all on function public.save_editor_command(bigint,uuid,jsonb) from public,anon;
grant execute on function public.save_editor_command(bigint,uuid,jsonb) to authenticated;

alter table portfolio_editorial.operations owner to portfolio_editorial_owner;
grant create on schema portfolio_editorial to portfolio_editorial_executor;
alter function portfolio_editorial.allowed_entity_fields(text,boolean) owner to portfolio_editorial_executor;
alter function portfolio_editorial.apply_draft_command(bigint,uuid,jsonb,uuid) owner to portfolio_editorial_executor;
grant create on schema public to portfolio_editorial_executor;
alter function public.save_editor_command(bigint,uuid,jsonb) owner to portfolio_editorial_executor;
revoke create on schema public from portfolio_editorial_executor;
revoke create on schema portfolio_editorial from portfolio_editorial_executor;


-- Migration: 20260926113000_validate_editorial_publication.sql
-- T-010 / ADR-008: authoritative validation and deterministic review summary.

create function portfolio_editorial.required_translation_fields(entity_kind text)
returns text[] language sql immutable set search_path = '' as $$
  select case entity_kind
    when 'presentation' then array['title','displayName','summary']
    when 'about' then array['title','body']
    when 'result' then array['title','value']
    when 'experience' then array['title','context']
    when 'skillCategory' then array['label']
    when 'skill' then array['name']
    when 'academic' then array['name','institution']
    when 'project' then array['name','description','problemContext']
    when 'contact' then array['label']
    when 'projectLink' then array['label']
    when 'projectImage' then array['alt']
    when 'curriculum' then array['label']
    when 'interfaceText' then array['text']
    when 'listItem' then array['text']
    else array[]::text[] end
$$;

grant select on portfolio_editorial.publications to portfolio_editorial_executor;

create function portfolio_editorial.validate_publication(expected_revision bigint, actor uuid)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  current_revision bigint; base_snapshot jsonb; errors jsonb; summary jsonb;
  draft_document jsonb; review_hash text;
begin
  actor := portfolio_editorial.require_editorial_admin(actor);
  select revision into current_revision from portfolio_editorial.draft where id=1 for share;
  if current_revision <> expected_revision then
    raise exception 'revision conflict' using errcode='40001', detail=current_revision::text;
  end if;
  select p.snapshot into base_snapshot from portfolio_editorial.draft d
    left join portfolio_editorial.publications p on p.id=d.base_publication_id where d.id=1;

  select coalesce(jsonb_agg(issue order by issue->>'path'),'[]'::jsonb) into errors from (
    select jsonb_build_object('code','incomplete_locale','path',format('translations.%s.%s.%s',l.code,e.id,f.field),
      'message','Campo obrigatório ausente.') issue
    from portfolio_editorial.draft_locales l cross join portfolio_editorial.draft_entities e
    cross join lateral unnest(portfolio_editorial.required_translation_fields(e.kind)) f(field)
    left join portfolio_editorial.draft_translations t on t.draft_id=e.draft_id and t.entity_id=e.id and t.locale_code=l.code
    where l.draft_id=1 and l.status='active'
      and (t.fields is null or nullif(btrim(t.fields->>f.field),'') is null)
    union all
    select jsonb_build_object('code','unsafe_url','path',format('entities.%s.data.%s',e.id,k.key),
      'message','URL deve usar https, mailto ou tel.')
    from portfolio_editorial.draft_entities e cross join lateral jsonb_each_text(e.data) k
    where k.key='href' and k.value !~ '^(https://|mailto:|tel:)'
    union all
    select jsonb_build_object('code','media_not_ready','path',format('media.%s',r.media_id),
      'message','Mídia associada não está pronta.')
    from portfolio_editorial.draft_media_refs r join portfolio_editorial.media m on m.id=r.media_id
    where m.status <> 'ready'
  ) validation;

  select jsonb_build_object(
    'entities',coalesce(jsonb_object_agg(e.id,jsonb_build_object('kind',e.kind,'parentId',e.parent_id,'position',e.position,'data',e.data)
      order by e.id),'{}'::jsonb),
    'translations',coalesce((select jsonb_object_agg(locale_code,items order by locale_code) from (
      select locale_code,jsonb_object_agg(entity_id,fields order by entity_id) items
      from portfolio_editorial.draft_translations group by locale_code) translations),'{}'::jsonb),
    'locales',coalesce((select jsonb_agg(jsonb_build_object('code',code,'label',label,'direction',direction,'status',status,'position',position)
      order by position) from portfolio_editorial.draft_locales where draft_id=1),'[]'::jsonb),
    'media',coalesce((select jsonb_agg(jsonb_build_object('entityId',entity_id,'field',field,'mediaId',media_id,'position',position)
      order by entity_id,field,position) from portfolio_editorial.draft_media_refs where draft_id=1),'[]'::jsonb)
  ) into draft_document from portfolio_editorial.draft_entities e where e.draft_id=1;

  select jsonb_build_object(
    'added',count(*) filter(where base_snapshot is null or not (base_snapshot->'entities' ? e.id)),
    'removed',case when base_snapshot is null then 0 else (select count(*) from jsonb_object_keys(base_snapshot->'entities') id
      where not exists(select 1 from portfolio_editorial.draft_entities d where d.id=id)) end,
    'changed',count(*) filter(where base_snapshot->'entities'->e.id is distinct from
      jsonb_strip_nulls(jsonb_build_object('kind',e.kind,'parentId',e.parent_id,'position',e.position,'data',e.data))),
    'reordered',count(*) filter(where (base_snapshot->'entities'->e.id->>'position')::integer is distinct from e.position),
    'translations',(select count(*) from portfolio_editorial.draft_locales where draft_id=1),
    'media',jsonb_array_length(draft_document->'media')
  ) into summary from portfolio_editorial.draft_entities e where e.draft_id=1;

  review_hash := encode(extensions.digest((jsonb_build_object('revision',current_revision,'draft',draft_document))::text,'sha256'),'hex');
  return jsonb_build_object('revision',current_revision,'valid',jsonb_array_length(errors)=0,
    'errors',errors,'summary',summary,'reviewHash',review_hash);
end $$;

create function public.validate_editor_publication(expected_revision bigint)
returns jsonb language sql security definer set search_path='' as $$
  select portfolio_editorial.validate_publication(expected_revision,
    coalesce(nullif(current_setting('request.jwt.claim.sub',true),''),nullif(current_setting('request.jwt.claims',true),'')::jsonb->>'sub')::uuid)
$$;

revoke all on function portfolio_editorial.required_translation_fields(text),
  portfolio_editorial.validate_publication(bigint,uuid) from public,anon,authenticated,service_role;
revoke all on function public.validate_editor_publication(bigint) from public,anon;
grant execute on function public.validate_editor_publication(bigint) to authenticated;
grant create on schema portfolio_editorial to portfolio_editorial_executor;
alter function portfolio_editorial.required_translation_fields(text) owner to portfolio_editorial_executor;
alter function portfolio_editorial.validate_publication(bigint,uuid) owner to portfolio_editorial_executor;
grant create on schema public to portfolio_editorial_executor;
alter function public.validate_editor_publication(bigint) owner to portfolio_editorial_executor;
revoke create on schema public from portfolio_editorial_executor;
revoke create on schema portfolio_editorial from portfolio_editorial_executor;


-- Migration: 20260926120000_publish_editorial_draft.sql
-- T-011 / ADR-008: transactional and idempotent publication.

alter table portfolio_editorial.operations drop constraint if exists operations_type_check;
alter table portfolio_editorial.operations add constraint operations_type_check
  check (type in ('draft_command','publication'));
alter table portfolio_editorial.operations drop constraint if exists operations_revision_check;
alter table portfolio_editorial.operations add constraint operations_revision_check check (revision >= 0);
alter table portfolio_editorial.operations drop constraint if exists operations_revision_check;
alter table portfolio_editorial.operations add constraint operations_revision_check check (revision >= 0);

grant insert on portfolio_editorial.publications to portfolio_editorial_executor;
grant select, update on portfolio_editorial.site_state to portfolio_editorial_executor;
drop policy if exists publications_executor_select on portfolio_editorial.publications;
create policy publications_executor_select on portfolio_editorial.publications
  for select to portfolio_editorial_executor using (true);
drop policy if exists publications_executor_insert on portfolio_editorial.publications;
create policy publications_executor_insert on portfolio_editorial.publications
  for insert to portfolio_editorial_executor with check (true);
drop policy if exists site_state_executor_select on portfolio_editorial.site_state;
create policy site_state_executor_select on portfolio_editorial.site_state
  for select to portfolio_editorial_executor using (true);
drop policy if exists site_state_executor_update on portfolio_editorial.site_state;
create policy site_state_executor_update on portfolio_editorial.site_state
  for update to portfolio_editorial_executor using (true) with check (true);

create function portfolio_editorial.build_publication_content()
returns jsonb language plpgsql stable security definer set search_path='' as $$
declare base_snapshot jsonb; result jsonb;
begin
  select p.snapshot into base_snapshot from portfolio_editorial.draft d
    left join portfolio_editorial.publications p on p.id=d.base_publication_id where d.id=1;
  select jsonb_build_object(
    'formatVersion',1,
    'defaultLocale','pt-BR',
    'locales',coalesce((select jsonb_agg(jsonb_build_object('code',code,'label',label,'direction',direction,'position',position) order by position)
      from portfolio_editorial.draft_locales where draft_id=1 and status='active'),'[]'::jsonb),
    'sections',coalesce(base_snapshot->'sections','[]'::jsonb),
    'entities',coalesce((select jsonb_object_agg(id,jsonb_strip_nulls(jsonb_build_object('kind',kind,'parentId',parent_id,'position',position,'data',data)) order by id)
      from portfolio_editorial.draft_entities where draft_id=1),'{}'::jsonb),
    'translations',coalesce((select jsonb_object_agg(locale_code,items order by locale_code) from (
      select t.locale_code,jsonb_object_agg(t.entity_id,t.fields order by t.entity_id) items
      from portfolio_editorial.draft_translations t join portfolio_editorial.draft_locales l
        on l.draft_id=t.draft_id and l.code=t.locale_code and l.status='active'
      where t.draft_id=1 group by t.locale_code) x),'{}'::jsonb),
    'technologies',coalesce(base_snapshot->'technologies','{}'::jsonb),
    'media',coalesce(base_snapshot->'media','{}'::jsonb) || coalesce((select jsonb_object_agg(m.id::text,
      jsonb_build_object('source','managed','mime',m.mime,'bytes',m.bytes) order by m.id)
      from portfolio_editorial.media m join portfolio_editorial.draft_media_refs r on r.media_id=m.id
      where r.draft_id=1 and m.status='ready'),'{}'::jsonb)
  ) into result;
  return result;
end $$;

create function portfolio_editorial.publish_draft(
  expected_revision bigint, operation_id uuid, review_hash text, actor uuid
) returns jsonb language plpgsql security definer set search_path='' as $$
declare current_revision bigint; existing portfolio_editorial.operations%rowtype;
  validation jsonb; request_hash text; content jsonb; active_snapshot jsonb;
  publication_id uuid; created_at timestamptz; snapshot jsonb; snapshot_hash text; receipt jsonb;
begin
  actor := portfolio_editorial.require_editorial_admin(actor);
  request_hash := encode(extensions.digest(jsonb_build_object('revision',expected_revision,'reviewHash',review_hash)::text,'sha256'),'hex');
  select * into existing from portfolio_editorial.operations o where o.operation_id=publish_draft.operation_id;
  if found then
    if existing.actor_id<>actor or existing.request_hash<>request_hash or existing.type<>'publication' then
      raise exception 'operation id already used with another request' using errcode='23505'; end if;
    return existing.result || jsonb_build_object('repeated',true);
  end if;
  select revision into current_revision from portfolio_editorial.draft where id=1 for update;
  perform 1 from portfolio_editorial.site_state where id=1 for update;
  if current_revision<>expected_revision then raise exception 'revision conflict' using errcode='40001',detail=current_revision::text; end if;
  validation := portfolio_editorial.validate_publication(expected_revision,actor);
  if validation->>'valid'<>'true' then raise exception 'draft validation failed' using errcode='22023',detail=(validation->'errors')::text; end if;
  if validation->>'reviewHash'<>review_hash then raise exception 'review hash conflict' using errcode='40001'; end if;
  content := portfolio_editorial.build_publication_content();
  select p.snapshot into active_snapshot from portfolio_editorial.site_state s
    left join portfolio_editorial.publications p on p.id=s.active_publication_id where s.id=1;
  if active_snapshot - 'publicationId' - 'createdAt' = content then
    publication_id := (active_snapshot->>'publicationId')::uuid;
  else
    publication_id := gen_random_uuid(); created_at := clock_timestamp();
    snapshot := content || jsonb_build_object('publicationId',publication_id,'createdAt',created_at);
    snapshot_hash := encode(extensions.digest(snapshot::text,'sha256'),'hex');
    insert into portfolio_editorial.publications(id,format_version,snapshot,hash,source_revision)
      values(publication_id,1,snapshot,snapshot_hash,current_revision);
    update portfolio_editorial.site_state set active_publication_id=publication_id,updated_at=now() where id=1;
  end if;
  update portfolio_editorial.draft set base_publication_id=publication_id,updated_at=now() where id=1;
  receipt:=jsonb_build_object('operationId',operation_id,'revision',current_revision,'publicationId',publication_id,'repeated',false);
  insert into portfolio_editorial.operations(operation_id,actor_id,type,request_hash,revision,result)
    values(operation_id,actor,'publication',request_hash,current_revision,receipt);
  return receipt;
end $$;

create function public.publish_editor_draft(expected_revision bigint,operation_id uuid,review_hash text)
returns jsonb language sql security definer set search_path='' as $$
 select portfolio_editorial.publish_draft(expected_revision,operation_id,review_hash,
  coalesce(nullif(current_setting('request.jwt.claim.sub',true),''),nullif(current_setting('request.jwt.claims',true),'')::jsonb->>'sub')::uuid)
$$;
revoke all on function portfolio_editorial.build_publication_content(),
 portfolio_editorial.publish_draft(bigint,uuid,text,uuid) from public,anon,authenticated,service_role;
revoke all on function public.publish_editor_draft(bigint,uuid,text) from public,anon;
grant execute on function public.publish_editor_draft(bigint,uuid,text) to authenticated;
grant create on schema portfolio_editorial to portfolio_editorial_executor;
alter function portfolio_editorial.build_publication_content() owner to portfolio_editorial_executor;
alter function portfolio_editorial.publish_draft(bigint,uuid,text,uuid) owner to portfolio_editorial_executor;
grant create on schema public to portfolio_editorial_executor;
alter function public.publish_editor_draft(bigint,uuid,text) owner to portfolio_editorial_executor;
revoke create on schema public from portfolio_editorial_executor;
revoke create on schema portfolio_editorial from portfolio_editorial_executor;


-- Migration: 20260926123000_create_versioned_public_reader.sql
-- T-012 / ADR-008: immutable public reads with a 30-minute navigation window.
create table if not exists portfolio_editorial.publication_access(
 publication_id uuid primary key references portfolio_editorial.publications(id) on delete cascade,
 public_until timestamptz,
 created_at timestamptz not null default now()
);
alter table portfolio_editorial.publication_access enable row level security;
alter table portfolio_editorial.publication_access force row level security;
grant select,insert,update on portfolio_editorial.publication_access to portfolio_editorial_executor;
drop policy if exists publication_access_executor_all on portfolio_editorial.publication_access;
create policy publication_access_executor_all on portfolio_editorial.publication_access
 for all to portfolio_editorial_executor using(true) with check(true);
drop policy if exists publication_access_owner_all on portfolio_editorial.publication_access;
create policy publication_access_owner_all on portfolio_editorial.publication_access
 for all to portfolio_editorial_owner using(true) with check(true);
insert into portfolio_editorial.publication_access(publication_id,public_until)
 select active_publication_id,null from portfolio_editorial.site_state where active_publication_id is not null;

create function portfolio_editorial.track_publication_access()
returns trigger language plpgsql set search_path='' as $$ begin
 if old.active_publication_id is distinct from new.active_publication_id then
  if old.active_publication_id is not null then
   insert into portfolio_editorial.publication_access(publication_id,public_until) values(old.active_publication_id,now()+interval '30 minutes')
   on conflict(publication_id) do update set public_until=excluded.public_until;
  end if;
  if new.active_publication_id is not null then
   insert into portfolio_editorial.publication_access(publication_id,public_until) values(new.active_publication_id,null)
   on conflict(publication_id) do update set public_until=null;
  end if;
 end if; return new;
end $$;
drop trigger if exists track_publication_access on portfolio_editorial.site_state;
create trigger track_publication_access before update of active_publication_id on portfolio_editorial.site_state
 for each row execute function portfolio_editorial.track_publication_access();

create function portfolio_editorial.read_publication(requested uuid default null)
returns jsonb language plpgsql stable security definer set search_path='' as $$
declare chosen uuid; result jsonb;
begin
 select active_publication_id into chosen from portfolio_editorial.site_state where id=1;
 chosen:=coalesce(requested,chosen);
 if chosen is null or not exists(select 1 from portfolio_editorial.publication_access a
   join portfolio_editorial.site_state s on s.id=1
   where a.publication_id=chosen and (s.active_publication_id=chosen or a.public_until>now())) then
  raise exception 'VERSION_EXPIRED' using errcode='P0002'; end if;
 select snapshot into result from portfolio_editorial.publications where id=chosen;
 if result is null then raise exception 'VERSION_EXPIRED' using errcode='P0002'; end if;
 return result;
end $$;
create function public.get_published_snapshot(publication_id uuid default null)
returns jsonb language sql stable security definer set search_path='' as $$
 select portfolio_editorial.read_publication(publication_id)
$$;
revoke all on portfolio_editorial.publication_access from public,anon,authenticated,service_role;
revoke all on function portfolio_editorial.read_publication(uuid),portfolio_editorial.track_publication_access() from public,anon,authenticated,service_role;
revoke all on function public.get_published_snapshot(uuid) from public;
grant execute on function public.get_published_snapshot(uuid) to anon,authenticated;
alter table portfolio_editorial.publication_access owner to portfolio_editorial_owner;
alter function portfolio_editorial.track_publication_access() owner to portfolio_editorial_owner;
grant create on schema portfolio_editorial to portfolio_editorial_executor;
alter function portfolio_editorial.read_publication(uuid) owner to portfolio_editorial_executor;
grant create on schema public to portfolio_editorial_executor;
alter function public.get_published_snapshot(uuid) owner to portfolio_editorial_executor;
revoke create on schema public from portfolio_editorial_executor;
revoke create on schema portfolio_editorial from portfolio_editorial_executor;


-- Migration: 20260926130000_discard_editorial_draft.sql
-- T-013 / ADR-008: idempotent discard back to the active publication.
alter table portfolio_editorial.operations drop constraint if exists operations_type_check;
alter table portfolio_editorial.operations add constraint operations_type_check
 check(type in('draft_command','publication','discard'));
grant insert,update,delete on portfolio_editorial.draft_locales to portfolio_editorial_executor;
drop policy if exists draft_locales_executor_write on portfolio_editorial.draft_locales;
create policy draft_locales_executor_write on portfolio_editorial.draft_locales
 for all to portfolio_editorial_executor using(true) with check(true);

create function portfolio_editorial.discard_draft(expected_revision bigint,operation_id uuid,actor uuid)
returns jsonb language plpgsql security definer set search_path='' as $$
declare current_revision bigint; existing portfolio_editorial.operations%rowtype; request_hash text;
 snapshot jsonb; receipt jsonb; locale record; entity record; translation record;
begin
 actor:=portfolio_editorial.require_editorial_admin(actor);
 request_hash:=encode(extensions.digest(jsonb_build_object('revision',expected_revision,'type','discard')::text,'sha256'),'hex');
 select * into existing from portfolio_editorial.operations o where o.operation_id=discard_draft.operation_id;
 if found then
  if existing.actor_id<>actor or existing.request_hash<>request_hash or existing.type<>'discard' then
   raise exception 'operation id already used with another request' using errcode='23505';end if;
  return existing.result||jsonb_build_object('repeated',true);
 end if;
 select revision into current_revision from portfolio_editorial.draft where id=1 for update;
 if current_revision<>expected_revision then raise exception 'revision conflict' using errcode='40001',detail=current_revision::text;end if;
 select p.snapshot into snapshot from portfolio_editorial.site_state s join portfolio_editorial.publications p on p.id=s.active_publication_id where s.id=1;
 if snapshot is null then raise exception 'active publication unavailable' using errcode='22023';end if;
 set constraints all deferred;
 delete from portfolio_editorial.draft_media_refs where draft_id=1;
 delete from portfolio_editorial.draft_translations where draft_id=1;
 delete from portfolio_editorial.draft_entities where draft_id=1;
 delete from portfolio_editorial.draft_locales where draft_id=1 and code<>'pt-BR';
 for locale in select value from jsonb_array_elements(snapshot->'locales') loop
  insert into portfolio_editorial.draft_locales(draft_id,code,label,direction,status,position)
   values(1,locale.value->>'code',locale.value->>'label',locale.value->>'direction','active',(locale.value->>'position')::integer)
   on conflict(draft_id,code) do update set label=excluded.label,direction=excluded.direction,status='active',position=excluded.position;
 end loop;
 for entity in select key,value from jsonb_each(snapshot->'entities') loop
  insert into portfolio_editorial.draft_entities(draft_id,id,kind,parent_id,position,data)
   values(1,entity.key,entity.value->>'kind',entity.value->>'parentId',(entity.value->>'position')::integer,entity.value->'data');
 end loop;
 for locale in select key,value from jsonb_each(snapshot->'translations') loop
  for translation in select key,value from jsonb_each(locale.value) loop
   insert into portfolio_editorial.draft_translations(draft_id,entity_id,locale_code,fields)
    values(1,translation.key,locale.key,translation.value);
  end loop;
 end loop;
 current_revision:=current_revision+1;
 update portfolio_editorial.draft d set revision=current_revision,base_publication_id=s.active_publication_id,updated_at=now()
  from portfolio_editorial.site_state s where d.id=1 and s.id=1;
 receipt:=jsonb_build_object('operationId',operation_id,'revision',current_revision,'repeated',false);
 insert into portfolio_editorial.operations(operation_id,actor_id,type,request_hash,revision,result)
  values(operation_id,actor,'discard',request_hash,current_revision,receipt);
 return receipt;
end $$;

create function public.discard_editor_draft(expected_revision bigint,operation_id uuid)
returns jsonb language sql security definer set search_path='' as $$
 select portfolio_editorial.discard_draft(expected_revision,operation_id,
  coalesce(nullif(current_setting('request.jwt.claim.sub',true),''),nullif(current_setting('request.jwt.claims',true),'')::jsonb->>'sub')::uuid)
$$;
revoke all on function portfolio_editorial.discard_draft(bigint,uuid,uuid) from public,anon,authenticated,service_role;
revoke all on function public.discard_editor_draft(bigint,uuid) from public,anon;
grant execute on function public.discard_editor_draft(bigint,uuid) to authenticated;
grant create on schema portfolio_editorial to portfolio_editorial_executor;
alter function portfolio_editorial.discard_draft(bigint,uuid,uuid) owner to portfolio_editorial_executor;
grant create on schema public to portfolio_editorial_executor;
alter function public.discard_editor_draft(bigint,uuid) owner to portfolio_editorial_executor;
revoke create on schema public from portfolio_editorial_executor;
revoke create on schema portfolio_editorial from portfolio_editorial_executor;


-- Migration: 20260926133000_create_editorial_history.sql
-- T-014 / ADR-008: retained history and restore-to-draft.
alter table portfolio_editorial.operations drop constraint if exists operations_type_check;
alter table portfolio_editorial.operations add constraint operations_type_check
 check(type in('draft_command','publication','discard','restore'));
grant update on portfolio_editorial.publications to portfolio_editorial_executor;
drop policy if exists publications_executor_retention_update on portfolio_editorial.publications;
create policy publications_executor_retention_update on portfolio_editorial.publications
 for update to portfolio_editorial_executor using(true) with check(true);

create function portfolio_editorial.enforce_publication_retention()
returns trigger language plpgsql security definer set search_path='' as $$ begin
 with keep as materialized(
  select candidate.id from portfolio_editorial.publications candidate
  cross join portfolio_editorial.site_state s
  order by(candidate.id=s.active_publication_id) desc,candidate.sequence desc limit 10
 )
 update portfolio_editorial.publications p set retained=(p.id in(select id from keep));
 return new;
end $$;
drop trigger if exists enforce_publication_retention on portfolio_editorial.site_state;
create trigger enforce_publication_retention after update of active_publication_id on portfolio_editorial.site_state
 for each statement execute function portfolio_editorial.enforce_publication_retention();

create function portfolio_editorial.list_history(actor uuid)
returns jsonb language plpgsql stable security definer set search_path='' as $$
begin
 actor:=portfolio_editorial.require_editorial_admin(actor);
 return coalesce((select jsonb_agg(jsonb_build_object('publicationId',p.id,'sequence',p.sequence,
  'createdAt',p.created_at,'sourceRevision',p.source_revision,'retained',p.retained,
  'active',s.active_publication_id=p.id) order by p.sequence desc)
  from portfolio_editorial.publications p cross join portfolio_editorial.site_state s
  where p.retained or s.active_publication_id=p.id),'[]'::jsonb);
end $$;

create function portfolio_editorial.restore_publication(source_id uuid,expected_revision bigint,operation_id uuid,actor uuid)
returns jsonb language plpgsql security definer set search_path='' as $$
declare current_revision bigint;existing portfolio_editorial.operations%rowtype;request_hash text;snapshot jsonb;receipt jsonb;
 locale record;entity record;translation record;
begin
 actor:=portfolio_editorial.require_editorial_admin(actor);
 request_hash:=encode(extensions.digest(jsonb_build_object('source',source_id,'revision',expected_revision)::text,'sha256'),'hex');
 select * into existing from portfolio_editorial.operations o where o.operation_id=restore_publication.operation_id;
 if found then if existing.actor_id<>actor or existing.request_hash<>request_hash or existing.type<>'restore' then raise exception 'operation id already used' using errcode='23505';end if;return existing.result||jsonb_build_object('repeated',true);end if;
 select revision into current_revision from portfolio_editorial.draft where id=1 for update;
 if current_revision<>expected_revision then raise exception 'revision conflict' using errcode='40001';end if;
 select p.snapshot into snapshot from portfolio_editorial.publications p where p.id=source_id and p.retained;
 if snapshot is null then raise exception 'retained publication unavailable' using errcode='22023';end if;
 set constraints all deferred;
 delete from portfolio_editorial.draft_media_refs where draft_id=1;delete from portfolio_editorial.draft_translations where draft_id=1;delete from portfolio_editorial.draft_entities where draft_id=1;delete from portfolio_editorial.draft_locales where draft_id=1 and code<>'pt-BR';
 for locale in select value from jsonb_array_elements(snapshot->'locales') loop insert into portfolio_editorial.draft_locales(draft_id,code,label,direction,status,position) values(1,locale.value->>'code',locale.value->>'label',locale.value->>'direction','active',(locale.value->>'position')::int) on conflict(draft_id,code) do update set label=excluded.label,direction=excluded.direction,status='active',position=excluded.position;end loop;
 for entity in select key,value from jsonb_each(snapshot->'entities') loop insert into portfolio_editorial.draft_entities(draft_id,id,kind,parent_id,position,data) values(1,entity.key,entity.value->>'kind',entity.value->>'parentId',(entity.value->>'position')::int,entity.value->'data');end loop;
 for locale in select key,value from jsonb_each(snapshot->'translations') loop for translation in select key,value from jsonb_each(locale.value) loop insert into portfolio_editorial.draft_translations(draft_id,entity_id,locale_code,fields) values(1,translation.key,locale.key,translation.value);end loop;end loop;
 current_revision:=current_revision+1;update portfolio_editorial.draft set revision=current_revision,base_publication_id=source_id,updated_at=now() where id=1;
 receipt:=jsonb_build_object('operationId',operation_id,'revision',current_revision,'sourcePublicationId',source_id,'repeated',false);
 insert into portfolio_editorial.operations(operation_id,actor_id,type,request_hash,revision,result) values(operation_id,actor,'restore',request_hash,current_revision,receipt);return receipt;
end $$;

create function public.get_editor_history() returns jsonb language sql stable security definer set search_path='' as $$ select portfolio_editorial.list_history(coalesce(nullif(current_setting('request.jwt.claim.sub',true),''),nullif(current_setting('request.jwt.claims',true),'')::jsonb->>'sub')::uuid) $$;
create function public.restore_editor_publication(publication_id uuid,expected_revision bigint,operation_id uuid) returns jsonb language sql security definer set search_path='' as $$ select portfolio_editorial.restore_publication(publication_id,expected_revision,operation_id,coalesce(nullif(current_setting('request.jwt.claim.sub',true),''),nullif(current_setting('request.jwt.claims',true),'')::jsonb->>'sub')::uuid) $$;
revoke all on function portfolio_editorial.enforce_publication_retention(),portfolio_editorial.list_history(uuid),portfolio_editorial.restore_publication(uuid,bigint,uuid,uuid) from public,anon,authenticated,service_role;
revoke all on function public.get_editor_history(),public.restore_editor_publication(uuid,bigint,uuid) from public,anon;
grant execute on function public.get_editor_history(),public.restore_editor_publication(uuid,bigint,uuid) to authenticated;
grant create on schema portfolio_editorial to portfolio_editorial_executor;
alter function portfolio_editorial.enforce_publication_retention() owner to portfolio_editorial_executor;
alter function portfolio_editorial.list_history(uuid) owner to portfolio_editorial_executor;alter function portfolio_editorial.restore_publication(uuid,bigint,uuid,uuid) owner to portfolio_editorial_executor;
grant create on schema public to portfolio_editorial_executor;alter function public.get_editor_history() owner to portfolio_editorial_executor;alter function public.restore_editor_publication(uuid,bigint,uuid) owner to portfolio_editorial_executor;revoke create on schema public from portfolio_editorial_executor;revoke create on schema portfolio_editorial from portfolio_editorial_executor;


-- Migration: 20260926140000_read_draft_and_manage_technologies.sql
-- Reconciliation for T-018: authenticated draft reader and stable technology associations.

grant select on portfolio_editorial.publications to portfolio_editorial_executor;
drop policy if exists publications_executor_select_for_draft on portfolio_editorial.publications;
create policy publications_executor_select_for_draft on portfolio_editorial.publications
  for select to portfolio_editorial_executor using (true);

create function portfolio_editorial.read_draft(actor uuid)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare result jsonb; base jsonb;
begin
  actor := portfolio_editorial.require_editorial_admin(actor);
  select p.snapshot into base from portfolio_editorial.draft d
    left join portfolio_editorial.publications p on p.id=d.base_publication_id where d.id=1;
  select jsonb_build_object(
    'formatVersion',1,'revision',d.revision,'basePublicationId',d.base_publication_id,
    'defaultLocale',d.default_locale,
    'locales',(select coalesce(jsonb_agg(jsonb_build_object('code',code,'label',label,'direction',direction,'status',status,'position',position) order by position),'[]'::jsonb) from portfolio_editorial.draft_locales where draft_id=1),
    'sections',coalesce(base->'sections','[]'::jsonb),
    'entities',(select coalesce(jsonb_object_agg(id,jsonb_build_object('kind',kind,'position',position,'data',data)||case when parent_id is null then '{}'::jsonb else jsonb_build_object('parentId',parent_id) end),'{}'::jsonb) from portfolio_editorial.draft_entities where draft_id=1),
    'translations',(select coalesce(jsonb_object_agg(locale_code,items),'{}'::jsonb) from (select locale_code,jsonb_object_agg(entity_id,fields) items from portfolio_editorial.draft_translations where draft_id=1 group by locale_code) x),
    'technologies',(select coalesce(jsonb_object_agg(id,jsonb_build_object('label',label,'aliases',to_jsonb(aliases))||case when bundled_asset is null then '{}'::jsonb else jsonb_build_object('iconMediaId','asset-'||id) end),'{}'::jsonb) from portfolio_editorial.technologies),
    'media',coalesce(base->'media','{}'::jsonb)
  ) into result from portfolio_editorial.draft d where d.id=1;
  return result;
end $$;

create function public.get_editor_draft()
returns jsonb language sql security definer set search_path = '' as $$
  select portfolio_editorial.read_draft(coalesce(nullif(current_setting('request.jwt.claim.sub',true),''),nullif(current_setting('request.jwt.claims',true),'')::jsonb->>'sub')::uuid)
$$;

create function portfolio_editorial.set_draft_technologies(expected_revision bigint,operation_id uuid,entity_id text,technology_ids text[],actor uuid)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare current_revision bigint; existing portfolio_editorial.operations%rowtype; request_hash text; receipt jsonb;
begin
  actor:=portfolio_editorial.require_editorial_admin(actor);
  request_hash:=encode(extensions.digest(jsonb_build_object('type','set_technologies','entityId',entity_id,'technologyIds',technology_ids)::text,'sha256'),'hex');
  select * into existing from portfolio_editorial.operations where operations.operation_id=set_draft_technologies.operation_id;
  if found then
    if existing.actor_id<>actor or existing.request_hash<>request_hash then raise exception 'operation id already used with another request' using errcode='23505'; end if;
    return existing.result||jsonb_build_object('repeated',true);
  end if;
  select revision into current_revision from portfolio_editorial.draft where id=1 for update;
  if current_revision<>expected_revision then raise exception 'revision conflict' using errcode='40001',detail=current_revision::text; end if;
  if technology_ids is null or cardinality(technology_ids)<>cardinality(array(select distinct x from unnest(technology_ids) x))
    or not exists(select 1 from portfolio_editorial.draft_entities where draft_id=1 and id=entity_id and kind='project')
    or exists(select 1 from unnest(technology_ids) x where not exists(select 1 from portfolio_editorial.technologies t where t.id=x)) then
    raise exception 'invalid technology association' using errcode='22023';
  end if;
  update portfolio_editorial.draft_entities set data=jsonb_set(data,'{technologyIds}',to_jsonb(technology_ids),true) where draft_id=1 and id=entity_id;
  current_revision:=current_revision+1;
  update portfolio_editorial.draft set revision=current_revision,updated_at=now() where id=1;
  receipt:=jsonb_build_object('operationId',operation_id,'revision',current_revision,'repeated',false);
  insert into portfolio_editorial.operations(operation_id,actor_id,type,request_hash,revision,result) values(operation_id,actor,'draft_command',request_hash,current_revision,receipt);
  return receipt;
end $$;

create function public.set_editor_technologies(expected_revision bigint,operation_id uuid,entity_id text,technology_ids text[])
returns jsonb language sql security definer set search_path = '' as $$
  select portfolio_editorial.set_draft_technologies(expected_revision,operation_id,entity_id,technology_ids,
    coalesce(nullif(current_setting('request.jwt.claim.sub',true),''),nullif(current_setting('request.jwt.claims',true),'')::jsonb->>'sub')::uuid)
$$;

revoke all on function portfolio_editorial.read_draft(uuid),portfolio_editorial.set_draft_technologies(bigint,uuid,text,text[],uuid) from public,anon,authenticated,service_role;
revoke all on function public.get_editor_draft(),public.set_editor_technologies(bigint,uuid,text,text[]) from public,anon;
grant execute on function public.get_editor_draft(),public.set_editor_technologies(bigint,uuid,text,text[]) to authenticated;
grant create on schema portfolio_editorial to portfolio_editorial_executor;
alter function portfolio_editorial.read_draft(uuid) owner to portfolio_editorial_executor;
alter function portfolio_editorial.set_draft_technologies(bigint,uuid,text,text[],uuid) owner to portfolio_editorial_executor;
revoke create on schema portfolio_editorial from portfolio_editorial_executor;
grant create on schema public to portfolio_editorial_executor;
alter function public.get_editor_draft() owner to portfolio_editorial_executor;
alter function public.set_editor_technologies(bigint,uuid,text,text[]) owner to portfolio_editorial_executor;
revoke create on schema public from portfolio_editorial_executor;


-- Migration: 20260926143000_create_draft_section_order.sql
-- T-020: private, revisioned section order with presentation fixed first.
create table if not exists portfolio_editorial.draft_sections(
  draft_id smallint not null default 1 references portfolio_editorial.draft(id) on delete cascade,
  id text not null check(id ~ '^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$'),
  kind text not null check(kind in('presentation','about','results','experiences','skills','education','projects','contact')),
  position integer not null check(position>=0),
  primary key(draft_id,id), unique(draft_id,position), unique(draft_id,kind)
);
alter table portfolio_editorial.draft_sections enable row level security;
alter table portfolio_editorial.draft_sections force row level security;
grant select,insert,update,delete on portfolio_editorial.draft_sections to portfolio_editorial_executor;
drop policy if exists draft_sections_executor_all on portfolio_editorial.draft_sections;
create policy draft_sections_executor_all on portfolio_editorial.draft_sections for all to portfolio_editorial_executor using(true) with check(true);
insert into portfolio_editorial.draft_sections(draft_id,id,kind,position)
select 1,s.value->>'id',s.value->>'kind',(s.value->>'position')::integer
from portfolio_editorial.draft d join portfolio_editorial.publications p on p.id=d.base_publication_id
cross join lateral jsonb_array_elements(p.snapshot->'sections') s;

create function portfolio_editorial.set_section_order(expected_revision bigint,operation_id uuid,section_ids text[],actor uuid)
returns jsonb language plpgsql security definer set search_path='' as $$
declare current_revision bigint;existing portfolio_editorial.operations%rowtype;request_hash text;receipt jsonb;i integer;
begin
 actor:=portfolio_editorial.require_editorial_admin(actor);request_hash:=encode(extensions.digest(to_jsonb(section_ids)::text,'sha256'),'hex');
 select * into existing from portfolio_editorial.operations where operations.operation_id=set_section_order.operation_id;
 if found then if existing.actor_id<>actor or existing.request_hash<>request_hash then raise exception 'operation id already used' using errcode='23505';end if;return existing.result||jsonb_build_object('repeated',true);end if;
 select revision into current_revision from portfolio_editorial.draft where id=1 for update;
 if current_revision<>expected_revision then raise exception 'revision conflict' using errcode='40001';end if;
 if section_ids[1]<>'presentation-section' or cardinality(section_ids)<>(select count(*) from portfolio_editorial.draft_sections where draft_id=1)
  or cardinality(section_ids)<>cardinality(array(select distinct x from unnest(section_ids)x))
  or exists(select 1 from unnest(section_ids)x where not exists(select 1 from portfolio_editorial.draft_sections s where s.draft_id=1 and s.id=x)) then raise exception 'invalid section order' using errcode='22023';end if;
 update portfolio_editorial.draft_sections set position=position+1000 where draft_id=1;
 for i in 1..cardinality(section_ids) loop update portfolio_editorial.draft_sections set position=i-1 where draft_id=1 and id=section_ids[i];end loop;
 current_revision:=current_revision+1;update portfolio_editorial.draft set revision=current_revision,updated_at=now() where id=1;
 receipt:=jsonb_build_object('operationId',operation_id,'revision',current_revision,'repeated',false);
 insert into portfolio_editorial.operations(operation_id,actor_id,type,request_hash,revision,result)values(operation_id,actor,'draft_command',request_hash,current_revision,receipt);return receipt;
end $$;
create function public.set_editor_section_order(expected_revision bigint,operation_id uuid,section_ids text[])
returns jsonb language sql security definer set search_path='' as $$select portfolio_editorial.set_section_order(expected_revision,operation_id,section_ids,coalesce(nullif(current_setting('request.jwt.claim.sub',true),''),nullif(current_setting('request.jwt.claims',true),'')::jsonb->>'sub')::uuid)$$;

create or replace function portfolio_editorial.build_publication_content()
returns jsonb language plpgsql stable security definer set search_path='' as $$
declare base_snapshot jsonb;result jsonb;begin
 select p.snapshot into base_snapshot from portfolio_editorial.draft d left join portfolio_editorial.publications p on p.id=d.base_publication_id where d.id=1;
 select jsonb_build_object('formatVersion',1,'defaultLocale','pt-BR',
 'locales',coalesce((select jsonb_agg(jsonb_build_object('code',code,'label',label,'direction',direction,'position',position)order by position)from portfolio_editorial.draft_locales where draft_id=1 and status='active'),'[]'::jsonb),
 'sections',coalesce((select jsonb_agg(jsonb_build_object('id',id,'kind',kind,'position',position)order by position)from portfolio_editorial.draft_sections where draft_id=1),'[]'::jsonb),
 'entities',coalesce((select jsonb_object_agg(id,jsonb_strip_nulls(jsonb_build_object('kind',kind,'parentId',parent_id,'position',position,'data',data))order by id)from portfolio_editorial.draft_entities where draft_id=1),'{}'::jsonb),
 'translations',coalesce((select jsonb_object_agg(locale_code,items order by locale_code)from(select t.locale_code,jsonb_object_agg(t.entity_id,t.fields order by t.entity_id)items from portfolio_editorial.draft_translations t join portfolio_editorial.draft_locales l on l.draft_id=t.draft_id and l.code=t.locale_code and l.status='active' where t.draft_id=1 group by t.locale_code)x),'{}'::jsonb),
 'technologies',coalesce(base_snapshot->'technologies','{}'::jsonb),
 'media',coalesce(base_snapshot->'media','{}'::jsonb)||coalesce((select jsonb_object_agg(m.id::text,jsonb_build_object('source','managed','mime',m.mime,'bytes',m.bytes)order by m.id)from portfolio_editorial.media m join portfolio_editorial.draft_media_refs r on r.media_id=m.id where r.draft_id=1 and m.status='ready'),'{}'::jsonb))into result;return result;end$$;

create or replace function portfolio_editorial.read_draft(actor uuid)
returns jsonb language plpgsql security definer set search_path='' as $$
declare result jsonb;base jsonb;begin actor:=portfolio_editorial.require_editorial_admin(actor);select p.snapshot into base from portfolio_editorial.draft d left join portfolio_editorial.publications p on p.id=d.base_publication_id where d.id=1;
 select jsonb_build_object('formatVersion',1,'revision',d.revision,'basePublicationId',d.base_publication_id,'defaultLocale',d.default_locale,
 'locales',(select coalesce(jsonb_agg(jsonb_build_object('code',code,'label',label,'direction',direction,'status',status,'position',position)order by position),'[]'::jsonb)from portfolio_editorial.draft_locales where draft_id=1),
 'sections',(select coalesce(jsonb_agg(jsonb_build_object('id',id,'kind',kind,'position',position)order by position),'[]'::jsonb)from portfolio_editorial.draft_sections where draft_id=1),
 'entities',(select coalesce(jsonb_object_agg(id,jsonb_build_object('kind',kind,'position',position,'data',data)||case when parent_id is null then'{}'::jsonb else jsonb_build_object('parentId',parent_id)end),'{}'::jsonb)from portfolio_editorial.draft_entities where draft_id=1),
 'translations',(select coalesce(jsonb_object_agg(locale_code,items),'{}'::jsonb)from(select locale_code,jsonb_object_agg(entity_id,fields)items from portfolio_editorial.draft_translations where draft_id=1 group by locale_code)x),
 'technologies',base->'technologies','media',coalesce(base->'media','{}'::jsonb))into result from portfolio_editorial.draft d where d.id=1;return result;end$$;

create function portfolio_editorial.sync_draft_sections_from_base()returns trigger language plpgsql security definer set search_path='' as $$begin
 if new.base_publication_id is distinct from old.base_publication_id or tg_op='UPDATE' then delete from portfolio_editorial.draft_sections where draft_id=new.id;insert into portfolio_editorial.draft_sections(draft_id,id,kind,position)select new.id,s.value->>'id',s.value->>'kind',(s.value->>'position')::integer from portfolio_editorial.publications p cross join lateral jsonb_array_elements(p.snapshot->'sections')s where p.id=new.base_publication_id;end if;return new;end$$;
drop trigger if exists sync_draft_sections on portfolio_editorial.draft;
create trigger sync_draft_sections after update of base_publication_id on portfolio_editorial.draft for each row execute function portfolio_editorial.sync_draft_sections_from_base();

revoke all on portfolio_editorial.draft_sections from public,anon,authenticated,service_role;
revoke all on function portfolio_editorial.set_section_order(bigint,uuid,text[],uuid),portfolio_editorial.sync_draft_sections_from_base() from public,anon,authenticated,service_role;
revoke all on function public.set_editor_section_order(bigint,uuid,text[]) from public,anon;
grant execute on function public.set_editor_section_order(bigint,uuid,text[]) to authenticated;
alter table portfolio_editorial.draft_sections owner to portfolio_editorial_owner;
grant create on schema portfolio_editorial to portfolio_editorial_executor;alter function portfolio_editorial.set_section_order(bigint,uuid,text[],uuid)owner to portfolio_editorial_executor;alter function portfolio_editorial.sync_draft_sections_from_base()owner to portfolio_editorial_executor;revoke create on schema portfolio_editorial from portfolio_editorial_executor;
grant create on schema public to portfolio_editorial_executor;alter function public.set_editor_section_order(bigint,uuid,text[])owner to portfolio_editorial_executor;revoke create on schema public from portfolio_editorial_executor;


-- Migration: 20260926200000_fix_editorial_curriculum_limit.sql
-- T-023 / ADR-008: make the local and migrated editorial curriculum limit explicit.
update storage.buckets
set file_size_limit = 52428800,
    allowed_mime_types = array['application/pdf']
where id = 'editorial-curricula';

-- Rollback: restore inheritance from the configured global Storage limit.
-- update storage.buckets set file_size_limit = null where id = 'editorial-curricula';


-- Migration: 20260927001500_fix_legacy_curriculum_limit.sql
-- T-023: make the legacy curriculum bucket deterministic during migration.
update storage.buckets
set file_size_limit = 52428800,
    allowed_mime_types = array['application/pdf']
where id = 'curricula';

-- Rollback: restore the prior account-level inheritance.
-- update storage.buckets set file_size_limit = null where id = 'curricula';


-- Migration: 20260927003000_add_editorial_locale_lifecycle.sql
-- T-025: locale lifecycle through the same revisioned command boundary.
create function public.set_editor_locale(
  expected_revision bigint, operation_id uuid, code text, label text, status text, locale_position integer
) returns jsonb language plpgsql security definer set search_path = '' as $$
declare actor uuid; current_revision bigint; existing portfolio_editorial.operations%rowtype; request_hash text; receipt jsonb;
begin
  actor := portfolio_editorial.require_editorial_admin(coalesce(nullif(current_setting('request.jwt.claim.sub',true),''), nullif(current_setting('request.jwt.claims',true),'')::jsonb->>'sub')::uuid);
  if code is null or code !~ '^[a-z]{2,3}(?:-[A-Z]{2})?$' or code = 'pt-BR' or label is null or length(trim(label)) = 0 or status not in ('preparation','active') or locale_position < 0 then raise exception 'invalid locale' using errcode='22023'; end if;
  request_hash := encode(extensions.digest(jsonb_build_object('code',code,'label',label,'status',status,'position',locale_position)::text,'sha256'),'hex');
  select * into existing from portfolio_editorial.operations where operations.operation_id=set_editor_locale.operation_id;
  if found then
    if existing.actor_id <> actor or existing.request_hash <> request_hash then raise exception 'operation id already used with another request' using errcode='23505'; end if;
    return existing.result || jsonb_build_object('repeated',true);
  end if;
  select revision into current_revision from portfolio_editorial.draft where id=1 for update;
  if current_revision <> expected_revision then raise exception 'revision conflict' using errcode='40001', detail=current_revision::text; end if;
  insert into portfolio_editorial.draft_locales(draft_id,code,label,direction,status,position) values(1,code,label,'ltr',status,locale_position)
    on conflict (draft_id,code) do update set label=excluded.label,status=excluded.status,position=excluded.position;
  update portfolio_editorial.draft set revision=revision+1,updated_at=now() where id=1 returning revision into current_revision;
  receipt=jsonb_build_object('operationId',operation_id,'revision',current_revision,'repeated',false);
  insert into portfolio_editorial.operations(operation_id,actor_id,type,request_hash,revision,result) values(operation_id,actor,'draft_command',request_hash,current_revision,receipt);
  return receipt;
end $$;
revoke all on function public.set_editor_locale(bigint,uuid,text,text,text,integer) from public,anon;
grant execute on function public.set_editor_locale(bigint,uuid,text,text,text,integer) to authenticated;


-- Migration: 20260927004000_add_editorial_media_association.sql
-- T-023: associate a ready private asset with a draft entity atomically.
create function public.associate_editorial_media(
  expected_revision bigint, operation_id uuid, entity_id text, media_id uuid, field_name text, media_position integer default 0
) returns jsonb language plpgsql security definer set search_path = '' as $$
declare actor uuid; current_revision bigint; existing portfolio_editorial.operations%rowtype; request_hash text; receipt jsonb;
begin
  actor := portfolio_editorial.require_editorial_admin(coalesce(nullif(current_setting('request.jwt.claim.sub',true),''), nullif(current_setting('request.jwt.claims',true),'')::jsonb->>'sub')::uuid);
  if entity_id is null or field_name not in ('projectImage','skillIcon','curriculum') or media_position < 0 then raise exception 'invalid media association' using errcode='22023'; end if;
  request_hash := encode(extensions.digest(jsonb_build_object('entityId',entity_id,'mediaId',media_id,'field',field_name,'position',media_position)::text,'sha256'),'hex');
  select * into existing from portfolio_editorial.operations where operations.operation_id=associate_editorial_media.operation_id;
  if found then
    if existing.actor_id <> actor or existing.request_hash <> request_hash then raise exception 'operation id already used with another request' using errcode='23505'; end if;
    return existing.result || jsonb_build_object('repeated',true);
  end if;
  select revision into current_revision from portfolio_editorial.draft where id=1 for update;
  if current_revision <> expected_revision then raise exception 'revision conflict' using errcode='40001', detail=current_revision::text; end if;
  if not exists(select 1 from portfolio_editorial.draft_entities where draft_id=1 and id=entity_id) or not exists(select 1 from portfolio_editorial.media where id=media_id and draft_id=1 and status='ready') then raise exception 'entity or ready media not found' using errcode='22023'; end if;
  insert into portfolio_editorial.draft_media_refs(draft_id,media_id,entity_id,field,position) values(1,media_id,entity_id,field_name,media_position)
    on conflict (draft_id,entity_id,field,position) do update set media_id=excluded.media_id;
  update portfolio_editorial.draft set revision=revision+1,updated_at=now() where id=1 returning revision into current_revision;
  receipt=jsonb_build_object('operationId',operation_id,'revision',current_revision,'repeated',false);
  insert into portfolio_editorial.operations(operation_id,actor_id,type,request_hash,revision,result) values(operation_id,actor,'draft_command',request_hash,current_revision,receipt);
  return receipt;
end $$;
revoke all on function public.associate_editorial_media(bigint,uuid,text,uuid,text,integer) from public,anon;
grant execute on function public.associate_editorial_media(bigint,uuid,text,uuid,text,integer) to authenticated;


-- Migration: 20260927120000_shared_skill_catalog.sql
-- ADR-011: shared technology catalog with an optional managed icon.
alter table portfolio_editorial.technologies
  add column if not exists icon_media_id uuid references portfolio_editorial.media(id) on delete set null;

update storage.buckets set allowed_mime_types = array['image/png','image/jpeg','image/svg+xml']
where id = 'editorial-skill-icons';

create or replace function portfolio_editorial.reserve_media(
  expected_revision bigint, purpose text, original_name text, mime text, bytes bigint, actor uuid
) returns table(media_id uuid, bucket text, path text)
language plpgsql security definer set search_path = '' as $$
declare current_revision bigint; new_id uuid := gen_random_uuid(); chosen_bucket text; file_extension text;
begin
  actor := portfolio_editorial.require_editorial_admin(actor);
  select revision into current_revision from portfolio_editorial.draft where id=1;
  if current_revision <> expected_revision then raise exception 'revision conflict' using errcode='40001'; end if;
  if purpose='project_image' and mime in ('image/png','image/jpeg') and bytes between 1 and 1048576 then chosen_bucket='editorial-project-images';
  elsif purpose='skill_icon' and mime in ('image/png','image/jpeg','image/svg+xml') and bytes between 1 and 1048576 then chosen_bucket='editorial-skill-icons';
  elsif purpose='curriculum' and mime='application/pdf' and bytes>0 then chosen_bucket='editorial-curricula';
  else raise exception 'invalid media type or size' using errcode='22023'; end if;
  file_extension := case mime when 'image/png' then '.png' when 'image/jpeg' then '.jpg' when 'image/svg+xml' then '.svg' else '.pdf' end;
  media_id=new_id; bucket=chosen_bucket; path=actor::text||'/'||new_id::text||file_extension;
  insert into portfolio_editorial.media(id,revision,actor_id,purpose,bucket,path,original_name,mime,bytes) values(media_id,expected_revision,actor,purpose,bucket,path,original_name,mime,bytes);
  return next;
end $$;

create or replace function public.create_editorial_technology(
  expected_revision bigint, operation_id uuid, technology_id text, technology_label text, icon_media_id uuid default null
) returns jsonb language plpgsql security definer set search_path = '' as $$
declare actor uuid; current_revision bigint; existing portfolio_editorial.operations%rowtype; request_hash text; receipt jsonb;
begin
  actor := portfolio_editorial.require_editorial_admin(coalesce(nullif(current_setting('request.jwt.claim.sub',true),''),nullif(current_setting('request.jwt.claims',true),'')::jsonb->>'sub')::uuid);
  if technology_id is null or technology_id !~ '^[a-z0-9][a-z0-9._:-]{0,127}$' or technology_label is null or length(trim(technology_label))=0 then raise exception 'invalid technology' using errcode='22023'; end if;
  if icon_media_id is not null and not exists(select 1 from portfolio_editorial.media where id=icon_media_id and actor_id=actor and status='ready' and purpose='skill_icon') then raise exception 'invalid skill icon' using errcode='22023'; end if;
  request_hash := encode(extensions.digest(jsonb_build_object('id',technology_id,'label',technology_label,'icon',icon_media_id)::text,'sha256'),'hex');
  select * into existing from portfolio_editorial.operations where operations.operation_id=create_editorial_technology.operation_id;
  if found then if existing.actor_id<>actor or existing.request_hash<>request_hash then raise exception 'operation id already used with another request' using errcode='23505'; end if; return existing.result||jsonb_build_object('repeated',true); end if;
  select revision into current_revision from portfolio_editorial.draft where id=1 for update;
  if current_revision<>expected_revision then raise exception 'revision conflict' using errcode='40001',detail=current_revision::text; end if;
  insert into portfolio_editorial.technologies(id,label,icon_media_id) values(technology_id,technology_label,icon_media_id);
  update portfolio_editorial.draft set revision=revision+1,updated_at=now() where id=1 returning revision into current_revision;
  receipt=jsonb_build_object('operationId',operation_id,'revision',current_revision,'repeated',false);
  insert into portfolio_editorial.operations(operation_id,actor_id,type,request_hash,revision,result) values(operation_id,actor,'draft_command',request_hash,current_revision,receipt);
  return receipt;
end $$;
revoke all on function public.create_editorial_technology(bigint,uuid,text,text,uuid) from public,anon;
grant execute on function public.create_editorial_technology(bigint,uuid,text,text,uuid) to authenticated;

create or replace function portfolio_editorial.read_draft(actor uuid)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare result jsonb; base jsonb;
begin
  actor := portfolio_editorial.require_editorial_admin(actor);
  select p.snapshot into base from portfolio_editorial.draft d left join portfolio_editorial.publications p on p.id=d.base_publication_id where d.id=1;
  select jsonb_build_object(
    'formatVersion',1,'revision',d.revision,'basePublicationId',d.base_publication_id,'defaultLocale',d.default_locale,
    'locales',(select coalesce(jsonb_agg(jsonb_build_object('code',code,'label',label,'direction',direction,'status',status,'position',position) order by position),'[]'::jsonb) from portfolio_editorial.draft_locales where draft_id=1),
    'sections',coalesce(base->'sections','[]'::jsonb),
    'entities',(select coalesce(jsonb_object_agg(id,jsonb_build_object('kind',kind,'position',position,'data',data)||case when parent_id is null then '{}'::jsonb else jsonb_build_object('parentId',parent_id) end),'{}'::jsonb) from portfolio_editorial.draft_entities where draft_id=1),
    'translations',(select coalesce(jsonb_object_agg(locale_code,items),'{}'::jsonb) from (select locale_code,jsonb_object_agg(entity_id,fields) items from portfolio_editorial.draft_translations where draft_id=1 group by locale_code)x),
    'technologies',(select coalesce(jsonb_object_agg(id,jsonb_build_object('label',label,'aliases',to_jsonb(aliases))||case when icon_media_id is not null then jsonb_build_object('iconMediaId',icon_media_id::text) when bundled_asset is not null then jsonb_build_object('iconMediaId','asset-'||id) else '{}'::jsonb end),'{}'::jsonb) from portfolio_editorial.technologies),
    'media',coalesce(base->'media','{}'::jsonb)
  ) into result from portfolio_editorial.draft d where d.id=1;
  return result;
end $$;


-- Migration: 20260927133000_centralize_skill_catalog_management.sql
-- ADR-012: centralize creation and editing of the shared editorial skill catalog.

alter table portfolio_editorial.media drop constraint if exists media_check;
alter table portfolio_editorial.media
  add constraint media_mime_bytes_check check (
    (purpose = 'project_image' and bucket = 'editorial-project-images' and mime in ('image/png', 'image/jpeg') and bytes <= 1048576)
    or (purpose = 'skill_icon' and bucket = 'editorial-skill-icons' and mime in ('image/png', 'image/jpeg', 'image/svg+xml') and bytes <= 1048576)
    or (purpose = 'curriculum' and bucket = 'editorial-curricula' and mime = 'application/pdf')
  );

create or replace function public.get_editorial_technology_catalog()
returns jsonb
language plpgsql security definer set search_path = '' as $$
declare actor uuid; result jsonb;
begin
  actor := portfolio_editorial.require_editorial_admin(
    coalesce(nullif(current_setting('request.jwt.claim.sub', true), ''),
      nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub')::uuid);
  select coalesce(jsonb_agg(jsonb_build_object(
    'id', t.id,
    'label', t.label,
    'bundledAsset', t.bundled_asset,
    'iconMediaId', t.icon_media_id,
    'iconBucket', m.bucket,
    'iconPath', m.path,
    'iconMime', m.mime
  ) order by lower(t.label), t.id), '[]'::jsonb)
  into result
  from portfolio_editorial.technologies t
  left join portfolio_editorial.media m
    on m.id = t.icon_media_id and m.status = 'ready';
  return result;
end $$;

create or replace function public.update_editorial_technology(
  expected_revision bigint,
  operation_id uuid,
  technology_id text,
  technology_label text,
  icon_media_id uuid default null
)
returns jsonb
language plpgsql security definer set search_path = '' as $$
declare actor uuid; current_revision bigint; existing portfolio_editorial.operations%rowtype;
  request_hash text; receipt jsonb;
begin
  actor := portfolio_editorial.require_editorial_admin(
    coalesce(nullif(current_setting('request.jwt.claim.sub', true), ''),
      nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub')::uuid);
  if technology_id is null or technology_id !~ '^[a-z0-9][a-z0-9._:-]{0,127}$'
    or technology_label is null or length(trim(technology_label)) = 0 then
    raise exception 'invalid technology' using errcode = '22023';
  end if;
  if icon_media_id is not null and not exists (
    select 1 from portfolio_editorial.media
    where id = icon_media_id and actor_id = actor and status = 'ready' and purpose = 'skill_icon'
  ) then raise exception 'invalid skill icon' using errcode = '22023'; end if;
  request_hash := encode(extensions.digest(jsonb_build_object(
    'id', technology_id, 'label', trim(technology_label), 'icon', icon_media_id
  )::text, 'sha256'), 'hex');
  select * into existing from portfolio_editorial.operations
    where operations.operation_id = update_editorial_technology.operation_id;
  if found then
    if existing.actor_id <> actor or existing.request_hash <> request_hash then
      raise exception 'operation id already used with another request' using errcode = '23505';
    end if;
    return existing.result || jsonb_build_object('repeated', true);
  end if;
  select revision into current_revision from portfolio_editorial.draft where id = 1 for update;
  if current_revision <> expected_revision then
    raise exception 'revision conflict' using errcode = '40001', detail = current_revision::text;
  end if;
  update portfolio_editorial.technologies
    set label = trim(technology_label), icon_media_id = update_editorial_technology.icon_media_id,
        updated_at = now()
    where id = update_editorial_technology.technology_id;
  if not found then raise exception 'technology not found' using errcode = '22023'; end if;
  update portfolio_editorial.draft set revision = revision + 1, updated_at = now()
    where id = 1 returning revision into current_revision;
  receipt := jsonb_build_object('operationId', operation_id, 'revision', current_revision, 'repeated', false);
  insert into portfolio_editorial.operations(operation_id, actor_id, type, request_hash, revision, result)
    values(operation_id, actor, 'draft_command', request_hash, current_revision, receipt);
  return receipt;
end $$;

revoke all on function public.get_editorial_technology_catalog() from public, anon;
grant execute on function public.get_editorial_technology_catalog() to authenticated;
revoke all on function public.update_editorial_technology(bigint, uuid, text, text, uuid) from public, anon;
grant execute on function public.update_editorial_technology(bigint, uuid, text, text, uuid) to authenticated;


-- Migration: 20260927134500_publish_shared_skill_catalog.sql
-- ADR-012: the shared catalog is the source for editorial reads and publication.

create or replace function portfolio_editorial.read_draft(actor uuid)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare result jsonb; base jsonb;
begin
  actor := portfolio_editorial.require_editorial_admin(actor);
  select p.snapshot into base from portfolio_editorial.draft d
    left join portfolio_editorial.publications p on p.id = d.base_publication_id where d.id = 1;
  select jsonb_build_object(
    'formatVersion', 1, 'revision', d.revision, 'basePublicationId', d.base_publication_id,
    'defaultLocale', d.default_locale,
    'locales', (select coalesce(jsonb_agg(jsonb_build_object('code', code, 'label', label,
      'direction', direction, 'status', status, 'position', position) order by position), '[]'::jsonb)
      from portfolio_editorial.draft_locales where draft_id = 1),
    'sections', coalesce(base->'sections', '[]'::jsonb),
    'entities', (select coalesce(jsonb_object_agg(id, jsonb_build_object('kind', kind,
      'position', position, 'data', data) || case when parent_id is null then '{}'::jsonb
      else jsonb_build_object('parentId', parent_id) end), '{}'::jsonb)
      from portfolio_editorial.draft_entities where draft_id = 1),
    'translations', (select coalesce(jsonb_object_agg(locale_code, items), '{}'::jsonb)
      from (select locale_code, jsonb_object_agg(entity_id, fields) items
        from portfolio_editorial.draft_translations where draft_id = 1 group by locale_code) x),
    'technologies', (select coalesce(jsonb_object_agg(t.id,
      jsonb_build_object('label', t.label, 'aliases', to_jsonb(t.aliases)) ||
      case when t.icon_media_id is not null then jsonb_build_object('iconMediaId', t.icon_media_id::text)
        when t.bundled_asset is not null then jsonb_build_object('iconMediaId', 'asset-' || t.id)
        else '{}'::jsonb end), '{}'::jsonb) from portfolio_editorial.technologies t),
    'media', coalesce(base->'media', '{}'::jsonb) || coalesce((select jsonb_object_agg(m.id::text,
      jsonb_build_object('source', 'managed', 'mime', m.mime, 'bytes', m.bytes)
      order by m.id) from portfolio_editorial.media m
      join portfolio_editorial.technologies t on t.icon_media_id = m.id
      where m.status = 'ready'), '{}'::jsonb)
      || coalesce((select jsonb_object_agg(m.id::text, jsonb_build_object('source', 'managed',
        'mime', m.mime, 'bytes', m.bytes) order by m.id) from portfolio_editorial.media m
        join portfolio_editorial.draft_media_refs r on r.media_id = m.id
        where r.draft_id = 1 and m.status = 'ready'), '{}'::jsonb)
  ) into result from portfolio_editorial.draft d where d.id = 1;
  return result;
end $$;

create or replace function portfolio_editorial.build_publication_content()
returns jsonb language plpgsql stable security definer set search_path = '' as $$
declare base_snapshot jsonb; result jsonb;
begin
  select p.snapshot into base_snapshot from portfolio_editorial.draft d
    left join portfolio_editorial.publications p on p.id = d.base_publication_id where d.id = 1;
  select jsonb_build_object(
    'formatVersion', 1,
    'defaultLocale', 'pt-BR',
    'locales', coalesce((select jsonb_agg(jsonb_build_object('code', code, 'label', label,
      'direction', direction, 'position', position) order by position)
      from portfolio_editorial.draft_locales where draft_id = 1 and status = 'active'), '[]'::jsonb),
    'sections', coalesce(base_snapshot->'sections', '[]'::jsonb),
    'entities', coalesce((select jsonb_object_agg(id, jsonb_strip_nulls(jsonb_build_object(
      'kind', kind, 'parentId', parent_id, 'position', position, 'data', data)) order by id)
      from portfolio_editorial.draft_entities where draft_id = 1), '{}'::jsonb),
    'translations', coalesce((select jsonb_object_agg(locale_code, items order by locale_code)
      from (select t.locale_code, jsonb_object_agg(t.entity_id, t.fields order by t.entity_id) items
        from portfolio_editorial.draft_translations t join portfolio_editorial.draft_locales l
          on l.draft_id = t.draft_id and l.code = t.locale_code and l.status = 'active'
        where t.draft_id = 1 group by t.locale_code) x), '{}'::jsonb),
    'technologies', coalesce((select jsonb_object_agg(t.id,
      jsonb_build_object('label', t.label, 'aliases', to_jsonb(t.aliases)) ||
      case when t.icon_media_id is not null then jsonb_build_object('iconMediaId', t.icon_media_id::text)
        when t.bundled_asset is not null then jsonb_build_object('iconMediaId', 'asset-' || t.id)
        else '{}'::jsonb end) from portfolio_editorial.technologies t), '{}'::jsonb),
    'media', coalesce(base_snapshot->'media', '{}'::jsonb) || coalesce((select jsonb_object_agg(m.id::text,
      jsonb_build_object('source', 'managed', 'mime', m.mime, 'bytes', m.bytes) order by m.id)
      from portfolio_editorial.media m where m.status = 'ready' and (
        exists(select 1 from portfolio_editorial.draft_media_refs r where r.media_id = m.id and r.draft_id = 1)
        or exists(select 1 from portfolio_editorial.technologies t where t.icon_media_id = m.id)
      )), '{}'::jsonb)
  ) into result;
  return result;
end $$;


-- Migration: 20260927135000_sync_skill_catalog_labels.sql
-- ADR-012: catalog labels are the shared source for existing Skill entities.

create or replace function portfolio_editorial.sync_skill_catalog_label()
returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  update portfolio_editorial.draft_translations t
    set fields = jsonb_set(t.fields, '{name}', to_jsonb(new.label), true)
    from portfolio_editorial.draft_entities e
    where e.draft_id = t.draft_id
      and e.id = t.entity_id
      and e.kind = 'skill'
      and e.data ->> 'technologyId' = new.id;
  return new;
end $$;

drop trigger if exists sync_skill_catalog_label on portfolio_editorial.technologies;
create trigger sync_skill_catalog_label
after update of label on portfolio_editorial.technologies
for each row when (old.label is distinct from new.label)
execute function portfolio_editorial.sync_skill_catalog_label();


-- Migration: 20260927141000_grant_editorial_storage_finalize_access.sql
-- The editorial executor validates the uploaded object's metadata before a
-- reservation can become ready. Keep that access private to the definer role
-- and limited to objects represented by an editorial media row.
grant usage on schema storage to portfolio_editorial_executor;
grant select on storage.objects to portfolio_editorial_executor;

drop policy if exists editorial_media_executor_select on storage.objects;
create policy editorial_media_executor_select on storage.objects for select to portfolio_editorial_executor
  using (
    exists (
      select 1
      from portfolio_editorial.media m
      where m.bucket = bucket_id
        and m.path = name
        and m.status in ('pending', 'ready')
    )
  );


-- Segurança: revogar leitura anônima de portfolio_admins
revoke select on public.portfolio_admins from anon;
