import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const inventoryPath = resolve(
  root,
  'spec/05-verificacao/edicao-visual-rascunho-publicacao/inventario-2026-09-26.json',
);
const outputPath = resolve(
  root,
  'spec/05-verificacao/edicao-visual-rascunho-publicacao/initial-editorial-snapshot-v1.json',
);
const migrationPath = resolve(
  root,
  'supabase/migrations/20260926103000_import_initial_editorial_snapshot.sql',
);
const inventory = JSON.parse(await readFile(inventoryPath, 'utf8'));
const entities = {};
const translations = { 'pt-BR': {}, en: {} };
const technologies = {};
const media = {};

const normalizeTechnology = (value) =>
  value
    .trim()
    .toLowerCase()
    .replace(/\s+\d.*$/, '');
const technologyIds = new Map();
for (const category of inventory.localFallbacks.skills) {
  for (const skill of category.skills) technologyIds.set(normalizeTechnology(skill.name), skill.id);
}
function technologyId(label) {
  const normalized = normalizeTechnology(label);
  const existing = technologyIds.get(normalized);
  if (existing) {
    const aliases = new Set(technologies[existing]?.aliases ?? []);
    if (label !== technologies[existing]?.label) aliases.add(label);
    technologies[existing] ??= { label: label.replace(/\s+\d.*$/, ''), aliases: [] };
    technologies[existing].aliases = [...aliases];
    return existing;
  }
  const id = normalized.replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  technologyIds.set(normalized, id);
  technologies[id] = { label, aliases: [] };
  return id;
}

function add(id, kind, position, data, pt, en = pt, parentId) {
  entities[id] = { kind, ...(parentId ? { parentId } : {}), position, data };
  translations['pt-BR'][id] = pt;
  translations.en[id] = en;
}
function addLists(parentId, groups, englishGroups = {}) {
  let position = 0;
  for (const [collection, values] of Object.entries(groups)) {
    const english = englishGroups[collection] ?? values;
    values.forEach((text, index) =>
      add(
        `${parentId}-${collection}-${index + 1}`,
        'listItem',
        position++,
        { collection },
        { text },
        { text: english[index] ?? text },
        parentId,
      ),
    );
  }
}

const local = inventory.localFallbacks;
Object.keys(local.original).forEach((key, position) =>
  add(
    `copy-${key}`,
    'interfaceText',
    position,
    { key },
    { text: local.original[key] },
    { text: local.english[key] ?? local.original[key] },
  ),
);

const expTranslations = Object.groupBy(
  inventory.publicContent.experience_translations,
  (row) => row.experience_id,
);
inventory.publicContent.experiences.forEach((row, position) => {
  const byLocale = Object.fromEntries(expTranslations[row.id].map((item) => [item.locale, item]));
  const pt = byLocale['pt-BR'];
  const en = byLocale.en ?? pt;
  add(
    row.id,
    'experience',
    position,
    { startDate: row.start_date, endDate: row.end_date },
    { title: pt.title, context: pt.context },
    { title: en.title, context: en.context },
  );
  addLists(
    row.id,
    {
      responsibilities: pt.responsibilities,
      technicalDecisions: pt.technical_decisions,
      results: pt.results,
    },
    {
      responsibilities: en.responsibilities,
      technicalDecisions: en.technical_decisions,
      results: en.results,
    },
  );
});

const projectTranslations = Object.groupBy(
  inventory.publicContent.project_translations,
  (row) => row.project_id,
);
inventory.publicContent.projects.forEach((row, position) => {
  const byLocale = Object.fromEntries(
    projectTranslations[row.id].map((item) => [item.locale, item]),
  );
  const pt = byLocale['pt-BR'];
  const en = byLocale.en ?? pt;
  add(
    row.id,
    'project',
    position,
    { type: row.project_type, technologyIds: pt.technologies.map(technologyId) },
    {
      name: pt.name,
      description: pt.description,
      problemContext: pt.problem_context,
      solution: pt.solution,
      role: pt.role,
    },
    {
      name: en.name,
      description: en.description,
      problemContext: en.problem_context,
      solution: en.solution,
      role: en.role,
    },
  );
  addLists(
    row.id,
    { technicalDecisions: pt.technical_decisions, results: pt.results, learnings: pt.learnings },
    { technicalDecisions: en.technical_decisions, results: en.results, learnings: en.learnings },
  );
  pt.links.forEach((link, index) =>
    add(
      `${row.id}-link-${index + 1}`,
      'projectLink',
      index,
      { href: link.url },
      { label: link.label },
      { label: en.links[index]?.label ?? link.label },
      row.id,
    ),
  );
});

