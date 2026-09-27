import { Injectable, inject, signal } from '@angular/core';
import type { User } from '@supabase/supabase-js';
import { AdminAuthorizationService } from './admin-authorization.service';
import type { AdminAuthResult } from './admin-auth.models';
import { SUPABASE_CLIENT } from '../supabase/supabase-client';

@Injectable({ providedIn: 'root' })
export class AdminAuthService {
  private readonly client = inject(SUPABASE_CLIENT);
  private readonly authorization = inject(AdminAuthorizationService);
  private readonly authorizedUser = signal<User | null>(null);

  readonly user = this.authorizedUser.asReadonly();

  async signIn(email: string, password: string): Promise<AdminAuthResult> {
    if (!this.client) return { ok: false, code: 'unavailable' };

    const { data, error } = await this.client.auth.signInWithPassword({ email, password });
    if (error || !data.user) {
      return { ok: false, code: error ? 'invalid-credentials' : 'unavailable' };
    }

    if (!(await this.authorization.isAuthorized(data.user.id))) {
      await this.clearLocalSession();
      return { ok: false, code: 'unauthorized' };
    }

    this.authorizedUser.set(data.user);
    return { ok: true };
  }

  async restoreAuthorizedSession(): Promise<boolean> {
    if (!this.client) {
      this.authorizedUser.set(null);
      return false;
    }

    const { data, error } = await this.client.auth.getUser();
    if (error || !data.user) {
      this.authorizedUser.set(null);
      return false;
    }

    if (!(await this.authorization.isAuthorized(data.user.id))) {
      await this.clearLocalSession();
      return false;
    }

    this.authorizedUser.set(data.user);
    return true;
  }

  async signOut(): Promise<void> {
    await this.clearLocalSession();
  }

  private async clearLocalSession(): Promise<void> {
    this.authorizedUser.set(null);
    if (this.client) await this.client.auth.signOut({ scope: 'local' });
  }
}
