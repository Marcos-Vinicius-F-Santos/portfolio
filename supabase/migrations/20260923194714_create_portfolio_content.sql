create extension if not exists pgcrypto;

create table public.portfolio_texts (
  id uuid primary key default gen_random_uuid(),
  content_key text not null unique,
  content_type text not null,
  created_at timestamptz not null default now()
);

create table public.portfolio_text_translations (
  id uuid primary key default gen_random_uuid(),
  text_id uuid not null references public.portfolio_texts(id) on delete cascade,
  locale text not null check (locale in ('pt-BR', 'en')),
  value text not null,
  created_at timestamptz not null default now(),
  unique (text_id, locale)
);

create table public.portfolio_experiences (
  id uuid primary key default gen_random_uuid(),
  start_date date not null,
  end_date date,
  company_context text not null,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  check (end_date is null or end_date >= start_date)
);

create table public.portfolio_experience_translations (
  id uuid primary key default gen_random_uuid(),
  experience_id uuid not null references public.portfolio_experiences(id) on delete cascade,
  locale text not null check (locale in ('pt-BR', 'en')),
  title text not null,
  context text not null,
  responsibilities text[] not null default '{}',
  technical_decisions text[] not null default '{}',
  results text[] not null default '{}',
  created_at timestamptz not null default now(),
  unique (experience_id, locale)
);

