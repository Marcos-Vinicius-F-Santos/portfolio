import { copyFile, mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const outputDirectory = resolve(
  process.env.GITHUB_PAGES_OUTPUT_DIR ??
    fileURLToPath(new URL('../dist/portfolio/browser', import.meta.url)),
);
const indexPath = resolve(outputDirectory, 'index.html');
const fallbackPath = resolve(outputDirectory, '404.html');
const noJekyllPath = resolve(outputDirectory, '.nojekyll');

await mkdir(outputDirectory, { recursive: true });
await copyFile(indexPath, fallbackPath);
await writeFile(noJekyllPath, '', 'utf8');

console.log(`GitHub Pages artifact prepared: ${outputDirectory}`);
