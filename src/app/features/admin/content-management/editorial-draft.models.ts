import type {
  EditorialSnapshotEntity,
  EditorialSnapshotMedia,
  EditorialSnapshotSection,
  EditorialSnapshotTechnology,
  EditorialSnapshotTranslations,
  EditorialTextDirection,
} from '../../portfolio/content/editorial-snapshot.models';

export type EditorialDraftLocaleStatus = 'preparation' | 'active';

export interface EditorialDraftLocale {
  code: string;
  label: string;
  direction: EditorialTextDirection;
  status: EditorialDraftLocaleStatus;
  position: number;
}

/**
 * Private editable state. Preparation locales live only here and are omitted
 * from a public snapshot until validation and publication succeed.
 */
export interface EditorialDraftV1 {
  formatVersion: 1;
  revision: number;
  basePublicationId: string | null;
  defaultLocale: 'pt-BR';
  locales: readonly EditorialDraftLocale[];
  sections: readonly EditorialSnapshotSection[];
  entities: Readonly<Record<string, EditorialSnapshotEntity>>;
  translations: EditorialSnapshotTranslations;
  technologies: Readonly<Record<string, EditorialSnapshotTechnology>>;
  media: Readonly<Record<string, EditorialSnapshotMedia>>;
}

export type EditorialDraftCommand =
  | {
      type: 'set_locale';
      code: string;
      label: string;
      status: EditorialDraftLocaleStatus;
      position: number;
    }
  | {
      type: 'set_technologies';
      entityId: string;
      technologyIds: readonly string[];
    }
  | { type: 'set_section_order'; sectionIds: readonly string[] }
  | {
      type: 'set_field';
      entityId: string;
      field: string;
      value: string | boolean | null;
    }
  | {
      type: 'set_translation';
      entityId: string;
      locale: string;
      field: string;
      value: string;
    }
  | {
      type: 'add_entity';
      entityId: string;
      kind: EditorialSnapshotEntity['kind'];
      parentId?: string;
      position: number;
      data: Record<string, string | boolean | null>;
      translations: Readonly<Record<string, Readonly<Record<string, string>>>>;
    }
  | { type: 'remove_entity'; entityId: string }
  | {
      type: 'reorder_collection';
      kind: EditorialSnapshotEntity['kind'];
      parentId?: string;
      entityIds: readonly string[];
    };

export interface EditorialCommandReceipt {
  operationId: string;
  revision: number;
  repeated: boolean;
}

export interface EditorialPublicationValidation {
  revision: number;
  valid: boolean;
  reviewHash: string;
  errors: readonly { code: string; path: string; message: string }[];
  summary: {
    added: number;
    removed: number;
    changed: number;
    reordered: number;
    translations: number;
    media: number;
  };
}

export interface EditorialPublicationReceipt extends EditorialCommandReceipt {
  publicationId: string;
}

export interface EditorialHistoryItem {
  publicationId: string;
  sequence: number;
  createdAt: string;
  sourceRevision: number;
  retained: boolean;
  active: boolean;
}
