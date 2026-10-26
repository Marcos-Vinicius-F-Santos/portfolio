import { readFile, readdir, stat } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const outputDirectory = resolve(
  process.env.GITHUB_PAGES_OUTPUT_DIR ??
    fileURLToPath(new URL('../dist/portfolio/browser', import.meta.url)),
);
const requiredFiles = ['index.html', '404.html', 'runtime-config.js', 'favicon.ico', 'robots.txt'];

for (const file of requiredFiles) {
  try {
    await stat(resolve(outputDirectory, file));
  } catch {
    throw new Error(`Arquivo obrigatório ausente no artefato Pages: ${file}`);
  }
}

await stat(resolve(outputDirectory, 'assets'));

const indexHtml = await readFile(resolve(outputDirectory, 'index.html'), 'utf8');
const fallbackHtml = await readFile(resolve(outputDirectory, '404.html'), 'utf8');
const runtimeConfig = await readFile(resolve(outputDirectory, 'runtime-config.js'), 'utf8');

if (!indexHtml.includes('<base href="/portfolio/">')) {
  throw new Error('O index.html não usa o base href /portfolio/.');
}
if (fallbackHtml !== indexHtml) {
  throw new Error('O 404.html precisa ser uma cópia do index.html para suportar rotas profundas.');
}

const runtimeMatch = runtimeConfig.match(/=\s*(\{.*\});\s*$/s);
if (!runtimeMatch) {
  throw new Error('runtime-config.js não possui o formato esperado.');
}

const parsedRuntimeConfig = JSON.parse(runtimeMatch[1]);
for (const key of ['url', 'publishableKey', 'adminUserId']) {
  if (!String(parsedRuntimeConfig[key] ?? '').trim()) {
    throw new Error(`Variável pública obrigatória ausente no runtime-config.js: ${key}`);
  }
}

const filesToScan = [];
async function collectFiles(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const entryPath = resolve(directory, entry.name);
    if (entry.isDirectory()) {
      await collectFiles(entryPath);
    } else if (/\.(css|html|js|json|txt)$/i.test(entry.name)) {
      filesToScan.push(entryPath);
    }
  }
}

await collectFiles(outputDirectory);
const forbiddenSecretMarker =
  /service[_-]?role|supabase_service_role|supabase_db_password|-----begin (?:rsa|openssh|ec) private key-----/i;
for (const file of filesToScan) {
  const content = await readFile(file, 'utf8');
  if (forbiddenSecretMarker.test(content)) {
    throw new Error(`Marcador de segredo encontrado no artefato Pages: ${file}`);
  }
}

console.log('GitHub Pages artifact validated.');
