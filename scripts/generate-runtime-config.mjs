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
const authorName = process.env.PORTFOLIO_AUTHOR_NAME ?? '';
const profileId = process.env.PORTFOLIO_PROFILE_ID ?? '';
const profileImageUrl = process.env.PORTFOLIO_PROFILE_IMAGE_URL ?? '';
const brandInitials = process.env.PORTFOLIO_BRAND_INITIALS ?? '';
const web3FormsAccessKey = process.env.WEB3FORMS_ACCESS_KEY ?? '';

await mkdir(new URL('../public/', import.meta.url), { recursive: true });
await writeFile(
  outputPath,
  `globalThis.__PORTFOLIO_SUPABASE_CONFIG__ = ${JSON.stringify({ url, publishableKey, adminUserId, brandInitials, authorName, profileId, profileImageUrl, web3FormsAccessKey })};\n`,
  'utf8',
);