create table public.portfolio_projects (
  id uuid primary key default gen_random_uuid(),
  display_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.portfolio_project_translations (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.portfolio_projects(id) on delete cascade,
  locale text not null check (locale in ('pt-BR', 'en')),
  name text not null,
  description text not null,
  problem_context text,
  solution text,
  role text,
  technical_decisions text[] not null default '{}',
  technologies text[] not null default '{}',
  results text[] not null default '{}',
  learnings text[] not null default '{}',
  links jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  unique (project_id, locale)
);

create table public.portfolio_project_images (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.portfolio_projects(id) on delete cascade,
  storage_path text not null unique,
  original_name text not null,
  mime_type text not null check (mime_type in ('image/png', 'image/jpeg')),
  size_bytes bigint not null check (size_bytes > 0 and size_bytes <= 1048576),
  display_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.portfolio_files (
  id uuid primary key default gen_random_uuid(),
  file_type text not null check (file_type = 'curriculum'),
  locale text not null check (locale in ('pt-BR', 'en')),
  storage_path text not null unique,
  original_name text not null,
  mime_type text not null,
  size_bytes bigint not null check (size_bytes > 0),
  created_at timestamptz not null default now(),
  unique (file_type, locale)
);

create table public.portfolio_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create index portfolio_text_translations_text_id_idx
  on public.portfolio_text_translations (text_id);
create index portfolio_experience_translations_experience_id_idx
  on public.portfolio_experience_translations (experience_id);
create index portfolio_project_translations_project_id_idx
  on public.portfolio_project_translations (project_id);
create index portfolio_project_images_project_id_order_idx
  on public.portfolio_project_images (project_id, display_order);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('project-images', 'project-images', true, 1048576, array['image/png', 'image/jpeg']),
  ('curricula', 'curricula', true, null, null)
on conflict (id) do nothing;

grant select on
  public.portfolio_texts,
  public.portfolio_text_translations,
  public.portfolio_experiences,
  public.portfolio_experience_translations,
  public.portfolio_projects,
  public.portfolio_project_translations,
  public.portfolio_project_images,
  public.portfolio_files
to anon, authenticated;

grant insert, update on
  public.portfolio_texts,
  public.portfolio_text_translations,
  public.portfolio_experiences,
  public.portfolio_experience_translations,
  public.portfolio_projects,
  public.portfolio_project_translations,
  public.portfolio_project_images,
  public.portfolio_files
to authenticated;

grant select on public.portfolio_admins to authenticated;

alter table public.portfolio_texts enable row level security;
alter table public.portfolio_text_translations enable row level security;
alter table public.portfolio_experiences enable row level security;
alter table public.portfolio_experience_translations enable row level security;
alter table public.portfolio_projects enable row level security;
alter table public.portfolio_project_translations enable row level security;
alter table public.portfolio_project_images enable row level security;
alter table public.portfolio_files enable row level security;
alter table public.portfolio_admins enable row level security;

create policy portfolio_texts_public_read
  on public.portfolio_texts for select
  to anon, authenticated
  using (true);

create policy portfolio_texts_admin_insert
  on public.portfolio_texts for insert
  to authenticated
  with check (exists (
    select 1 from public.portfolio_admins
    where user_id = (select auth.uid())
  ));

create policy portfolio_texts_admin_update
  on public.portfolio_texts for update
  to authenticated
  using (exists (
    select 1 from public.portfolio_admins
    where user_id = (select auth.uid())
  ))
  with check (exists (
    select 1 from public.portfolio_admins
    where user_id = (select auth.uid())
  ));

create policy portfolio_text_translations_public_read
  on public.portfolio_text_translations for select
  to anon, authenticated
  using (true);

create policy portfolio_text_translations_admin_insert
  on public.portfolio_text_translations for insert
  to authenticated
  with check (exists (
    select 1 from public.portfolio_admins
    where user_id = (select auth.uid())
  ));

create policy portfolio_text_translations_admin_update
  on public.portfolio_text_translations for update
  to authenticated
  using (exists (
    select 1 from public.portfolio_admins
    where user_id = (select auth.uid())
  ))
  with check (exists (
    select 1 from public.portfolio_admins
    where user_id = (select auth.uid())
  ));

create policy portfolio_experiences_public_read
  on public.portfolio_experiences for select
  to anon, authenticated
  using (true);

create policy portfolio_experiences_admin_insert
  on public.portfolio_experiences for insert
  to authenticated
  with check (exists (
    select 1 from public.portfolio_admins
    where user_id = (select auth.uid())
  ));

create policy portfolio_experiences_admin_update
  on public.portfolio_experiences for update
  to authenticated
  using (exists (
    select 1 from public.portfolio_admins
    where user_id = (select auth.uid())
  ))
  with check (exists (
    select 1 from public.portfolio_admins
    where user_id = (select auth.uid())
  ));

create policy portfolio_experience_translations_public_read
  on public.portfolio_experience_translations for select
  to anon, authenticated
  using (true);

create policy portfolio_experience_translations_admin_insert
  on public.portfolio_experience_translations for insert
  to authenticated
  with check (exists (
    select 1 from public.portfolio_admins
    where user_id = (select auth.uid())
  ));

create policy portfolio_experience_translations_admin_update
  on public.portfolio_experience_translations for update
  to authenticated
  using (exists (
    select 1 from public.portfolio_admins
    where user_id = (select auth.uid())
  ))
  with check (exists (
    select 1 from public.portfolio_admins
    where user_id = (select auth.uid())
  ));

create policy portfolio_projects_public_read
  on public.portfolio_projects for select
  to anon, authenticated
  using (true);

create policy portfolio_projects_admin_insert
  on public.portfolio_projects for insert
  to authenticated
  with check (exists (
    select 1 from public.portfolio_admins
    where user_id = (select auth.uid())
  ));

create policy portfolio_projects_admin_update
  on public.portfolio_projects for update
  to authenticated
  using (exists (
    select 1 from public.portfolio_admins
    where user_id = (select auth.uid())
  ))
  with check (exists (
    select 1 from public.portfolio_admins
    where user_id = (select auth.uid())
  ));

create policy portfolio_project_translations_public_read
  on public.portfolio_project_translations for select
  to anon, authenticated
  using (true);

create policy portfolio_project_translations_admin_insert
  on public.portfolio_project_translations for insert
  to authenticated
  with check (exists (
    select 1 from public.portfolio_admins
    where user_id = (select auth.uid())
  ));

create policy portfolio_project_translations_admin_update
  on public.portfolio_project_translations for update
  to authenticated
  using (exists (
    select 1 from public.portfolio_admins
    where user_id = (select auth.uid())
  ))
  with check (exists (
    select 1 from public.portfolio_admins
    where user_id = (select auth.uid())
  ));

create policy portfolio_project_images_public_read
  on public.portfolio_project_images for select
  to anon, authenticated
  using (true);

create policy portfolio_project_images_admin_insert
  on public.portfolio_project_images for insert
  to authenticated
  with check (exists (
    select 1 from public.portfolio_admins
    where user_id = (select auth.uid())
  ));

create policy portfolio_project_images_admin_update
  on public.portfolio_project_images for update
  to authenticated
  using (exists (
    select 1 from public.portfolio_admins
    where user_id = (select auth.uid())
  ))
  with check (exists (
    select 1 from public.portfolio_admins
    where user_id = (select auth.uid())
  ));

create policy portfolio_files_public_read
  on public.portfolio_files for select
  to anon, authenticated
  using (true);

create policy portfolio_files_admin_insert
  on public.portfolio_files for insert
  to authenticated
  with check (exists (
    select 1 from public.portfolio_admins
    where user_id = (select auth.uid())
  ));

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

create policy portfolio_admins_select_self
  on public.portfolio_admins for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy storage_public_read
  on storage.objects for select
  to anon, authenticated
  using (bucket_id in ('project-images', 'curricula'));

create policy storage_admin_insert
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id in ('project-images', 'curricula')
    and exists (
      select 1 from public.portfolio_admins
      where user_id = (select auth.uid())
    )
  );

create policy storage_admin_update
  on storage.objects for update
  to authenticated
  using (
    bucket_id in ('project-images', 'curricula')
    and exists (
      select 1 from public.portfolio_admins
      where user_id = (select auth.uid())
    )
  )
  with check (
    bucket_id in ('project-images', 'curricula')
    and exists (
      select 1 from public.portfolio_admins
      where user_id = (select auth.uid())
    )
  );
