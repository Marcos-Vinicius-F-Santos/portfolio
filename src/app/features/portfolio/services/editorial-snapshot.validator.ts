import {
  EDITORIAL_SNAPSHOT_FORMAT_VERSION,
  type EditorialEntityKind,
  type EditorialSectionKind,
  type EditorialSnapshotV1,
} from './editorial-snapshot.models';

export type EditorialSnapshotValidationCode =
  | 'invalid_type'
  | 'unknown_format_version'
  | 'unknown_field'
  | 'invalid_value'
  | 'duplicate_id'
  | 'missing_reference'
  | 'incomplete_locale';

export interface EditorialSnapshotValidationIssue {
  code: EditorialSnapshotValidationCode;
  path: string;
  message: string;
}

export type EditorialSnapshotValidationResult =
  | { valid: true; snapshot: EditorialSnapshotV1; issues: readonly [] }
  | { valid: false; issues: readonly EditorialSnapshotValidationIssue[] };

const ROOT_FIELDS = [
  'formatVersion',
  'publicationId',
  'createdAt',
  'defaultLocale',
  'locales',
  'sections',
  'entities',
  'translations',
  'technologies',
  'media',
] as const;
const LOCALE_FIELDS = ['code', 'label', 'direction', 'position'] as const;
const SECTION_FIELDS = ['id', 'kind', 'position'] as const;
const ENTITY_FIELDS = ['kind', 'parentId', 'position', 'data'] as const;
const TECHNOLOGY_FIELDS = ['label', 'iconMediaId', 'aliases'] as const;
const MEDIA_FIELDS = ['source', 'mime', 'bytes', 'assetPath'] as const;
const SECTION_KINDS: readonly EditorialSectionKind[] = [
  'presentation',
  'about',
  'results',
  'experiences',
  'skills',
  'education',
  'projects',
  'contact',
];
const ENTITY_KINDS: readonly EditorialEntityKind[] = [
  'presentation',
  'about',
  'result',
  'experience',
  'skillCategory',
  'skill',
  'academic',
  'project',
  'contact',
  'projectLink',
  'projectImage',
  'curriculum',
  'interfaceText',
  'listItem',
];

const ENTITY_DATA_FIELDS: Readonly<Record<EditorialEntityKind, readonly string[]>> = {
  presentation: [],
  about: [],
  result: [],
  experience: ['startDate', 'endDate'],
  skillCategory: [],
  skill: ['technologyId', 'iconMediaId'],
  academic: ['startDate', 'endDate', 'isCurrent'],
  project: ['type', 'technologyIds'],
  contact: ['symbol', 'href'],
  projectLink: ['href'],
  projectImage: ['mediaId'],
  curriculum: ['mediaId', 'localeCode'],
  interfaceText: ['key'],
  listItem: ['collection'],
};

const TRANSLATION_FIELDS: Readonly<Record<EditorialEntityKind, readonly string[]>> = {
  presentation: ['eyebrow', 'title', 'displayName', 'summary'],
  about: ['title', 'body'],
  result: ['title', 'description', 'value'],
  experience: ['title', 'context', 'responsibilities', 'technicalDecisions', 'results'],
  skillCategory: ['label'],
  skill: ['name'],
  academic: ['name', 'institution', 'competencies', 'studiedContent'],
  project: [
    'name',
    'description',
    'problemContext',
    'solution',
    'role',
    'technicalDecisions',
    'results',
    'learnings',
  ],
  contact: ['label'],
  projectLink: ['label'],
  projectImage: ['alt'],
  curriculum: ['label'],
  interfaceText: ['text'],
  listItem: ['text'],
};

const REQUIRED_TRANSLATION_FIELDS: Readonly<Record<EditorialEntityKind, readonly string[]>> = {
  presentation: ['title', 'displayName', 'summary'],
  about: ['title', 'body'],
  result: ['title', 'value'],
  experience: ['title', 'context'],
  skillCategory: ['label'],
  skill: ['name'],
  academic: ['name', 'institution'],
  project: ['name', 'description', 'problemContext'],
  contact: ['label'],
  projectLink: ['label'],
  projectImage: ['alt'],
  curriculum: ['label'],
  interfaceText: ['text'],
  listItem: ['text'],
};

