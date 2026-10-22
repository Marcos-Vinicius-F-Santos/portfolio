import { TestBed } from '@angular/core/testing';
import { SUPABASE_CLIENT } from '../../../core/supabase/supabase-client';
import { GENERIC_EDITORIAL_SNAPSHOT as snapshot } from './editorial-snapshot.fixture';
import { PublishedSnapshotService } from './published-snapshot.service';

describe('PublishedSnapshotService', () => {
  it('deduplicates concurrent public snapshot requests', async () => {
    let resolveRpc!: (result: { data: typeof snapshot; error: null }) => void;
    const rpc = vi.fn(
      () =>
        new Promise<{ data: typeof snapshot; error: null }>((resolve) => {
          resolveRpc = resolve;
        }),
    );
    const service = configure({ rpc });

    const first = service.load();
    const second = service.load();

    expect(rpc).toHaveBeenCalledTimes(1);

    resolveRpc({ data: snapshot, error: null });

    await expect(Promise.all([first, second])).resolves.toEqual([snapshot, snapshot]);
    expect(service.snapshot()).toBe(snapshot);
  });

  it('allows a new request after an in-flight request fails', async () => {
    const rpc = vi
      .fn()
      .mockRejectedValueOnce(new Error('network unavailable'))
      .mockResolvedValueOnce({ data: snapshot, error: null });
    const service = configure({ rpc });

    await expect(service.load()).rejects.toThrow('network unavailable');
    await expect(service.load()).resolves.toBe(snapshot);

    expect(rpc).toHaveBeenCalledTimes(2);
  });
});

function configure(client: object): PublishedSnapshotService {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({
    providers: [
      PublishedSnapshotService,
      { provide: SUPABASE_CLIENT, useValue: client },
    ],
  });
  return TestBed.inject(PublishedSnapshotService);
}
