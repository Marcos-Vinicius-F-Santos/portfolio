import { Injectable, inject } from '@angular/core';
import { SUPABASE_CLIENT } from '../../../core/supabase/supabase-client';

const SIGNED_URL_TTL_SECONDS = 300;
const SIGNED_URL_REFRESH_MARGIN_MS = 60_000;

interface PublicMediaReference {
  bucket: string;
  path: string;
  mime: string;
  bytes: number;
}

interface CachedSignedUrl {
  url: string;
  expiresAt: number;
}

/** Resolves only media authorized by the active public publication. */
@Injectable({ providedIn: 'root' })
export class PublishedMediaUrlService {
  private readonly client = inject(SUPABASE_CLIENT);
  private readonly cache = new Map<string, CachedSignedUrl>();
  private readonly inFlight = new Map<string, Promise<string | null>>();

  async resolve(mediaId: string, publicationId: string): Promise<string | null> {
    if (!this.client || !mediaId || !publicationId) return null;

    const key = `${publicationId}:${mediaId}`;
    const cached = this.cache.get(key);
    if (cached && cached.expiresAt - Date.now() > SIGNED_URL_REFRESH_MARGIN_MS) {
      return cached.url;
    }

    const existing = this.inFlight.get(key);
    if (existing) return existing;

    const promise = this.fetch(key, mediaId, publicationId);
    this.inFlight.set(key, promise);
    void promise.then(() => {
      if (this.inFlight.get(key) === promise) this.inFlight.delete(key);
    }, () => {
      if (this.inFlight.get(key) === promise) this.inFlight.delete(key);
    });
    return promise;
  }

  clear(): void {
    this.cache.clear();
    this.inFlight.clear();
  }

  private async fetch(key: string, mediaId: string, publicationId: string): Promise<string | null> {
    const client = this.client;
    if (!client) return null;

    const { data, error } = await client.rpc('get_public_media_reference', {
      media_id: mediaId,
      publication_id: publicationId,
    });
    if (error) return null;

    const reference = readReference(data);
    if (!reference) return null;

    const signed = await client.storage.from(reference.bucket).createSignedUrl(
      reference.path,
      SIGNED_URL_TTL_SECONDS,
    );
    if (signed.error || !signed.data?.signedUrl) return null;

    this.cache.set(key, {
      url: signed.data.signedUrl,
      expiresAt: Date.now() + SIGNED_URL_TTL_SECONDS * 1000,
    });
    return signed.data.signedUrl;
  }
}

function readReference(value: unknown): PublicMediaReference | null {
  const row = Array.isArray(value) ? value[0] : value;
  if (!row || typeof row !== 'object') return null;
  const reference = row as Record<string, unknown>;
  const bucket = typeof reference['bucket'] === 'string' ? reference['bucket'] : '';
  const path = typeof reference['path'] === 'string' ? reference['path'] : '';
  const mime = typeof reference['mime'] === 'string' ? reference['mime'] : '';
  const bytes = typeof reference['bytes'] === 'number' ? reference['bytes'] : Number(reference['bytes']);
  if (!bucket || !path || !mime || !Number.isFinite(bytes)) return null;
  return { bucket, path, mime, bytes };
}