const ID_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/;
const LOCALE_PATTERN = /^[a-z]{2,3}(?:-[A-Z]{2})?$/;
const SAFE_MIME_PATTERN = /^[a-z0-9][a-z0-9.+-]*\/[a-z0-9][a-z0-9.+-]*$/i;
const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function validateEditorialSnapshot(input: unknown): EditorialSnapshotValidationResult {
  const issues: EditorialSnapshotValidationIssue[] = [];
  if (!isRecord(input)) {
    add(issues, 'invalid_type', '$', 'O snapshot deve ser um objeto.');
    return { valid: false, issues };
  }

  rejectUnknownFields(input, ROOT_FIELDS, '$', issues);
  if (input['formatVersion'] !== EDITORIAL_SNAPSHOT_FORMAT_VERSION) {
    add(
      issues,
      'unknown_format_version',
      '$.formatVersion',
      `Somente formatVersion ${EDITORIAL_SNAPSHOT_FORMAT_VERSION} é aceito.`,
    );
  }
  requireId(input['publicationId'], '$.publicationId', issues);
  if (typeof input['createdAt'] !== 'string' || Number.isNaN(Date.parse(input['createdAt']))) {
    add(issues, 'invalid_value', '$.createdAt', 'createdAt deve ser uma data ISO válida.');
  }
  if (input['defaultLocale'] !== 'pt-BR') {
    add(issues, 'invalid_value', '$.defaultLocale', 'O idioma padrão deve ser pt-BR.');
  }

  const locales = validateLocales(input['locales'], issues);
  validateSections(input['sections'], issues);
  const entities = validateEntities(input['entities'], issues);
  const mediaIds = validateMedia(input['media'], issues);
  const technologyIds = validateTechnologies(input['technologies'], mediaIds, issues);
  validateTranslations(input['translations'], locales, entities, issues);
  validateEntityReferences(entities, mediaIds, technologyIds, locales, issues);

  if (issues.length > 0) return { valid: false, issues };
  return { valid: true, snapshot: input as unknown as EditorialSnapshotV1, issues: [] };
}

function validateLocales(value: unknown, issues: EditorialSnapshotValidationIssue[]): Set<string> {
  const result = new Set<string>();
  if (!Array.isArray(value) || value.length === 0) {
    add(issues, 'invalid_type', '$.locales', 'O snapshot deve ter ao menos um idioma ativo.');
    return result;
  }
  value.forEach((item, index) => {
    const path = `$.locales[${index}]`;
    if (!isRecord(item)) return add(issues, 'invalid_type', path, 'Idioma inválido.');
    rejectUnknownFields(item, LOCALE_FIELDS, path, issues);
    const code = item['code'];
    if (typeof code !== 'string' || !LOCALE_PATTERN.test(code)) {
      add(issues, 'invalid_value', `${path}.code`, 'Código de idioma inválido.');
    } else if (result.has(code)) {
      add(issues, 'duplicate_id', `${path}.code`, `Idioma duplicado: ${code}.`);
    } else {
      result.add(code);
    }
    requireNonEmptyText(item['label'], `${path}.label`, issues);
    if (item['direction'] !== 'ltr') {
      add(issues, 'invalid_value', `${path}.direction`, 'Somente direção ltr é aceita na v1.');
    }
    requirePosition(item['position'], `${path}.position`, issues);
  });
  if (!result.has('pt-BR')) {
    add(issues, 'incomplete_locale', '$.locales', 'PT-BR é obrigatório no snapshot público.');
  }
  return result;
}

function validateSections(value: unknown, issues: EditorialSnapshotValidationIssue[]): void {
  if (!Array.isArray(value)) {
    add(issues, 'invalid_type', '$.sections', 'sections deve ser uma lista.');
    return;
  }
  const ids = new Set<string>();
  value.forEach((item, index) => {
    const path = `$.sections[${index}]`;
    if (!isRecord(item)) return add(issues, 'invalid_type', path, 'Seção inválida.');
    rejectUnknownFields(item, SECTION_FIELDS, path, issues);
    const id = requireId(item['id'], `${path}.id`, issues);
    if (id && ids.has(id)) add(issues, 'duplicate_id', `${path}.id`, `Seção duplicada: ${id}.`);
    if (id) ids.add(id);
    if (!SECTION_KINDS.includes(item['kind'] as EditorialSectionKind)) {
      add(issues, 'invalid_value', `${path}.kind`, 'Tipo de seção desconhecido.');
    }
    requirePosition(item['position'], `${path}.position`, issues);
  });
}

