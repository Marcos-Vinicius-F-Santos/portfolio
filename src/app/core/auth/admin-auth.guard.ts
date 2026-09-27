import { inject } from '@angular/core';
import type { CanMatchFn } from '@angular/router';
import { AdminAuthService } from './admin-auth.service';

export const adminAuthGuard: CanMatchFn = async () => {
  const auth = inject(AdminAuthService);

  return auth.restoreAuthorizedSession();
};
