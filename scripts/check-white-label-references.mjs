import { readdir, readFile } from 'node:fs/promises';
import { extname, join, relative, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const roots = ['src', 'scripts', 'supabase', 'public/assets', '.github', 'package.json'];
const ignoredFiles = new Set(['public/runtime-config.js', 'scripts/check-white-label-references.mjs']);
const blocked = /joao|marcos|santos|joaovitordf|marcossantosjdev/i;
const allowedExtensions = new Set(['.ts', '.html', '.css', '.mjs', '.js', '.json', '.sql', '.md']);
const matches = [];

async function visit(path) {
  const relativePath = relative(root, path).replaceAll('\\', '/');
  if (ignoredFiles.has(relativePath)) return;
  let entry;
  try {
    entry = await (await import('node:fs/promises')).stat(path);
  } catch (error) {
    if (error?.code === 'ENOENT') return;
    throw error;
  }
  if (entry.isDirectory()) {
    for (const child of await readdir(path)) await visit(join(path, child));
    return;
  }
  if (path !== join(root, 'package.json') && !allowedExtensions.has(extname(path))) return;
  const text = await readFile(path, 'utf8');
  if (blocked.test(text)) matches.push(relativePath);
}

for (const path of roots.map((item) => join(root, item))) await visit(path);
if (matches.length) {
  console.error('White-label reference gate failed:');
  for (const match of matches) console.error(`- ${match}`);
  process.exitCode = 1;
} else {
  console.log('White-label reference gate passed.');
}