function validateEntities(
  value: unknown,
  issues: EditorialSnapshotValidationIssue[],
): Map<string, { kind: EditorialEntityKind; value: Record<string, unknown> }> {
  const result = new Map<string, { kind: EditorialEntityKind; value: Record<string, unknown> }>();
  if (!isRecord(value)) {
    add(issues, 'invalid_type', '$.entities', 'entities deve ser um mapa por ID.');
    return result;
  }
  for (const [id, entity] of Object.entries(value)) {
    const path = `$.entities.${id}`;
    if (!ID_PATTERN.test(id)) {
      add(issues, 'invalid_value', path, `ID de entidade inválido: ${id}.`);
      continue;
    }
    if (!isRecord(entity)) {
      add(issues, 'invalid_type', path, 'Entidade inválida.');
      continue;
    }
    rejectUnknownFields(entity, ENTITY_FIELDS, path, issues);
    const kind = entity['kind'];
    if (!ENTITY_KINDS.includes(kind as EditorialEntityKind)) {
      add(issues, 'invalid_value', `${path}.kind`, 'Tipo de entidade desconhecido.');
      continue;
    }
    if (entity['parentId'] !== undefined) requireId(entity['parentId'], `${path}.parentId`, issues);
    requirePosition(entity['position'], `${path}.position`, issues);
    if (!isRecord(entity['data'])) {
      add(issues, 'invalid_type', `${path}.data`, 'data deve ser um objeto.');
      continue;
    }
    const typedKind = kind as EditorialEntityKind;
    rejectUnknownFields(entity['data'], ENTITY_DATA_FIELDS[typedKind], `${path}.data`, issues);
    validateEntityData(typedKind, entity['data'], `${path}.data`, issues);
    result.set(id, { kind: typedKind, value: entity });
  }
  return result;
}

function validateEntityData(
  kind: EditorialEntityKind,
  data: Record<string, unknown>,
  path: string,
  issues: EditorialSnapshotValidationIssue[],
): void {
  for (const dateField of ['startDate', 'endDate']) {
    const value = data[dateField];
    if (
      value !== undefined &&
      value !== null &&
      (typeof value !== 'string' || !ISO_DATE_PATTERN.test(value))
    ) {
      add(issues, 'invalid_value', `${path}.${dateField}`, 'Data deve usar YYYY-MM-DD.');
    }
  }
  for (const field of ['technologyId', 'iconMediaId', 'mediaId', 'localeCode']) {
    if (data[field] !== undefined) requireId(data[field], `${path}.${field}`, issues);
  }
  if (kind === 'academic' && typeof data['isCurrent'] !== 'boolean') {
    add(issues, 'invalid_type', `${path}.isCurrent`, 'isCurrent deve ser booleano.');
  }
  if (kind === 'project' && data['type'] !== 'professional' && data['type'] !== 'personal') {
    add(issues, 'invalid_value', `${path}.type`, 'Projeto deve ser professional ou personal.');
  }
  if (
    kind === 'project' &&
    (!Array.isArray(data['technologyIds']) || !data['technologyIds'].every(isNonEmptyText))
  ) {
    add(issues, 'invalid_type', `${path}.technologyIds`, 'technologyIds deve conter IDs.');
  }
  if (kind === 'contact' || kind === 'projectLink') {
    validateSafeUrl(data['href'], `${path}.href`, issues);
  }
  if (kind === 'interfaceText') requireId(data['key'], `${path}.key`, issues);
  if (kind === 'listItem') requireId(data['collection'], `${path}.collection`, issues);
}

function validateMedia(value: unknown, issues: EditorialSnapshotValidationIssue[]): Set<string> {
  const ids = new Set<string>();
  if (!isRecord(value)) {
    add(issues, 'invalid_type', '$.media', 'media deve ser um mapa por ID.');
    return ids;
  }
  for (const [id, media] of Object.entries(value)) {
    const path = `$.media.${id}`;
    if (!ID_PATTERN.test(id)) add(issues, 'invalid_value', path, `ID de mídia inválido: ${id}.`);
    else ids.add(id);
    if (!isRecord(media)) {
      add(issues, 'invalid_type', path, 'Mídia inválida.');
      continue;
    }
    rejectUnknownFields(media, MEDIA_FIELDS, path, issues);
    if (!['managed', 'legacy_public', 'bundled', 'external'].includes(String(media['source']))) {
      add(issues, 'invalid_value', `${path}.source`, 'Origem de mídia desconhecida.');
    }
    if (typeof media['mime'] !== 'string' || !SAFE_MIME_PATTERN.test(media['mime'])) {
      add(issues, 'invalid_value', `${path}.mime`, 'MIME inválido.');
    }
    if (!Number.isSafeInteger(media['bytes']) || Number(media['bytes']) < 0) {
      add(issues, 'invalid_value', `${path}.bytes`, 'bytes deve ser inteiro não negativo.');
    }
    if (media['assetPath'] !== undefined)
      validateSafeAssetPath(media['assetPath'], `${path}.assetPath`, issues);
  }
  return ids;
}

