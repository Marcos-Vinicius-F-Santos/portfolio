export interface SupabaseRuntimeConfig {
  url: string;
  publishableKey: string;
  adminUserId: string;
}

declare global {
  // This object is injected by the deployment/runtime configuration and must not contain
  // a service-role or secret key.
  var __PORTFOLIO_SUPABASE_CONFIG__: Partial<SupabaseRuntimeConfig> | undefined;
}

const runtimeConfig = globalThis.__PORTFOLIO_SUPABASE_CONFIG__ ?? {};

export const supabaseRuntimeConfig: SupabaseRuntimeConfig = {
  url: runtimeConfig.url ?? '',
  publishableKey: runtimeConfig.publishableKey ?? '',
  adminUserId: runtimeConfig.adminUserId ?? '',
};

export function assertSupabaseRuntimeConfig(
  config: SupabaseRuntimeConfig = supabaseRuntimeConfig,
): SupabaseRuntimeConfig {
  if (!config.url || !config.publishableKey) {
    throw new Error(
      'Supabase configuration is missing. Provide SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY.',
    );
  }

  return config;
}
