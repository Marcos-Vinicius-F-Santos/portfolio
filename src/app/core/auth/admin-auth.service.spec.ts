import type { SupabaseClient } from '@supabase/supabase-js';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it, vi } from 'vitest';
import { AUTHORIZED_ADMIN_USER_ID } from './admin-auth.models';
import { AdminAuthService } from './admin-auth.service';
import { AdminAuthorizationService } from './admin-authorization.service';
import { SUPABASE_CLIENT } from '../supabase/supabase-client';

const adminUser = { id: AUTHORIZED_ADMIN_USER_ID, email: 'marcos@example.com' } as never;

function authClient(overrides: Partial<SupabaseClient['auth']> = {}): SupabaseClient {
  return {
    auth: {
      signInWithPassword: vi.fn(),
      getUser: vi.fn(),
      signOut: vi.fn().mockResolvedValue({ error: null }),
      ...overrides,
    },
  } as unknown as SupabaseClient;
}

function service(client: SupabaseClient, authorized = true): AdminAuthService {
  TestBed.configureTestingModule({
    providers: [
      AdminAuthService,
      { provide: SUPABASE_CLIENT, useValue: client },
      {
        provide: AdminAuthorizationService,
        useValue: { isAuthorized: vi.fn().mockResolvedValue(authorized) },
      },
    ],
  });
  return TestBed.inject(AdminAuthService);
}

describe('AdminAuthService', () => {
  it('authenticates Marcos with email and password', async () => {
    const client = authClient({
      signInWithPassword: vi.fn().mockResolvedValue({ data: { user: adminUser }, error: null }),
    });
    const result = await service(client).signIn('marcos@example.com', 'secret');

    expect(result).toEqual({ ok: true });
    expect(client.auth.signInWithPassword).toHaveBeenCalledWith({
      email: 'marcos@example.com',
      password: 'secret',
    });
  });

  it('returns a generic invalid-credentials result', async () => {
    const client = authClient({
      signInWithPassword: vi.fn().mockResolvedValue({
        data: { user: null },
        error: new Error('invalid'),
      }),
    });

    await expect(service(client).signIn('wrong@example.com', 'wrong')).resolves.toEqual({
      ok: false,
      code: 'invalid-credentials',
    });
  });

  it('signs out an authenticated account that is not Marcos', async () => {
    const client = authClient({
      signInWithPassword: vi.fn().mockResolvedValue({
        data: { user: { id: '00000000-0000-0000-0000-000000000000' } },
        error: null,
      }),
    });

    await expect(service(client, false).signIn('other@example.com', 'secret')).resolves.toEqual({
      ok: false,
      code: 'unauthorized',
    });
    expect(client.auth.signOut).toHaveBeenCalledWith({ scope: 'local' });
  });

  it('restores a persisted authorized session', async () => {
    const client = authClient({
      getUser: vi.fn().mockResolvedValue({
        data: { user: adminUser },
        error: null,
      }),
    });

    await expect(service(client).restoreAuthorizedSession()).resolves.toBe(true);
  });
});
