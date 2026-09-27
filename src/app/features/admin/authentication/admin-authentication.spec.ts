import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { describe, expect, it, vi } from 'vitest';
import { AdminAuthService } from '../../../core/auth/admin-auth.service';
import { AdminAuthentication } from './admin-authentication';

describe('AdminAuthentication', () => {
  it('renders the /admin login fields', async () => {
    await TestBed.configureTestingModule({
      imports: [AdminAuthentication],
      providers: [
        provideRouter([]),
        {
          provide: AdminAuthService,
          useValue: { restoreAuthorizedSession: vi.fn().mockResolvedValue(false) },
        },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(AdminAuthentication);
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector('input[name="email"]')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('input[name="password"]')).toBeTruthy();
    expect(
      fixture.nativeElement.querySelector('[data-testid="admin-authentication"]'),
    ).toBeTruthy();
  });

  it('shows the standard error when required fields are empty', async () => {
    await TestBed.configureTestingModule({
      imports: [AdminAuthentication],
      providers: [
        provideRouter([]),
        {
          provide: AdminAuthService,
          useValue: { restoreAuthorizedSession: vi.fn().mockResolvedValue(false) },
        },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(AdminAuthentication);
    await fixture.whenStable();
    (fixture.componentInstance as unknown as { submit: () => Promise<void> }).submit =
      fixture.componentInstance['submit'].bind(fixture.componentInstance);
    await fixture.componentInstance['submit']();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('[data-testid="admin-auth-error"]')).toBeTruthy();
  });
});