function validateTechnologies(
  value: unknown,
  mediaIds: Set<string>,
  issues: EditorialSnapshotValidationIssue[],
): Set<string> {
  const ids = new Set<string>();
  if (!isRecord(value)) {
    add(issues, 'invalid_type', '$.technologies', 'technologies deve ser um mapa por ID.');
    return ids;
  }
  for (const [id, technology] of Object.entries(value)) {
    const path = `$.technologies.${id}`;
    if (!ID_PATTERN.test(id))
      add(issues, 'invalid_value', path, `ID de tecnologia inválido: ${id}.`);
    else ids.add(id);
    if (!isRecord(technology)) {
      add(issues, 'invalid_type', path, 'Tecnologia inválida.');
      continue;
    }
    rejectUnknownFields(technology, TECHNOLOGY_FIELDS, path, issues);
    requireNonEmptyText(technology['label'], `${path}.label`, issues);
    if (!Array.isArray(technology['aliases']) || !technology['aliases'].every(isNonEmptyText)) {
      add(issues, 'invalid_type', `${path}.aliases`, 'aliases deve conter apenas textos.');
    }
    const iconMediaId = technology['iconMediaId'];
    if (iconMediaId !== undefined) {
      const reference = requireId(iconMediaId, `${path}.iconMediaId`, issues);
      if (reference && !mediaIds.has(reference)) {
        add(issues, 'missing_reference', `${path}.iconMediaId`, `Mídia inexistente: ${reference}.`);
      }
    }
  }
  return ids;
}

function validateTranslations(
  value: unknown,
  locales: Set<string>,
  entities: Map<string, { kind: EditorialEntityKind; value: Record<string, unknown> }>,
  issues: EditorialSnapshotValidationIssue[],
): void {
  if (!isRecord(value)) {
    add(issues, 'invalid_type', '$.translations', 'translations deve ser um mapa por idioma.');
    return;
  }
  for (const locale of Object.keys(value)) {
    if (!locales.has(locale)) {
      add(
        issues,
        'missing_reference',
        `$.translations.${locale}`,
        `Idioma não está ativo: ${locale}.`,
      );
    }
  }
  for (const locale of locales) {
    const localeTranslations = value[locale];
    if (!isRecord(localeTranslations)) {
      add(
        issues,
        'incomplete_locale',
        `$.translations.${locale}`,
        `Traduções ausentes para ${locale}.`,
      );
      continue;
    }
    for (const entityId of Object.keys(localeTranslations)) {
      if (!entities.has(entityId)) {
        add(
          issues,
          'missing_reference',
          `$.translations.${locale}.${entityId}`,
          `Entidade inexistente: ${entityId}.`,
        );
      }
    }
    for (const [entityId, entity] of entities) {
      const translation = localeTranslations[entityId];
      const path = `$.translations.${locale}.${entityId}`;
      if (!isRecord(translation)) {
        add(issues, 'incomplete_locale', path, `Tradução obrigatória ausente para ${entityId}.`);
        continue;
      }
      rejectUnknownFields(translation, TRANSLATION_FIELDS[entity.kind], path, issues);
      for (const [field, text] of Object.entries(translation)) {
        requireSafeText(text, `${path}.${field}`, issues);
      }
      for (const field of REQUIRED_TRANSLATION_FIELDS[entity.kind]) {
        if (!isNonEmptyText(translation[field])) {
          add(
            issues,
            'incomplete_locale',
            `${path}.${field}`,
            `Campo obrigatório ausente em ${locale}.`,
          );
        }
      }
    }
  }
}

