do $$
declare
  table_name text;
begin
  if has_schema_privilege('anon', 'portfolio_editorial', 'usage')
    or has_schema_privilege('authenticated', 'portfolio_editorial', 'usage')
    or has_schema_privilege('service_role', 'portfolio_editorial', 'usage') then
    raise exception 'an API role can use the private schema';
  end if;

  foreach table_name in array array[
    'draft', 'draft_locales', 'technologies', 'draft_entities',
    'draft_translations', 'publications', 'site_state'
  ] loop
    if has_table_privilege('anon', 'portfolio_editorial.' || table_name, 'select, insert, update, delete')
      or has_table_privilege('authenticated', 'portfolio_editorial.' || table_name, 'select, insert, update, delete')
      or has_table_privilege('service_role', 'portfolio_editorial.' || table_name, 'select, insert, update, delete') then
      raise exception 'direct API privilege found on %', table_name;
    end if;
    if not exists (
      select 1 from pg_class c
      join pg_namespace n on n.oid = c.relnamespace
      where n.nspname = 'portfolio_editorial'
        and c.relname = table_name
        and c.relrowsecurity
        and c.relforcerowsecurity
    ) then
      raise exception 'RLS/FORCE RLS missing on %', table_name;
    end if;
  end loop;

  if has_function_privilege('anon', 'portfolio_editorial.protect_default_locale()', 'execute')
    or has_function_privilege('authenticated', 'portfolio_editorial.protect_default_locale()', 'execute')
    or has_function_privilege('service_role', 'portfolio_editorial.protect_default_locale()', 'execute') then
    raise exception 'API role can execute private trigger function';
  end if;

  if (select count(*) from portfolio_editorial.draft where id = 1 and revision = 0) <> 1 then
    raise exception 'draft singleton was not seeded';
  end if;
  if (select count(*) from portfolio_editorial.draft_locales where code = 'pt-BR' and status = 'active') <> 1 then
    raise exception 'required pt-BR locale was not seeded';
  end if;
  if (select count(*) from portfolio_editorial.site_state where id = 1 and not editorial_enabled) <> 1 then
    raise exception 'site state singleton was not seeded safely';
  end if;
end
$$;

insert into portfolio_editorial.draft_entities
  (id, kind, position, data)
values ('about', 'about', 0, '{}'::jsonb);

insert into portfolio_editorial.draft_translations
  (entity_id, locale_code, fields)
values ('about', 'pt-BR', '{"title":"Sobre mim","body":"Texto"}'::jsonb);

insert into portfolio_editorial.publications
  (id, format_version, snapshot, hash, source_revision)
values (
  '00000000-0000-4000-8000-000000000001',
  1,
  '{"formatVersion":1}'::jsonb,
  repeat('a', 64),
  1
);

update portfolio_editorial.publications set retained = false
where id = '00000000-0000-4000-8000-000000000001';

