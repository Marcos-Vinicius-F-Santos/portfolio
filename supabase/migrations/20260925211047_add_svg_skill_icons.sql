alter table public.portfolio_skills
  drop constraint if exists portfolio_skills_icon_mime_check;

alter table public.portfolio_skills
  add constraint portfolio_skills_icon_mime_check
  check (
    icon_mime_type is null
    or icon_mime_type in ('image/png', 'image/jpeg', 'image/svg+xml')
  );

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'skill-icons',
  'skill-icons',
  true,
  1048576,
  array['image/png', 'image/jpeg', 'image/svg+xml']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

-- Rollback seguro: remover image/svg+xml das constraints somente depois de confirmar
-- que nenhum ícone SVG continua referenciado pelos registros ou pelo Storage.
