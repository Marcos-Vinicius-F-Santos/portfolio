import { InjectionToken, type Provider } from '@angular/core';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { assertSupabaseRuntimeConfig } from '../config/supabase-runtime-config';

export const SUPABASE_CLIENT = new InjectionToken<SupabaseClient | null>('Supabase client', {
  providedIn: 'root',
  factory: () => {
    try {
      const config = assertSupabaseRuntimeConfig();
      return createClient(config.url, config.publishableKey);
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
        const config = assertSupabaseRuntimeConfig();
        return createClient(config.url, config.publishableKey);
      } catch {
        return null;
      }
    },
  };
}
