import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideSupabaseClient } from './core/supabase/supabase-client';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideSupabaseClient(),
  ],
};