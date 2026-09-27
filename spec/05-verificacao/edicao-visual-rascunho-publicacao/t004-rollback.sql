-- Emergency rollback for 20260926090000_restrict_all_portfolio_table_grants.
-- This restores the effective pre-T-004 catalogue grants captured in the
-- baseline, including the excessive privileges. Do not apply it routinely.

revoke all privileges on
  public.portfolio_texts,
  public.portfolio_text_translations,
  public.portfolio_experiences,
  public.portfolio_experience_translations,
  public.portfolio_projects,
  public.portfolio_project_translations,
  public.portfolio_project_images,
  public.portfolio_files,
  public.portfolio_skill_categories,
  public.portfolio_skill_category_translations,
  public.portfolio_skills,
  public.portfolio_skill_translations,
  public.portfolio_academic_entries,
  public.portfolio_academic_entry_translations,
  public.portfolio_contact_links,
  public.portfolio_contact_link_translations,
  public.portfolio_admins
from public, anon, authenticated;

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

grant select on public.portfolio_admins to authenticated;

-- The remote baseline showed ALL table privileges for both API roles on the
-- eight catalogue tables, despite the narrower grants in their source
-- migration. Restoring that state is intentionally isolated to this rollback.
grant all privileges on
  public.portfolio_skill_categories,
  public.portfolio_skill_category_translations,
  public.portfolio_skills,
  public.portfolio_skill_translations,
  public.portfolio_academic_entries,
  public.portfolio_academic_entry_translations,
  public.portfolio_contact_links,
  public.portfolio_contact_link_translations
to anon, authenticated;

