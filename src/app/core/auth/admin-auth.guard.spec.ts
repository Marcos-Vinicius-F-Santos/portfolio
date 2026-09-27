import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { describe, expect, it, vi } from 'vitest';
import { adminAuthGuard } from './admin-auth.guard';
import { AdminAuthService } from './admin-auth.service';

describe('adminAuthGuard', () => {
  it('allows an authorized session', async () => {
    const auth = { restoreAuthorizedSession: vi.fn().mockResolvedValue(true) };
    TestBed.configureTestingModule({
      providers: [provideRouter([]), { provide: AdminAuthService, useValue: auth }],
    });

    await expect(
      TestBed.runInInjectionContext(() => adminAuthGuard({} as never, [], {} as never)),
    ).resolves.toBe(true);
  });

  it('does not match the protected route for an unauthenticated or unauthorized session', async () => {
    const auth = { restoreAuthorizedSession: vi.fn().mockResolvedValue(false) };
    TestBed.configureTestingModule({
      providers: [provideRouter([]), { provide: AdminAuthService, useValue: auth }],
    });

    await expect(
      TestBed.runInInjectionContext(() => adminAuthGuard({} as never, [], {} as never)),
    ).resolves.toBe(false);
  });
});