local.skills.forEach((category, categoryPosition) => {
  add(
    category.id,
    'skillCategory',
    categoryPosition,
    {},
    { label: local.original[category.labelKey] },
    { label: local.english[category.labelKey] },
  );
  category.skills.forEach((skill, position) => {
    const mediaId = skill.iconUrl ? `asset-${skill.id}` : undefined;
    add(
      `skill-${skill.id}`,
      'skill',
      position,
      { technologyId: skill.id, ...(mediaId ? { iconMediaId: mediaId } : {}) },
      { name: skill.name },
      { name: skill.name },
      category.id,
    );
    const existingTechnology = technologies[skill.id];
    technologies[skill.id] = {
      label: skill.name,
      ...(mediaId ? { iconMediaId: mediaId } : {}),
      aliases: existingTechnology?.aliases ?? [],
    };
    if (mediaId) {
      const asset = local.assets.find((item) => `/assets/skills/${item.name}` === skill.iconUrl);
      media[mediaId] = {
        source: 'bundled',
        mime: 'image/png',
        bytes: asset?.bytes ?? 1,
        assetPath: skill.iconUrl,
      };
    }
  });
});

local.academic.forEach((item, position) => {
  add(
    item.id,
    'academic',
    position,
    { startDate: item.startDate, endDate: item.endDate, isCurrent: item.isCurrent },
    { name: local.original[item.nameKey], institution: item.institution },
    { name: local.english[item.nameKey], institution: item.institution },
  );
  addLists(item.id, { competencies: item.competencies, studiedContent: item.studiedContent });
});
local.contacts.forEach((item, position) =>
  add(
    item.id,
    'contact',
    position,
    { symbol: item.symbol, href: item.href },
    { label: local.original[item.labelKey] },
    { label: local.english[item.labelKey] },
  ),
);

const snapshot = {
  formatVersion: 1,
  publicationId: '00000000-0000-4000-8000-000000000001',
  createdAt: '2026-09-26T12:00:00.000Z',
  defaultLocale: 'pt-BR',
  locales: [
    { code: 'pt-BR', label: 'Português', direction: 'ltr', position: 0 },
    { code: 'en', label: 'English', direction: 'ltr', position: 1 },
  ],
  sections: [
    'presentation',
    'about',
    'results',
    'experiences',
    'projects',
    'skills',
    'education',
    'contact',
  ].map((kind, position) => ({ id: `${kind}-section`, kind, position })),
  entities,
  translations,
  technologies,
  media,
};
const compact = JSON.stringify(snapshot);
const hash = createHash('sha256').update(compact).digest('hex');
await writeFile(outputPath, JSON.stringify(snapshot, null, 2) + '\n');
const literal = compact.replaceAll("'", "''");
const sql =
  `-- Generated by scripts/generate-initial-editorial-snapshot.mjs. Idempotent T-007 import.\n` +
  `do $$ declare payload jsonb := '${literal}'::jsonb; begin\n` +
  `insert into portfolio_editorial.draft_locales(draft_id,code,label,direction,status,position) values (1,'en','English','ltr','active',1) on conflict(draft_id,code) do update set label=excluded.label,status=excluded.status,position=excluded.position;\n` +
  `insert into portfolio_editorial.draft_entities(draft_id,id,kind,parent_id,position,data) select 1,e.key,e.value->>'kind',nullif(e.value->>'parentId',''),(e.value->>'position')::int,e.value->'data' from jsonb_each(payload->'entities') e on conflict(draft_id,id) do update set kind=excluded.kind,parent_id=excluded.parent_id,position=excluded.position,data=excluded.data;\n` +
  `insert into portfolio_editorial.draft_translations(draft_id,entity_id,locale_code,fields) select 1,e.key,l.key,l.value->e.key from jsonb_each(payload->'entities') e cross join jsonb_each(payload->'translations') l on conflict(draft_id,entity_id,locale_code) do update set fields=excluded.fields;\n` +
  `insert into portfolio_editorial.technologies(id,label,aliases,bundled_asset) select t.key,t.value->>'label',array(select jsonb_array_elements_text(t.value->'aliases')),case when t.value ? 'iconMediaId' then payload->'media'->(t.value->>'iconMediaId')->>'assetPath' end from jsonb_each(payload->'technologies') t on conflict(id) do update set label=excluded.label,aliases=excluded.aliases,bundled_asset=excluded.bundled_asset;\n` +
  `insert into portfolio_editorial.publications(id,format_version,snapshot,hash,source_revision) values ('${snapshot.publicationId}',1,payload,'${hash}',0) on conflict(id) do nothing;\n` +
  `update portfolio_editorial.draft set base_publication_id='${snapshot.publicationId}',updated_at=now() where id=1; update portfolio_editorial.site_state set active_publication_id='${snapshot.publicationId}',updated_at=now() where id=1; end $$;\n`;
await writeFile(migrationPath, sql);
console.log(
  JSON.stringify({
    entities: Object.keys(entities).length,
    technologies: Object.keys(technologies).length,
    media: Object.keys(media).length,
    hash,
  }),
);
