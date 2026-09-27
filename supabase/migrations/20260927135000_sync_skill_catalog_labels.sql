-- ADR-012: catalog labels are the shared source for existing Skill entities.

create or replace function portfolio_editorial.sync_skill_catalog_label()
returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  update portfolio_editorial.draft_translations t
    set fields = jsonb_set(t.fields, '{name}', to_jsonb(new.label), true)
    from portfolio_editorial.draft_entities e
    where e.draft_id = t.draft_id
      and e.id = t.entity_id
      and e.kind = 'skill'
      and e.data ->> 'technologyId' = new.id;
  return new;
end $$;

drop trigger if exists sync_skill_catalog_label on portfolio_editorial.technologies;
create trigger sync_skill_catalog_label
after update of label on portfolio_editorial.technologies
for each row when (old.label is distinct from new.label)
execute function portfolio_editorial.sync_skill_catalog_label();
