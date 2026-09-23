revoke all on
  public.portfolio_texts,
  public.portfolio_text_translations,
  public.portfolio_experiences,
  public.portfolio_experience_translations,
  public.portfolio_projects,
  public.portfolio_project_translations,
  public.portfolio_project_images,
  public.portfolio_files,
  public.portfolio_admins
from anon;

grant select on
  public.portfolio_texts,
  public.portfolio_text_translations,
  public.portfolio_experiences,
  public.portfolio_experience_translations,
  public.portfolio_projects,
  public.portfolio_project_translations,
  public.portfolio_project_images,
  public.portfolio_files
to anon;

revoke delete, truncate, references, trigger on
  public.portfolio_texts,
  public.portfolio_text_translations,
  public.portfolio_experiences,
  public.portfolio_experience_translations,
  public.portfolio_projects,
  public.portfolio_project_translations,
  public.portfolio_project_images,
  public.portfolio_files,
  public.portfolio_admins
from authenticated;

grant select, insert, update on
  public.portfolio_texts,
  public.portfolio_text_translations,
  public.portfolio_experiences,
  public.portfolio_experience_translations,
  public.portfolio_projects,
  public.portfolio_project_translations,
  public.portfolio_project_images,
  public.portfolio_files
  to authenticated;
revoke all on public.portfolio_admins from authenticated;
grant select on public.portfolio_admins to authenticated;

revoke all on storage.objects from anon;
grant select on storage.objects to anon;
revoke delete, truncate, references, trigger on storage.objects from authenticated;
grant select, insert, update on storage.objects to authenticated;