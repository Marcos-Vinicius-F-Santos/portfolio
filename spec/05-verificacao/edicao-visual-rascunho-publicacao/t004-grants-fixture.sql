create role anon nologin;
create role authenticated nologin;
create role service_role nologin;

create schema auth;
create function auth.uid() returns text
language sql stable
as $$ select nullif(current_setting('request.jwt.claim.sub', true), '') $$;

create table public.portfolio_admins (user_id text primary key);
insert into public.portfolio_admins (user_id) values ('admin-1');

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'portfolio_texts',
    'portfolio_text_translations',
    'portfolio_experiences',
    'portfolio_experience_translations',
    'portfolio_projects',
    'portfolio_project_translations',
    'portfolio_project_images',
    'portfolio_files',
    'portfolio_skill_categories',
    'portfolio_skill_category_translations',
    'portfolio_skills',
    'portfolio_skill_translations',
    'portfolio_academic_entries',
    'portfolio_academic_entry_translations',
    'portfolio_contact_links',
    'portfolio_contact_link_translations'
  ] loop
    execute format('create table public.%I (id text primary key, value text)', table_name);
    execute format('alter table public.%I enable row level security', table_name);
    execute format(
      'create policy %I on public.%I for select to anon, authenticated using (true)',
      table_name || '_public_read',
      table_name
    );
    execute format(
      'create policy %I on public.%I for insert to authenticated with check (exists (select 1 from public.portfolio_admins where user_id = (select auth.uid())))',
      table_name || '_admin_insert',
      table_name
    );
    execute format(
      'create policy %I on public.%I for update to authenticated using (exists (select 1 from public.portfolio_admins where user_id = (select auth.uid()))) with check (exists (select 1 from public.portfolio_admins where user_id = (select auth.uid())))',
      table_name || '_admin_update',
      table_name
    );
  end loop;
end
$$;

alter table public.portfolio_admins enable row level security;
create policy portfolio_admins_select_self
  on public.portfolio_admins for select to authenticated
  using (user_id = (select auth.uid()));

-- Reproduce the excessive effective grants found in the remote baseline.
grant all privileges on all tables in schema public to anon, authenticated, service_role;
