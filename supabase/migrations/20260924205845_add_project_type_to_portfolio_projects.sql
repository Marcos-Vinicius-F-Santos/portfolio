alter table public.portfolio_projects
  add column project_type text;

do $$
begin
  if exists (
    select 1
    from public.portfolio_projects
    where project_type is null
  ) then
    raise exception
      'Cannot classify existing portfolio_projects rows before adding project_type';
  end if;
end
$$;

alter table public.portfolio_projects
  add constraint portfolio_projects_project_type_check
  check (project_type in ('professional', 'personal'));

alter table public.portfolio_projects
  alter column project_type set not null;

comment on column public.portfolio_projects.project_type is
  'Public project classification: professional or personal';

-- Rollback:
-- alter table public.portfolio_projects
--   drop constraint portfolio_projects_project_type_check;
-- alter table public.portfolio_projects
--   drop column project_type;
