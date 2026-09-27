-- T-007 rollback is valid before any editorial change is accepted.
-- It removes only the deterministic initial import and returns the T-005 schema
-- to its empty seeded state. Export the draft first if editing has already begun.
begin;

update portfolio_editorial.site_state
set active_publication_id = null, updated_at = now()
where id = 1
  and active_publication_id = '00000000-0000-4000-8000-000000000001';

update portfolio_editorial.draft
set base_publication_id = null, updated_at = now()
where id = 1
  and revision = 0
  and base_publication_id = '00000000-0000-4000-8000-000000000001';

delete from portfolio_editorial.publications
where id = '00000000-0000-4000-8000-000000000001'
  and source_revision = 0
  and hash = 'dfa9663192c374faf67e95de60d9975b498d182118c5be52f1d5d1915d6d3a84';

delete from portfolio_editorial.draft_translations where draft_id = 1;
delete from portfolio_editorial.draft_entities where draft_id = 1;
delete from portfolio_editorial.technologies;
delete from portfolio_editorial.draft_locales where draft_id = 1 and code = 'en';
alter sequence portfolio_editorial.publications_sequence_seq restart with 1;

commit;

do $$
begin
  if (select count(*) from portfolio_editorial.draft where id = 1 and revision = 0 and base_publication_id is null) <> 1
    or (select count(*) from portfolio_editorial.draft_locales where draft_id = 1 and code = 'pt-BR' and status = 'active') <> 1
    or (select count(*) from portfolio_editorial.draft_locales) <> 1
    or (select count(*) from portfolio_editorial.draft_entities) <> 0
    or (select count(*) from portfolio_editorial.draft_translations) <> 0
    or (select count(*) from portfolio_editorial.technologies) <> 0
    or (select count(*) from portfolio_editorial.publications) <> 0
    or (select count(*) from portfolio_editorial.site_state where id = 1 and active_publication_id is null and not editorial_enabled) <> 1 then
    raise exception 'T-007 rollback did not restore the empty T-005 state';
  end if;
end
$$;
