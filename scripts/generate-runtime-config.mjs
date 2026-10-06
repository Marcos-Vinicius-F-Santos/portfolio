import { mkdir, writeFile } from 'node:fs/promises';

for (const envFile of ['.env', '.env.local']) {
  try {
    process.loadEnvFile?.(envFile);
  } catch {
    // Local env files are optional; deployment environments provide variables directly.
  }
}

const outputPath = new URL('../public/runtime-config.js', import.meta.url);
const url = process.env.SUPABASE_URL ?? '';
const publishableKey = process.env.SUPABASE_PUBLISHABLE_KEY ?? process.env.SUPABASE_ANON_KEY ?? '';
const adminUserId = process.env.SUPABASE_ADMIN_USER_ID ?? '';

await mkdir(new URL('../public/', import.meta.url), { recursive: true });
await writeFile(
  outputPath,
  `globalThis.__PORTFOLIO_SUPABASE_CONFIG__ = ${JSON.stringify({ url, publishableKey, adminUserId })};\n`,
  'utf8',
);
