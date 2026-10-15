-- T-006/T-007: snapshot inicial genérico. Conteúdo específico é fornecido pelo
-- artefato parametrizado em spec/05-verificacao/editorial-snapshot.
alter table portfolio_editorial.draft_entities
  drop constraint if exists draft_entities_kind_check;
alter table portfolio_editorial.draft_entities
  add constraint draft_entities_kind_check check (kind in (
    'presentation', 'profile', 'about', 'result', 'experience', 'skillCategory', 'skill',
    'academic', 'project', 'contact', 'projectLink', 'projectImage', 'curriculum',
    'interfaceText', 'listItem'
  ));

do $$
declare
  payload jsonb := $snapshot$
  {
    "formatVersion": 1,
    "publicationId": "00000000-0000-4000-8000-000000000001",
    "createdAt": "2026-10-15T12:00:00.000Z",
    "defaultLocale": "pt-BR",
    "locales": [{"code":"pt-BR","label":"Português","direction":"ltr","position":0},{"code":"en","label":"English","direction":"ltr","position":1}],
    "sections": [{"id":"presentation-section","kind":"presentation","position":0},{"id":"about-section","kind":"about","position":1},{"id":"results-section","kind":"results","position":2},{"id":"experiences-section","kind":"experiences","position":3},{"id":"projects-section","kind":"projects","position":4},{"id":"skills-section","kind":"skills","position":5},{"id":"education-section","kind":"education","position":6},{"id":"contact-section","kind":"contact","position":7}],
    "entities": {
      "profile": {"kind":"profile","position":0,"data":{"profileId":"profile-generic","mediaId":"profile-image"}},
      "copy-intro": {"kind":"interfaceText","position":1,"data":{"key":"intro"}},
      "experience-1": {"kind":"experience","position":0,"data":{"startDate":"2024-01-01","endDate":null}},
      "experience-1-responsibility-1": {"kind":"listItem","parentId":"experience-1","position":0,"data":{"collection":"responsibilities"}},
      "project-1": {"kind":"project","position":0,"data":{"type":"professional","technologyIds":["typescript"]}},
      "project-1-link-1": {"kind":"projectLink","parentId":"project-1","position":0,"data":{"href":"https://example.com/project"}},
      "skill-category": {"kind":"skillCategory","position":0,"data":{}},
      "skill-typescript": {"kind":"skill","parentId":"skill-category","position":0,"data":{"technologyId":"typescript"}},
      "academic-1": {"kind":"academic","position":0,"data":{"startDate":"2022-01-01","endDate":"2024-12-31","isCurrent":false}},
      "contact-github": {"kind":"contact","position":0,"data":{"symbol":"github","href":"https://github.com/example"}}
    },
    "translations": {
      "pt-BR": {"profile":{},"copy-intro":{"text":"Profissional de software com atuação em soluções digitais."},"experience-1":{"title":"Experiência de software","context":"Contexto profissional."},"experience-1-responsibility-1":{"text":"Desenvolvimento de soluções digitais."},"project-1":{"name":"Projeto de referência","description":"Aplicação de referência.","problemContext":"Necessidade de uma solução digital."},"project-1-link-1":{"label":"Site"},"skill-category":{"label":"Linguagens"},"skill-typescript":{"name":"TypeScript"},"academic-1":{"name":"Formação em tecnologia","institution":"Instituição de referência"},"contact-github":{"label":"GitHub"}},
      "en": {"profile":{},"copy-intro":{"text":"Software professional working on digital solutions."},"experience-1":{"title":"Software experience","context":"Professional context."},"experience-1-responsibility-1":{"text":"Development of digital solutions."},"project-1":{"name":"Reference project","description":"Reference application.","problemContext":"Need for a digital solution."},"project-1-link-1":{"label":"Website"},"skill-category":{"label":"Languages"},"skill-typescript":{"name":"TypeScript"},"academic-1":{"name":"Technology education","institution":"Reference institution"},"contact-github":{"label":"GitHub"}}
    },
    "technologies": {"typescript":{"label":"TypeScript","aliases":["TS"]}},
    "media": {"profile-image":{"source":"managed","mime":"image/png","bytes":128,"assetPath":"profile/default.png"}}
  }
  $snapshot$::jsonb;
begin
  insert into portfolio_editorial.draft_locales(draft_id, code, label, direction, status, position)
  values (1, 'en', 'English', 'ltr', 'active', 1)
  on conflict (draft_id, code) do update set label = excluded.label, status = excluded.status, position = excluded.position;
  insert into portfolio_editorial.draft_entities(draft_id, id, kind, parent_id, position, data)
  select 1, e.key, e.value->>'kind', nullif(e.value->>'parentId',''), (e.value->>'position')::int, e.value->'data'
  from jsonb_each(payload->'entities') e
  on conflict (draft_id, id) do update set kind = excluded.kind, parent_id = excluded.parent_id, position = excluded.position, data = excluded.data;
  insert into portfolio_editorial.draft_translations(draft_id, entity_id, locale_code, fields)
  select 1, e.key, l.key, l.value->e.key from jsonb_each(payload->'entities') e cross join jsonb_each(payload->'translations') l
  on conflict (draft_id, entity_id, locale_code) do update set fields = excluded.fields;
  insert into portfolio_editorial.technologies(id, label, aliases, bundled_asset)
  select t.key, t.value->>'label', array(select jsonb_array_elements_text(t.value->'aliases')), null
  from jsonb_each(payload->'technologies') t
  on conflict (id) do update set label = excluded.label, aliases = excluded.aliases;
  insert into portfolio_editorial.publications(id, format_version, snapshot, hash, source_revision)
  values ('00000000-0000-4000-8000-000000000001', 1, payload, encode(extensions.digest(payload::text, 'sha256'), 'hex'), 0)
  on conflict (id) do nothing;
  update portfolio_editorial.draft set base_publication_id = '00000000-0000-4000-8000-000000000001', updated_at = now() where id = 1;
  update portfolio_editorial.site_state set active_publication_id = '00000000-0000-4000-8000-000000000001', updated_at = now() where id = 1;
end $$;
