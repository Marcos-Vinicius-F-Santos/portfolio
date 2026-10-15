-- Add the white-label profile identity to instances created before the profile entity existed.
-- The profile id remains neutral; deployment-specific identity is supplied by runtime config.
insert into portfolio_editorial.draft_entities (draft_id, id, kind, parent_id, position, data)
values (1, 'profile', 'profile', null, 0, jsonb_build_object('profileId', 'profile-generic'))
on conflict (draft_id, id) do update
set kind = excluded.kind,
    parent_id = excluded.parent_id,
    position = excluded.position,
    data = portfolio_editorial.draft_entities.data || jsonb_build_object('profileId', 'profile-generic');

insert into portfolio_editorial.draft_translations (draft_id, entity_id, locale_code, fields)
select 1, 'profile', code, '{}'::jsonb
from portfolio_editorial.draft_locales
where draft_id = 1
on conflict (draft_id, entity_id, locale_code) do nothing;
