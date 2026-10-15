import { mkdir, writeFile } from 'node:fs/promises';
try {
  process.loadEnvFile?.();
} catch {
  // .env is optional; continue if not present
}

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
const brandInitials = process.env.PORTFOLIO_BRAND_INITIALS ?? process.env.AUTHOR_INITIALS ?? 'JV';
const authorName = process.env.PORTFOLIO_AUTHOR_NAME ?? process.env.AUTHOR_NAME ?? 'João Vitor';
const web3FormsAccessKey = process.env.WEB3FORMS_ACCESS_KEY ?? '';

await mkdir(new URL('../public/', import.meta.url), { recursive: true });
await writeFile(
  outputPath,
  `globalThis.__PORTFOLIO_SUPABASE_CONFIG__ = ${JSON.stringify({ url, publishableKey, adminUserId, brandInitials, authorName, web3FormsAccessKey })};\n`,
  'utf8',
);
