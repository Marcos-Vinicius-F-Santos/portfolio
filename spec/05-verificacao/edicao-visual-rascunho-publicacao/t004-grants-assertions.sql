do $$
declare
  table_name text;
  privilege text;
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
    if not has_table_privilege('anon', 'public.' || table_name, 'select') then
      raise exception 'anon must retain SELECT on %', table_name;
    end if;
    if not has_table_privilege('authenticated', 'public.' || table_name, 'select, insert, update') then
      raise exception 'authenticated must retain SELECT/INSERT/UPDATE on %', table_name;
    end if;
    foreach privilege in array array['insert', 'update', 'delete', 'truncate', 'references', 'trigger'] loop
      if has_table_privilege('anon', 'public.' || table_name, privilege) then
        raise exception 'anon unexpectedly has % on %', privilege, table_name;
      end if;
    end loop;
    foreach privilege in array array['delete', 'truncate', 'references', 'trigger'] loop
      if has_table_privilege('authenticated', 'public.' || table_name, privilege) then
        raise exception 'authenticated unexpectedly has % on %', privilege, table_name;
      end if;
    end loop;
    if not has_table_privilege('service_role', 'public.' || table_name, 'select, insert, update, delete, truncate, references, trigger') then
      raise exception 'service_role privileges changed on %', table_name;
    end if;
  end loop;

  if has_table_privilege('anon', 'public.portfolio_admins', 'select') then
    raise exception 'anon must not read portfolio_admins';
  end if;
  if not has_table_privilege('authenticated', 'public.portfolio_admins', 'select') then
    raise exception 'authenticated must read its own admin row through RLS';
  end if;
  foreach privilege in array array['insert', 'update', 'delete', 'truncate', 'references', 'trigger'] loop
    if has_table_privilege('authenticated', 'public.portfolio_admins', privilege) then
      raise exception 'authenticated unexpectedly has % on portfolio_admins', privilege;
    end if;
  end loop;
end
$$;

