import { Injectable, inject, signal } from '@angular/core';
import { SUPABASE_CLIENT } from '../../../core/supabase/supabase-client';
import type { EditorialSnapshotV1 } from './editorial-snapshot.models';
import { validateEditorialSnapshot } from './editorial-snapshot.validator';

export class PublishedVersionExpiredError extends Error {}

@Injectable({ providedIn: 'root' })
export class PublishedSnapshotService {
  private readonly client = inject(SUPABASE_CLIENT);
  private readonly snapshotState = signal<EditorialSnapshotV1 | null>(null);
  readonly snapshot = this.snapshotState.asReadonly();

  async load(): Promise<EditorialSnapshotV1> {
    const fixed = this.snapshotState();
    if (fixed) return fixed;
    return this.fetch(null);
  }

  async loadFixed(publicationId: string): Promise<EditorialSnapshotV1> {
    const fixed = this.snapshotState();
    if (fixed?.publicationId === publicationId) return fixed;
    return this.fetch(publicationId);
  }

  clear(): void { this.snapshotState.set(null); }

  private async fetch(publicationId: string | null): Promise<EditorialSnapshotV1> {
    if (!this.client) throw new Error('Supabase is not configured');
    const { data, error } = await this.client.rpc('get_published_snapshot', { publication_id: publicationId });
    if (error) {
      if (error.code === 'P0002' || error.message?.includes('VERSION_EXPIRED'))
        throw new PublishedVersionExpiredError('A versão navegada expirou; recarregue a página.');
      throw error;
    }
    const validation = validateEditorialSnapshot(data);
    if (!validation.valid) throw new Error('Invalid published snapshot');
    this.snapshotState.set(validation.snapshot);
    return validation.snapshot;
  }
}
