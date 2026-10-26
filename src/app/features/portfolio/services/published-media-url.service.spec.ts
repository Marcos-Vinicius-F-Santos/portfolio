import { TestBed } from '@angular/core/testing';
import { SUPABASE_CLIENT } from '../../../core/supabase/supabase-client';
import { PublishedMediaUrlService } from './published-media-url.service';

describe('PublishedMediaUrlService', () => {
  it('resolves a published media reference and caches the signed URL', async () => {
    const createSignedUrl = vi.fn().mockResolvedValue({
      data: { signedUrl: 'https://storage.example/signed-icon' },
      error: null,
    });
    const rpc = vi.fn().mockResolvedValue({
      data: [{ bucket: 'editorial-skill-icons', path: 'actor/icon.png', mime: 'image/png', bytes: 42 }],
      error: null,
    });
    const service = configure({ rpc, storage: { from: vi.fn().mockReturnValue({ createSignedUrl }) } });

    await expect(service.resolve('media-1', 'publication-1')).resolves.toBe(
      'https://storage.example/signed-icon',
    );
    await expect(service.resolve('media-1', 'publication-1')).resolves.toBe(
      'https://storage.example/signed-icon',
    );

    expect(rpc).toHaveBeenCalledTimes(1);
    expect(createSignedUrl).toHaveBeenCalledWith('actor/icon.png', 300);
  });

  it('returns null when the public reference is rejected', async () => {
    const service = configure({
      rpc: vi.fn().mockResolvedValue({ data: [], error: null }),
      storage: { from: vi.fn() },
    });

    await expect(service.resolve('draft-media', 'publication-1')).resolves.toBeNull();
  });
});

function configure(client: object): PublishedMediaUrlService {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({
    providers: [PublishedMediaUrlService, { provide: SUPABASE_CLIENT, useValue: client }],
  });
  return TestBed.inject(PublishedMediaUrlService);
}

