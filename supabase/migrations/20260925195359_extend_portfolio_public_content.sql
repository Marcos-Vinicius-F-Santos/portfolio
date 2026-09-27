alter table public.portfolio_skills
  add column if not exists icon_url text,
  add column if not exists icon_storage_path text,
  add column if not exists icon_original_name text,
  add column if not exists icon_mime_type text,
  add column if not exists icon_size_bytes bigint;

alter table public.portfolio_skills
  drop constraint if exists portfolio_skills_icon_size_check;

alter table public.portfolio_skills
  add constraint portfolio_skills_icon_size_check
  check (icon_size_bytes is null or (icon_size_bytes > 0 and icon_size_bytes <= 1048576));

alter table public.portfolio_skills
  drop constraint if exists portfolio_skills_icon_mime_check;

alter table public.portfolio_skills
  add constraint portfolio_skills_icon_mime_check
  check (icon_mime_type is null or icon_mime_type in ('image/png', 'image/jpeg'));

alter table public.portfolio_academic_entries
  add column if not exists start_date date,
  add column if not exists end_date date,
  add column if not exists is_current boolean not null default false;

alter table public.portfolio_academic_entries
  drop constraint if exists portfolio_academic_entries_period_check;

alter table public.portfolio_academic_entries
  add constraint portfolio_academic_entries_period_check
  check (end_date is null or start_date is null or end_date >= start_date);

alter table public.portfolio_academic_entry_translations
  add column if not exists competencies text[] not null default '{}',
  add column if not exists studied_content text[] not null default '{}';

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'skill-icons',
  'skill-icons',
  true,
  1048576,
  array['image/png', 'image/jpeg']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

create policy storage_skill_icons_public_read
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'skill-icons');

create policy storage_skill_icons_admin_insert
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'skill-icons'
    and exists (
      select 1
      from public.portfolio_admins
      where user_id = (select auth.uid())
    )
  );

create policy storage_skill_icons_admin_update
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'skill-icons'
    and exists (
      select 1
      from public.portfolio_admins
      where user_id = (select auth.uid())
    )
  )
  with check (
    bucket_id = 'skill-icons'
    and exists (
      select 1
      from public.portfolio_admins
      where user_id = (select auth.uid())
    )
  );

create policy storage_skill_icons_admin_delete
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'skill-icons'
    and exists (
      select 1
      from public.portfolio_admins
      where user_id = (select auth.uid())
    )
  );

create or replace function public.replace_portfolio_skill_icon(
  p_skill_id uuid,
  p_icon_url text,
  p_storage_path text,
  p_original_name text,
  p_mime_type text,
  p_size_bytes bigint
)
returns text
language plpgsql
security invoker
set search_path = public
as $$
declare
  previous_storage_path text;
begin
  select icon_storage_path
    into previous_storage_path
    from public.portfolio_skills
   where id = p_skill_id
   for update;

  if not found then
    raise exception 'Skill not found';
  end if;

  update public.portfolio_skills
     set icon_url = nullif(trim(p_icon_url), ''),
         icon_storage_path = nullif(trim(p_storage_path), ''),
         icon_original_name = nullif(trim(p_original_name), ''),
         icon_mime_type = nullif(trim(p_mime_type), ''),
         icon_size_bytes = p_size_bytes
   where id = p_skill_id;

  return previous_storage_path;
end;
$$;

revoke execute on function public.replace_portfolio_skill_icon(uuid, text, text, text, text, bigint)
  from public, anon;
grant execute on function public.replace_portfolio_skill_icon(uuid, text, text, text, text, bigint)
  to authenticated;

-- Rollback seguro: remover o consumo dos campos e a policy/bucket somente depois de
-- confirmar que nenhum frontend os utiliza. Não apagar os objetos do Storage durante
-- rollback sem backup e revisão explícita.