function validateEntityReferences(
  entities: Map<string, { kind: EditorialEntityKind; value: Record<string, unknown> }>,
  mediaIds: Set<string>,
  technologyIds: Set<string>,
  locales: Set<string>,
  issues: EditorialSnapshotValidationIssue[],
): void {
  for (const [id, entity] of entities) {
    const path = `$.entities.${id}`;
    const parentId = entity.value['parentId'];
    if (typeof parentId === 'string' && !entities.has(parentId)) {
      add(
        issues,
        'missing_reference',
        `${path}.parentId`,
        `Entidade pai inexistente: ${parentId}.`,
      );
    }
    const data = entity.value['data'];
    if (!isRecord(data)) continue;
    for (const field of ['iconMediaId', 'mediaId']) {
      const mediaId = data[field];
      if (typeof mediaId === 'string' && !mediaIds.has(mediaId)) {
        add(issues, 'missing_reference', `${path}.data.${field}`, `Mídia inexistente: ${mediaId}.`);
      }
    }
    const localeCode = data['localeCode'];
    if (typeof localeCode === 'string' && !locales.has(localeCode)) {
      add(
        issues,
        'missing_reference',
        `${path}.data.localeCode`,
        `Idioma inexistente: ${localeCode}.`,
      );
    }
    const references = entity.kind === 'skill' ? [data['technologyId']] : data['technologyIds'];
    if (Array.isArray(references)) {
      for (const technologyId of references) {
        if (typeof technologyId === 'string' && !technologyIds.has(technologyId)) {
          add(
            issues,
            'missing_reference',
            `${path}.data.technologyIds`,
            `Tecnologia inexistente: ${technologyId}.`,
          );
        }
      }
    }
  }
}

function rejectUnknownFields(
  value: Record<string, unknown>,
  allowed: readonly string[],
  path: string,
  issues: EditorialSnapshotValidationIssue[],
): void {
  for (const field of Object.keys(value)) {
    if (!allowed.includes(field)) {
      add(
        issues,
        'unknown_field',
        `${path}.${field}`,
        `Campo não público ou desconhecido: ${field}.`,
      );
    }
  }
}

function requireId(
  value: unknown,
  path: string,
  issues: EditorialSnapshotValidationIssue[],
): string | undefined {
  if (typeof value !== 'string' || !ID_PATTERN.test(value)) {
    add(issues, 'invalid_value', path, 'ID estável inválido.');
    return undefined;
  }
  return value;
}

function requirePosition(
  value: unknown,
  path: string,
  issues: EditorialSnapshotValidationIssue[],
): void {
  if (!Number.isSafeInteger(value) || Number(value) < 0) {
    add(issues, 'invalid_value', path, 'Posição deve ser um inteiro não negativo.');
  }
}

function requireNonEmptyText(
  value: unknown,
  path: string,
  issues: EditorialSnapshotValidationIssue[],
): void {
  requireSafeText(value, path, issues, true);
}

function requireSafeText(
  value: unknown,
  path: string,
  issues: EditorialSnapshotValidationIssue[],
  nonEmpty = false,
): void {
  if (typeof value !== 'string' || (nonEmpty && value.trim().length === 0)) {
    add(issues, 'invalid_type', path, 'O valor deve ser texto simples.');
    return;
  }
  if (
    /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/.test(value) ||
    /<\/?[a-z][^>]*>/i.test(value)
  ) {
    add(
      issues,
      'invalid_value',
      path,
      'HTML, script ou caracteres de controle não são permitidos.',
    );
  }
}

function validateSafeUrl(
  value: unknown,
  path: string,
  issues: EditorialSnapshotValidationIssue[],
): void {
  if (typeof value !== 'string') {
    add(issues, 'invalid_type', path, 'URL deve ser texto.');
    return;
  }
  try {
    const url = new URL(value);
    if (!['https:', 'mailto:', 'tel:'].includes(url.protocol)) throw new Error('protocol');
  } catch {
    add(issues, 'invalid_value', path, 'URL deve usar https, mailto ou tel.');
  }
}

function validateSafeAssetPath(
  value: unknown,
  path: string,
  issues: EditorialSnapshotValidationIssue[],
): void {
  if (
    typeof value !== 'string' ||
    (!value.startsWith('/assets/') && !value.startsWith('https://')) ||
    /(?:javascript:|data:)/i.test(value)
  ) {
    add(issues, 'invalid_value', path, 'Caminho público de mídia inválido.');
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isNonEmptyText(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function add(
  issues: EditorialSnapshotValidationIssue[],
  code: EditorialSnapshotValidationCode,
  path: string,
  message: string,
): void {
  issues.push({ code, path, message });
}
