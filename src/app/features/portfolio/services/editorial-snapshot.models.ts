export const EDITORIAL_SNAPSHOT_FORMAT_VERSION = 1 as const;

export type EditorialSnapshotFormatVersion = typeof EDITORIAL_SNAPSHOT_FORMAT_VERSION;
export type EditorialTextDirection = 'ltr';
export type EditorialSectionKind =
  | 'presentation'
  | 'about'
  | 'results'
  | 'experiences'
  | 'skills'
  | 'education'
  | 'projects'
  | 'contact';

export type EditorialEntityKind =
  | 'presentation'
  | 'about'
  | 'result'
  | 'experience'
  | 'skillCategory'
  | 'skill'
  | 'academic'
  | 'project'
  | 'contact'
  | 'projectLink'
  | 'projectImage'
  | 'curriculum'
  | 'interfaceText'
  | 'listItem';

export type EditorialMediaSource = 'managed' | 'legacy_public' | 'bundled' | 'external';

export interface EditorialSnapshotLocale {
  code: string;
  label: string;
  direction: EditorialTextDirection;
  position: number;
}

export interface EditorialSnapshotSection {
  id: string;
  kind: EditorialSectionKind;
  position: number;
}

export interface EditorialSnapshotEntity {
  kind: EditorialEntityKind;
  parentId?: string;
  position: number;
  data: Readonly<Record<string, unknown>>;
}

export interface EditorialSnapshotTechnology {
  label: string;
  iconMediaId?: string;
  aliases: readonly string[];
}

export interface EditorialSnapshotMedia {
  source: EditorialMediaSource;
  mime: string;
  bytes: number;
  assetPath?: string;
}

export type EditorialSnapshotTranslation = Readonly<Record<string, string>>;
export type EditorialSnapshotTranslations = Readonly<
  Record<string, Readonly<Record<string, EditorialSnapshotTranslation>>>
>;

/**
 * Public, immutable payload approved by ADR-008. It intentionally contains no
 * draft revision, actor, operation receipt, storage bucket or signed URL.
 */
export interface EditorialSnapshotV1 {
  formatVersion: EditorialSnapshotFormatVersion;
  publicationId: string;
  createdAt: string;
  defaultLocale: 'pt-BR';
  locales: readonly EditorialSnapshotLocale[];
  sections: readonly EditorialSnapshotSection[];
  entities: Readonly<Record<string, EditorialSnapshotEntity>>;
  translations: EditorialSnapshotTranslations;
  technologies: Readonly<Record<string, EditorialSnapshotTechnology>>;
  media: Readonly<Record<string, EditorialSnapshotMedia>>;
}
