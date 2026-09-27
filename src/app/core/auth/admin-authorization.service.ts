import { Injectable, inject } from '@angular/core';
import { AUTHORIZED_ADMIN_USER_ID } from './admin-auth.models';
import { SUPABASE_CLIENT } from '../supabase/supabase-client';

@Injectable({ providedIn: 'root' })
export class AdminAuthorizationService {
  private readonly client = inject(SUPABASE_CLIENT);

  async isAuthorized(userId: string): Promise<boolean> {
    if (!this.client || userId !== AUTHORIZED_ADMIN_USER_ID) return false;

    const { data, error } = await this.client
      .from('portfolio_admins')
      .select('user_id')
      .eq('user_id', userId)
      .maybeSingle();

    return !error && data?.user_id === AUTHORIZED_ADMIN_USER_ID;
  }
}
