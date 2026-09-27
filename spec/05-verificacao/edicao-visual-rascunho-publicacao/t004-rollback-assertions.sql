do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'portfolio_skill_categories',
    'portfolio_skill_category_translations',
    'portfolio_skills',
    'portfolio_skill_translations',
    'portfolio_academic_entries',
    'portfolio_academic_entry_translations',
    'portfolio_contact_links',
    'portfolio_contact_link_translations'
  ] loop
    if not has_table_privilege('anon', 'public.' || table_name, 'select, insert, update, delete, truncate, references, trigger') then
      raise exception 'rollback did not restore anon baseline on %', table_name;
    end if;
    if not has_table_privilege('authenticated', 'public.' || table_name, 'select, insert, update, delete, truncate, references, trigger') then
      raise exception 'rollback did not restore authenticated baseline on %', table_name;
    end if;
  end loop;

  if has_table_privilege('anon', 'public.portfolio_texts', 'insert') then
    raise exception 'rollback widened original-table grants unexpectedly';
  end if;
  if not has_table_privilege('authenticated', 'public.portfolio_texts', 'select, insert, update') then
    raise exception 'rollback did not restore authenticated legacy writes';
  end if;
  if not has_table_privilege('service_role', 'public.portfolio_texts', 'select, insert, update, delete, truncate, references, trigger') then
    raise exception 'rollback changed service_role';
  end if;
end
$$;

