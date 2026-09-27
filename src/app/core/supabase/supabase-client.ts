import { InjectionToken, type Provider } from '@angular/core';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { assertSupabaseRuntimeConfig } from '../config/supabase-runtime-config';

const authOptions = {
  persistSession: true,
  autoRefreshToken: true,
  detectSessionInUrl: false,
} as const;

function createPortfolioSupabaseClient(): SupabaseClient {
  const config = assertSupabaseRuntimeConfig();
  return createClient(config.url, config.publishableKey, { auth: authOptions });
}

export const SUPABASE_CLIENT = new InjectionToken<SupabaseClient | null>('Supabase client', {
  providedIn: 'root',
  factory: () => {
    try {
      return createPortfolioSupabaseClient();
    } catch {
      return null;
    }
  },
});

export function provideSupabaseClient(): Provider {
  return {
    provide: SUPABASE_CLIENT,
    useFactory: () => {
      try {
        return createPortfolioSupabaseClient();
      } catch {
        return null;
      }
    },
  };
}
