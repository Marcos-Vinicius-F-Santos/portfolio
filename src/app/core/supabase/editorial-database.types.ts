import type {
  EditorialSnapshotEntity,
  EditorialSnapshotTechnology,
  EditorialSnapshotTranslations,
  EditorialSnapshotV1,
} from '../../features/portfolio/content/editorial-snapshot.models';

export interface EditorialDatabase {
  portfolio_editorial: {
    Tables: {
      draft: EditorialTable<EditorialDraftRow, EditorialDraftInsert, EditorialDraftUpdate>;
      draft_locales: EditorialTable<
        EditorialLocaleRow,
        EditorialLocaleInsert,
        EditorialLocaleUpdate
      >;
      technologies: EditorialTable<
        EditorialTechnologyRow,
        EditorialTechnologyInsert,
        EditorialTechnologyUpdate
      >;
      draft_entities: EditorialTable<
        EditorialEntityRow,
        EditorialEntityInsert,
        EditorialEntityUpdate
      >;
      draft_translations: EditorialTable<
        EditorialTranslationRow,
        EditorialTranslationInsert,
        EditorialTranslationUpdate
      >;
      publications: EditorialTable<EditorialPublicationRow, never, { retained?: boolean }>;
      site_state: EditorialTable<EditorialSiteStateRow, never, EditorialSiteStateUpdate>;
      operations: EditorialTable<EditorialOperationRow, never, never>;
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

interface EditorialTable<Row, Insert, Update> {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: readonly unknown[];
}

export interface EditorialDraftRow {
  id: 1;
  revision: number;
  base_publication_id: string | null;
  default_locale: 'pt-BR';
  updated_at: string;
}
export type EditorialDraftInsert = Partial<EditorialDraftRow> & { id?: 1 };
export type EditorialDraftUpdate = Partial<Omit<EditorialDraftRow, 'id'>>;

export interface EditorialLocaleRow {
  draft_id: 1;
  code: string;
  label: string;
  direction: 'ltr';
  status: 'preparation' | 'active';
  position: number;
}
export type EditorialLocaleInsert = EditorialLocaleRow;
export type EditorialLocaleUpdate = Partial<Omit<EditorialLocaleRow, 'draft_id' | 'code'>>;

export interface EditorialTechnologyRow {
  id: string;
  label: string;
  aliases: string[];
  bundled_asset: string | null;
  license_reference: string | null;
  created_at: string;
  updated_at: string;
}
export type EditorialTechnologyInsert = Omit<EditorialTechnologyRow, 'created_at' | 'updated_at'>;
export type EditorialTechnologyUpdate = Partial<Omit<EditorialTechnologyRow, 'id' | 'created_at'>>;

export interface EditorialEntityRow {
  draft_id: 1;
  id: string;
  kind: EditorialSnapshotEntity['kind'];
  parent_id: string | null;
  position: number;
  data: EditorialSnapshotEntity['data'];
}
export type EditorialEntityInsert = EditorialEntityRow;
export type EditorialEntityUpdate = Partial<Omit<EditorialEntityRow, 'draft_id' | 'id'>>;

export interface EditorialTranslationRow {
  draft_id: 1;
  entity_id: string;
  locale_code: string;
  fields: EditorialSnapshotTranslations[string][string];
}
export type EditorialTranslationInsert = EditorialTranslationRow;
export type EditorialTranslationUpdate = Pick<EditorialTranslationRow, 'fields'>;

export interface EditorialPublicationRow {
  id: string;
  sequence: number;
  format_version: 1;
  snapshot: EditorialSnapshotV1;
  hash: string;
  created_at: string;
  source_revision: number;
  retained: boolean;
}

export interface EditorialSiteStateRow {
  id: 1;
  active_publication_id: string | null;
  editorial_enabled: boolean;
  updated_at: string;
}
export type EditorialSiteStateUpdate = Partial<Omit<EditorialSiteStateRow, 'id'>>;

export interface EditorialOperationRow {
  operation_id: string;
  actor_id: string;
  type: 'draft_command' | 'publication' | 'discard' | 'restore';
  request_hash: string;
  revision: number;
  result: Record<string, unknown>;
  created_at: string;
}

export type EditorialTechnologyPayload = EditorialSnapshotTechnology;
