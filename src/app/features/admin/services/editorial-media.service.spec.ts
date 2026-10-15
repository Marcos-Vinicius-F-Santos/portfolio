import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { SUPABASE_CLIENT } from '../../../core/supabase/supabase-client';
import { EditorialMediaService } from './editorial-media.service';

describe('EditorialMediaService', () => {
  it('reserva, envia e finaliza mídia no fluxo privado', async () => {
    const upload = vi.fn().mockResolvedValue({ error: null });
    const client = {
      rpc: vi
        .fn()
        .mockResolvedValueOnce({
          data: [{ media_id: 'm1', bucket: 'editorial-project-images', path: 'u/m1.png' }],
          error: null,
        })
        .mockResolvedValueOnce({ data: null, error: null }),
      storage: { from: vi.fn(() => ({ upload })) },
    };
    TestBed.configureTestingModule({
      providers: [EditorialMediaService, { provide: SUPABASE_CLIENT, useValue: client }],
    });
    const result = await TestBed.inject(EditorialMediaService).upload(
      4,
      'project_image',
      new File(['png'], 'x.png', { type: 'image/png' }),
    );
    expect(result.mediaId).toBe('m1');
    expect(upload).toHaveBeenCalled();
    expect(client.rpc).toHaveBeenLastCalledWith('finalize_editorial_media', {
      expected_revision: 4,
      media_id: 'm1',
    });
  });
});
