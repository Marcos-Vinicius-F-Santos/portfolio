import type { SupabaseClient } from '@supabase/supabase-js';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { AUTHORIZED_ADMIN_USER_ID } from './admin-auth.models';
import { AdminAuthorizationService } from './admin-authorization.service';
import { SUPABASE_CLIENT } from '../supabase/supabase-client';

function clientWithResult(data: unknown, error: unknown = null): SupabaseClient {
  const query = {
    select: () => query,
    eq: () => query,
    maybeSingle: async () => ({ data, error }),
  };
  return { from: () => query } as unknown as SupabaseClient;
}

describe('AdminAuthorizationService', () => {
  it('authorizes Marcos only when the fixed UUID is present in the allowlist', async () => {
    TestBed.configureTestingModule({
      providers: [
        AdminAuthorizationService,
        {
          provide: SUPABASE_CLIENT,
          useValue: clientWithResult({ user_id: AUTHORIZED_ADMIN_USER_ID }),
        },
      ],
    });
    const service = TestBed.inject(AdminAuthorizationService);

    await expect(service.isAuthorized(AUTHORIZED_ADMIN_USER_ID)).resolves.toBe(true);
  });

  it('rejects another authenticated account before querying the allowlist', async () => {
    TestBed.configureTestingModule({
      providers: [
        AdminAuthorizationService,
        {
          provide: SUPABASE_CLIENT,
          useValue: clientWithResult({ user_id: AUTHORIZED_ADMIN_USER_ID }),
        },
      ],
    });
    const service = TestBed.inject(AdminAuthorizationService);

    await expect(service.isAuthorized('00000000-0000-0000-0000-000000000000')).resolves.toBe(false);
  });

  it('rejects an allowlist error', async () => {
    TestBed.configureTestingModule({
      providers: [
        AdminAuthorizationService,
        {
          provide: SUPABASE_CLIENT,
          useValue: clientWithResult(null, new Error('denied')),
        },
      ],
    });
    const service = TestBed.inject(AdminAuthorizationService);

    await expect(service.isAuthorized(AUTHORIZED_ADMIN_USER_ID)).resolves.toBe(false);
  });
});
