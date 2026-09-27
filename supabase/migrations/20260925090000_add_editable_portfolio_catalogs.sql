create table public.portfolio_skill_categories (
  id uuid primary key default gen_random_uuid(),
  category_key text not null unique,
  display_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.portfolio_skill_category_translations (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.portfolio_skill_categories(id) on delete cascade,
  locale text not null check (locale in ('pt-BR', 'en')),
  label text not null,
  created_at timestamptz not null default now(),
  unique (category_id, locale)
);

create table public.portfolio_skills (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.portfolio_skill_categories(id) on delete cascade,
  display_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.portfolio_skill_translations (
  id uuid primary key default gen_random_uuid(),
  skill_id uuid not null references public.portfolio_skills(id) on delete cascade,
  locale text not null check (locale in ('pt-BR', 'en')),
  name text not null,
  created_at timestamptz not null default now(),
  unique (skill_id, locale)
);

create table public.portfolio_academic_entries (
  id uuid primary key default gen_random_uuid(),
  display_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.portfolio_academic_entry_translations (
  id uuid primary key default gen_random_uuid(),
  entry_id uuid not null references public.portfolio_academic_entries(id) on delete cascade,
  locale text not null check (locale in ('pt-BR', 'en')),
  name text not null,
  institution text not null,
  created_at timestamptz not null default now(),
  unique (entry_id, locale)
);

create table public.portfolio_contact_links (
  id uuid primary key default gen_random_uuid(),
  symbol text not null check (symbol in ('linkedin', 'github', 'email', 'phone')),
  href text not null,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  unique (symbol)
);

create table public.portfolio_contact_link_translations (
  id uuid primary key default gen_random_uuid(),
  contact_id uuid not null references public.portfolio_contact_links(id) on delete cascade,
  locale text not null check (locale in ('pt-BR', 'en')),
  label text not null,
  created_at timestamptz not null default now(),
  unique (contact_id, locale)
);

create index portfolio_skill_category_translations_category_id_idx
  on public.portfolio_skill_category_translations (category_id);
create index portfolio_skills_category_id_order_idx
  on public.portfolio_skills (category_id, display_order);
create index portfolio_skill_translations_skill_id_idx
  on public.portfolio_skill_translations (skill_id);
create index portfolio_academic_entries_order_idx
  on public.portfolio_academic_entries (display_order);
create index portfolio_academic_entry_translations_entry_id_idx
  on public.portfolio_academic_entry_translations (entry_id);
create index portfolio_contact_links_order_idx
  on public.portfolio_contact_links (display_order);
create index portfolio_contact_link_translations_contact_id_idx
  on public.portfolio_contact_link_translations (contact_id);

grant select on
  public.portfolio_skill_categories,
  public.portfolio_skill_category_translations,
  public.portfolio_skills,
  public.portfolio_skill_translations,
  public.portfolio_academic_entries,
  public.portfolio_academic_entry_translations,
  public.portfolio_contact_links,
  public.portfolio_contact_link_translations
to anon, authenticated;

grant insert, update on
  public.portfolio_skill_categories,
  public.portfolio_skill_category_translations,
  public.portfolio_skills,
  public.portfolio_skill_translations,
  public.portfolio_academic_entries,
  public.portfolio_academic_entry_translations,
  public.portfolio_contact_links,
  public.portfolio_contact_link_translations
to authenticated;

alter table public.portfolio_skill_categories enable row level security;
alter table public.portfolio_skill_category_translations enable row level security;
alter table public.portfolio_skills enable row level security;
alter table public.portfolio_skill_translations enable row level security;
alter table public.portfolio_academic_entries enable row level security;
alter table public.portfolio_academic_entry_translations enable row level security;
alter table public.portfolio_contact_links enable row level security;
alter table public.portfolio_contact_link_translations enable row level security;

create policy portfolio_skill_categories_public_read
  on public.portfolio_skill_categories for select
  to anon, authenticated using (true);
create policy portfolio_skill_categories_admin_insert
  on public.portfolio_skill_categories for insert
  to authenticated with check (exists (
    select 1 from public.portfolio_admins where user_id = (select auth.uid())
  ));
create policy portfolio_skill_categories_admin_update
  on public.portfolio_skill_categories for update
  to authenticated
  using (exists (
    select 1 from public.portfolio_admins where user_id = (select auth.uid())
  ))
  with check (exists (
    select 1 from public.portfolio_admins where user_id = (select auth.uid())
  ));

create policy portfolio_skill_category_translations_public_read
  on public.portfolio_skill_category_translations for select
  to anon, authenticated using (true);
create policy portfolio_skill_category_translations_admin_insert
  on public.portfolio_skill_category_translations for insert
  to authenticated with check (exists (
    select 1 from public.portfolio_admins where user_id = (select auth.uid())
  ));
create policy portfolio_skill_category_translations_admin_update
  on public.portfolio_skill_category_translations for update
  to authenticated
  using (exists (
    select 1 from public.portfolio_admins where user_id = (select auth.uid())
  ))
  with check (exists (
    select 1 from public.portfolio_admins where user_id = (select auth.uid())
  ));

create policy portfolio_skills_public_read
  on public.portfolio_skills for select
  to anon, authenticated using (true);
create policy portfolio_skills_admin_insert
  on public.portfolio_skills for insert
  to authenticated with check (exists (
    select 1 from public.portfolio_admins where user_id = (select auth.uid())
  ));
create policy portfolio_skills_admin_update
  on public.portfolio_skills for update
  to authenticated
  using (exists (
    select 1 from public.portfolio_admins where user_id = (select auth.uid())
  ))
  with check (exists (
    select 1 from public.portfolio_admins where user_id = (select auth.uid())
  ));

create policy portfolio_skill_translations_public_read
  on public.portfolio_skill_translations for select
  to anon, authenticated using (true);
create policy portfolio_skill_translations_admin_insert
  on public.portfolio_skill_translations for insert
  to authenticated with check (exists (
    select 1 from public.portfolio_admins where user_id = (select auth.uid())
  ));
create policy portfolio_skill_translations_admin_update
  on public.portfolio_skill_translations for update
  to authenticated
  using (exists (
    select 1 from public.portfolio_admins where user_id = (select auth.uid())
  ))
  with check (exists (
    select 1 from public.portfolio_admins where user_id = (select auth.uid())
  ));

create policy portfolio_academic_entries_public_read
  on public.portfolio_academic_entries for select
  to anon, authenticated using (true);
create policy portfolio_academic_entries_admin_insert
  on public.portfolio_academic_entries for insert
  to authenticated with check (exists (
    select 1 from public.portfolio_admins where user_id = (select auth.uid())
  ));
create policy portfolio_academic_entries_admin_update
  on public.portfolio_academic_entries for update
  to authenticated
  using (exists (
    select 1 from public.portfolio_admins where user_id = (select auth.uid())
  ))
  with check (exists (
    select 1 from public.portfolio_admins where user_id = (select auth.uid())
  ));

create policy portfolio_academic_entry_translations_public_read
  on public.portfolio_academic_entry_translations for select
  to anon, authenticated using (true);
create policy portfolio_academic_entry_translations_admin_insert
  on public.portfolio_academic_entry_translations for insert
  to authenticated with check (exists (
    select 1 from public.portfolio_admins where user_id = (select auth.uid())
  ));
create policy portfolio_academic_entry_translations_admin_update
  on public.portfolio_academic_entry_translations for update
  to authenticated
  using (exists (
    select 1 from public.portfolio_admins where user_id = (select auth.uid())
  ))
  with check (exists (
    select 1 from public.portfolio_admins where user_id = (select auth.uid())
  ));

create policy portfolio_contact_links_public_read
  on public.portfolio_contact_links for select
  to anon, authenticated using (true);
create policy portfolio_contact_links_admin_insert
  on public.portfolio_contact_links for insert
  to authenticated with check (exists (
    select 1 from public.portfolio_admins where user_id = (select auth.uid())
  ));
create policy portfolio_contact_links_admin_update
  on public.portfolio_contact_links for update
  to authenticated
  using (exists (
    select 1 from public.portfolio_admins where user_id = (select auth.uid())
  ))
  with check (exists (
    select 1 from public.portfolio_admins where user_id = (select auth.uid())
  ));

create policy portfolio_contact_link_translations_public_read
  on public.portfolio_contact_link_translations for select
  to anon, authenticated using (true);
create policy portfolio_contact_link_translations_admin_insert
  on public.portfolio_contact_link_translations for insert
  to authenticated with check (exists (
    select 1 from public.portfolio_admins where user_id = (select auth.uid())
  ));
create policy portfolio_contact_link_translations_admin_update
  on public.portfolio_contact_link_translations for update
  to authenticated
  using (exists (
    select 1 from public.portfolio_admins where user_id = (select auth.uid())
  ))
  with check (exists (
    select 1 from public.portfolio_admins where user_id = (select auth.uid())
  ));

-- Rollback (after consumers no longer depend on these tables):
-- drop table public.portfolio_contact_link_translations;
-- drop table public.portfolio_contact_links;
-- drop table public.portfolio_academic_entry_translations;
-- drop table public.portfolio_academic_entries;
-- drop table public.portfolio_skill_translations;
-- drop table public.portfolio_skills;
-- drop table public.portfolio_skill_category_translations;
-- drop table public.portfolio_skill_categories;
