import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { describe, expect, it, vi } from 'vitest';
import { AdminAuthService } from '../../../../core/auth/admin-auth.service';
import { AdminAuthenticationComponent } from './admin-authentication.component';

describe('AdminAuthenticationComponent', () => {
  it('renders the /admin login fields', async () => {
    await TestBed.configureTestingModule({
      imports: [AdminAuthenticationComponent],
      providers: [
        provideRouter([]),
        {
          provide: AdminAuthService,
          useValue: { restoreAuthorizedSession: vi.fn().mockResolvedValue(false) },
        },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(AdminAuthenticationComponent);
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector('input[name="email"]')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('input[name="password"]')).toBeTruthy();
    expect(
      fixture.nativeElement.querySelector('[data-testid="admin-authentication"]'),
    ).toBeTruthy();
  });

  it('shows the standard error when required fields are empty', async () => {
    await TestBed.configureTestingModule({
      imports: [AdminAuthenticationComponent],
      providers: [
        provideRouter([]),
        {
          provide: AdminAuthService,
          useValue: { restoreAuthorizedSession: vi.fn().mockResolvedValue(false) },
        },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(AdminAuthenticationComponent);
    await fixture.whenStable();
    (fixture.componentInstance as unknown as { submit: () => Promise<void> }).submit =
      fixture.componentInstance['submit'].bind(fixture.componentInstance);
    await fixture.componentInstance['submit']();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('[data-testid="admin-auth-error"]')).toBeTruthy();
  });

  it('navigates to /admin immediately on successful login', async () => {
    const { Router } = await import('@angular/router');
    const navigateByUrlSpy = vi.fn().mockResolvedValue(true);
    const navigateSpy = vi.fn().mockResolvedValue(true);
    const signInSpy = vi.fn().mockResolvedValue({ ok: true });

    await TestBed.configureTestingModule({
      imports: [AdminAuthenticationComponent],
      providers: [
        {
          provide: Router,
          useValue: { navigateByUrl: navigateByUrlSpy, navigate: navigateSpy },
        },
        {
          provide: AdminAuthService,
          useValue: {
            restoreAuthorizedSession: vi.fn().mockResolvedValue(false),
            signIn: signInSpy,
          },
        },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(AdminAuthenticationComponent);
    await fixture.whenStable();

    fixture.componentInstance['email'].set('admin@example.invalid');
    fixture.componentInstance['password'].set('password123');

    await fixture.componentInstance['submit']();

    expect(signInSpy).toHaveBeenCalledWith(
      'admin@example.invalid',
      'password123',
    );
    expect(navigateByUrlSpy).toHaveBeenCalledWith('/', { skipLocationChange: true });
    expect(navigateSpy).toHaveBeenCalledWith(['/admin']);
  });

  it('toggles password input visibility when clicking the eye button', async () => {
    await TestBed.configureTestingModule({
      imports: [AdminAuthenticationComponent],
      providers: [
        provideRouter([]),
        {
          provide: AdminAuthService,
          useValue: { restoreAuthorizedSession: vi.fn().mockResolvedValue(false) },
        },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(AdminAuthenticationComponent);
    await fixture.whenStable();

    const passwordInput = fixture.nativeElement.querySelector('input[name="password"]') as HTMLInputElement;
    const toggleButton = fixture.nativeElement.querySelector('[data-testid="toggle-password-visibility"]') as HTMLButtonElement;

    expect(passwordInput.type).toBe('password');
    expect(toggleButton.getAttribute('aria-label')).toBe('Exibir senha');

    toggleButton.click();
    fixture.detectChanges();

    expect(passwordInput.type).toBe('text');
    expect(toggleButton.getAttribute('aria-label')).toBe('Ocultar senha');

    toggleButton.click();
    fixture.detectChanges();

    expect(passwordInput.type).toBe('password');
    expect(toggleButton.getAttribute('aria-label')).toBe('Exibir senha');
  });
});
