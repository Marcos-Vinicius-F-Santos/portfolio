-- T-004 / FR-021 / FR-022
-- Reset explicit privileges on application-owned tables. RLS remains the
-- row-level authority for authenticated INSERT/UPDATE during the legacy
-- writer transition. Managed schemas (including storage) are intentionally
-- outside this migration.

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
  public.portfolio_files,
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
  public.portfolio_contact_link_translations
to authenticated;

grant select on public.portfolio_admins to authenticated;

