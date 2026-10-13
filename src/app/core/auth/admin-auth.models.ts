import { supabaseRuntimeConfig } from '../config/supabase-runtime-config';

export function getAuthorizedAdminUserId(): string {
  return supabaseRuntimeConfig.adminUserId;
}

export type AdminAuthErrorCode = 'invalid-credentials' | 'unauthorized' | 'unavailable';

export type AdminAuthResult = { ok: true } | { ok: false; code: AdminAuthErrorCode };
