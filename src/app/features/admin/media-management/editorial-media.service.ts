import { Injectable, inject } from '@angular/core';
import { SUPABASE_CLIENT } from '../../../core/supabase/supabase-client';
import {
  validateEditorialUpload,
  type EditorialMediaPurpose,
  type EditorialMediaReservation,
} from './editorial-media.models';

@Injectable({ providedIn: 'root' })
export class EditorialMediaService {
  private readonly client = inject(SUPABASE_CLIENT);

  async upload(
    expectedRevision: number,
    purpose: EditorialMediaPurpose,
    file: File,
  ): Promise<EditorialMediaReservation> {
    if (!validateEditorialUpload(purpose, file.type, file.size))
      throw new Error('Invalid editorial media');
    if (!this.client) throw new Error('Supabase is not configured');
    const { data, error } = await this.client.rpc('reserve_editorial_media', {
      expected_revision: expectedRevision,
      purpose,
      original_name: file.name,
      mime: file.type,
      bytes: file.size,
    });
    if (error || !Array.isArray(data) || !data[0])
      throw error ?? new Error('Media reservation failed');
    const reservation = data[0] as { media_id: string; bucket: string; path: string };
    const { error: uploadError } = await this.client.storage
      .from(reservation.bucket)
      .upload(reservation.path, file, {
        cacheControl: '3600',
        contentType: file.type,
        upsert: false,
      });
    if (uploadError) throw uploadError;
    if (file.type === 'image/svg+xml' && purpose === 'skill_icon') {
      const { error: validationError } = await this.client.functions.invoke('validate-editorial-svg', {
        body: { media_id: reservation.media_id, expected_revision: expectedRevision },
      });
      if (validationError) throw validationError;
    } else {
      const { error: finalizeError } = await this.client.rpc('finalize_editorial_media', {
        expected_revision: expectedRevision,
        media_id: reservation.media_id,
      });
      if (finalizeError) throw finalizeError;
    }
    return {
      mediaId: reservation.media_id,
      bucket: reservation.bucket,
      path: reservation.path,
      expectedRevision,
    };
  }

  async associate(expectedRevision: number, entityId: string, mediaId: string, field = 'projectImage', position = 0): Promise<void> {
    if (!this.client) throw new Error('Supabase is not configured');
    const { error } = await this.client.rpc('associate_editorial_media', {
      expected_revision: expectedRevision,
      operation_id: crypto.randomUUID(),
      entity_id: entityId,
      media_id: mediaId,
      field_name: field,
      media_position: position,
    });
    if (error) throw error;
  }
}
