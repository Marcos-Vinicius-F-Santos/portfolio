do $$
declare
  snapshot jsonb;
begin
  if (select count(*) from portfolio_editorial.draft_entities) <> 191 then
    raise exception 'expected 191 imported entities';
  end if;
  if (select count(*) from portfolio_editorial.draft_translations) <> 382 then
    raise exception 'expected complete PT-BR and EN translations';
  end if;
  if (select count(*) from portfolio_editorial.technologies) <> 41 then
    raise exception 'expected 41 imported technologies';
  end if;
  if (select count(*) from portfolio_editorial.draft_locales where status = 'active') <> 2 then
    raise exception 'expected two active locales';
  end if;
  if (select count(*) from portfolio_editorial.publications) <> 1 then
    raise exception 'initial publication was duplicated';
  end if;
  if not exists (
    select 1 from portfolio_editorial.publications
    where id = '00000000-0000-4000-8000-000000000001'
      and format_version = 1
      and hash = 'dfa9663192c374faf67e95de60d9975b498d182118c5be52f1d5d1915d6d3a84'
      and source_revision = 0
  ) then
    raise exception 'initial publication metadata differs from the generated artifact';
  end if;
  if not exists (
    select 1 from portfolio_editorial.draft
    where id = 1 and revision = 0
      and base_publication_id = '00000000-0000-4000-8000-000000000001'
  ) or not exists (
    select 1 from portfolio_editorial.site_state
    where id = 1
      and active_publication_id = '00000000-0000-4000-8000-000000000001'
      and not editorial_enabled
  ) then
    raise exception 'cutover pointers do not target the initial publication safely';
  end if;

  select p.snapshot into snapshot
  from portfolio_editorial.publications p
  where p.id = '00000000-0000-4000-8000-000000000001';

  if (select count(*) from jsonb_object_keys(snapshot -> 'entities')) <> 191
    or (select count(*) from jsonb_object_keys(snapshot -> 'translations' -> 'pt-BR')) <> 191
    or (select count(*) from jsonb_object_keys(snapshot -> 'translations' -> 'en')) <> 191
    or (select count(*) from jsonb_object_keys(snapshot -> 'technologies')) <> 41
    or (select count(*) from jsonb_object_keys(snapshot -> 'media')) <> 18 then
    raise exception 'published snapshot counts differ from the draft import';
  end if;
  if snapshot -> 'entities' -> '3c67f7d3-57a6-4ece-af10-496b8ca33727' ->> 'kind' <> 'project'
    or snapshot -> 'entities' -> 'd9580705-9f05-407a-a367-1c729da2e63a' ->> 'kind' <> 'project' then
    raise exception 'stable project IDs were not preserved';
  end if;
  if not (snapshot -> 'entities' -> '3c67f7d3-57a6-4ece-af10-496b8ca33727' -> 'data' -> 'technologyIds' ? 'java') then
    raise exception 'project technology IDs were not preserved';
  end if;
  if exists (
    select 1 from jsonb_each(snapshot -> 'media') media
    where media.value ->> 'source' <> 'bundled'
  ) or exists (
    select 1 from jsonb_each(snapshot -> 'entities') entity
    where entity.value ->> 'kind' in ('projectImage', 'curriculum')
  ) then
    raise exception 'the import invented a managed media reference';
  end if;
  if exists (
    (select key from jsonb_each(snapshot -> 'entities'))
    except
    (select id from portfolio_editorial.draft_entities)
  ) or exists (
    (select id from portfolio_editorial.draft_entities)
    except
    (select key from jsonb_each(snapshot -> 'entities'))
  ) then
    raise exception 'draft entity IDs differ from the published snapshot';
  end if;
end
$$;
