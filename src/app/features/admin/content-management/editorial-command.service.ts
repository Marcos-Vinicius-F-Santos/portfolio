import { Injectable, inject } from '@angular/core';

import { SUPABASE_CLIENT } from '../../../core/supabase/supabase-client';
import type {
  EditorialCommandReceipt,
  EditorialDraftCommand,
  EditorialPublicationValidation,
  EditorialPublicationReceipt,
  EditorialHistoryItem,
  EditorialDraftV1,
} from './editorial-draft.models';

@Injectable({ providedIn: 'root' })
export class EditorialCommandService {
  private readonly client = inject(SUPABASE_CLIENT);

  async save(
    expectedRevision: number,
    operationId: string,
    command: EditorialDraftCommand,
  ): Promise<EditorialCommandReceipt> {
    if (!this.client) throw new Error('Supabase is not configured');
    const { data, error } =
      command.type === 'set_locale'
        ? await this.client.rpc('set_editor_locale', {
            expected_revision: expectedRevision,
            operation_id: operationId,
            code: command.code,
            label: command.label,
            status: command.status,
            position: command.position,
          })
        : command.type === 'set_section_order'
        ? await this.client.rpc('set_editor_section_order', {
            expected_revision: expectedRevision,
            operation_id: operationId,
            section_ids: [...command.sectionIds],
          })
        : command.type === 'set_technologies'
          ? await this.client.rpc('set_editor_technologies', {
              expected_revision: expectedRevision,
              operation_id: operationId,
              entity_id: command.entityId,
              technology_ids: [...command.technologyIds],
            })
          : await this.client.rpc('save_editor_command', {
              expected_revision: expectedRevision,
              operation_id: operationId,
              command,
            });
    if (error) throw error;
    if (!isReceipt(data)) throw new Error('Invalid editorial command receipt');
    return data;
  }

  async loadDraft(): Promise<EditorialDraftV1> {
    if (!this.client) throw new Error('Supabase is not configured');
    const { data, error } = await this.client.rpc('get_editor_draft');
    if (error) throw error;
    if (!isDraft(data)) throw new Error('Invalid editorial draft');
    return data;
  }

  async validatePublication(expectedRevision: number): Promise<EditorialPublicationValidation> {
    if (!this.client) throw new Error('Supabase is not configured');
    const { data, error } = await this.client.rpc('validate_editor_publication', {
      expected_revision: expectedRevision,
    });
    if (error) throw error;
    if (!isValidation(data)) throw new Error('Invalid editorial publication validation');
    return data;
  }

  async publish(
    expectedRevision: number,
    operationId: string,
    reviewHash: string,
  ): Promise<EditorialPublicationReceipt> {
    if (!this.client) throw new Error('Supabase is not configured');
    const { data, error } = await this.client.rpc('publish_editor_draft', {
      expected_revision: expectedRevision,
      operation_id: operationId,
      review_hash: reviewHash,
    });
    if (error) throw error;
    if (
      !isReceipt(data) ||
      typeof (data as unknown as Record<string, unknown>)['publicationId'] !== 'string'
    )
      throw new Error('Invalid editorial publication receipt');
    return data as unknown as EditorialPublicationReceipt;
  }

  async discard(expectedRevision: number, operationId: string): Promise<EditorialCommandReceipt> {
    if (!this.client) throw new Error('Supabase is not configured');
    const { data, error } = await this.client.rpc('discard_editor_draft', {
      expected_revision: expectedRevision,
      operation_id: operationId,
    });
    if (error) throw error;
    if (!isReceipt(data)) throw new Error('Invalid editorial discard receipt');
    return data;
  }

  async history(): Promise<readonly EditorialHistoryItem[]> {
    if (!this.client) throw new Error('Supabase is not configured');
    const { data, error } = await this.client.rpc('get_editor_history');
    if (error) throw error;
    if (!Array.isArray(data)) throw new Error('Invalid editorial history');
    return data as unknown as readonly EditorialHistoryItem[];
  }
  async createTechnology(expectedRevision: number, operationId: string, id: string, label: string, iconMediaId: string | null): Promise<EditorialCommandReceipt> {
    if (!this.client) throw new Error('Supabase is not configured');
    const { data, error } = await this.client.rpc('create_editorial_technology', {
      expected_revision: expectedRevision, operation_id: operationId, technology_id: id, technology_label: label, icon_media_id: iconMediaId,
    });
    if (error || !isReceipt(data)) throw error ?? new Error('Invalid technology receipt');
    return data;
  }

  async restore(
    publicationId: string,
    expectedRevision: number,
    operationId: string,
  ): Promise<EditorialCommandReceipt> {
    if (!this.client) throw new Error('Supabase is not configured');
    const { data, error } = await this.client.rpc('restore_editor_publication', {
      publication_id: publicationId,
      expected_revision: expectedRevision,
      operation_id: operationId,
    });
    if (error) throw error;
    if (!isReceipt(data)) throw new Error('Invalid editorial restore receipt');
    return data;
  }
}

function isReceipt(value: unknown): value is EditorialCommandReceipt {
  if (!value || typeof value !== 'object') return false;
  const receipt = value as Record<string, unknown>;
  return (
    typeof receipt['operationId'] === 'string' &&
    typeof receipt['revision'] === 'number' &&
    typeof receipt['repeated'] === 'boolean'
  );
}

function isValidation(value: unknown): value is EditorialPublicationValidation {
  if (!value || typeof value !== 'object') return false;
  const result = value as Record<string, unknown>;
  return (
    typeof result['revision'] === 'number' &&
    typeof result['valid'] === 'boolean' &&
    typeof result['reviewHash'] === 'string' &&
    Array.isArray(result['errors']) &&
    typeof result['summary'] === 'object' &&
    result['summary'] !== null
  );
}

function isDraft(value: unknown): value is EditorialDraftV1 {
  if (!value || typeof value !== 'object') return false;
  const draft = value as Record<string, unknown>;
  return (
    draft['formatVersion'] === 1 &&
    Number.isSafeInteger(draft['revision']) &&
    draft['defaultLocale'] === 'pt-BR' &&
    Array.isArray(draft['locales']) &&
    Array.isArray(draft['sections']) &&
    typeof draft['entities'] === 'object' &&
    typeof draft['translations'] === 'object' &&
    typeof draft['technologies'] === 'object' &&
    typeof draft['media'] === 'object'
  );
}
