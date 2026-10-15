import { writeFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const ROOT = resolve(process.cwd(), 'src/assets/skills');

const DEVICON_BASE = 'https://raw.githubusercontent.com/devicons/devicon/master/icons';
const SIMPLE_BASE = 'https://raw.githubusercontent.com/simple-icons/simple-icons/develop/icons';

const ICONS_TO_FETCH = [
  { file: 'python.svg', url: `${DEVICON_BASE}/python/python-original.svg` },
  { file: 'opencv.svg', url: `${DEVICON_BASE}/opencv/opencv-original.svg` },
  { file: 'flutter.svg', url: `${DEVICON_BASE}/flutter/flutter-original.svg` },
  { file: 'angular.svg', url: `${DEVICON_BASE}/angular/angular-original.svg` },
  { file: 'fastapi.svg', url: `${DEVICON_BASE}/fastapi/fastapi-original.svg` },
  { file: 'laravel.svg', url: `${DEVICON_BASE}/laravel/laravel-original.svg` },
  { file: 'dart.svg', url: `${DEVICON_BASE}/dart/dart-original.svg` },
  { file: 'php.svg', url: `${DEVICON_BASE}/php/php-original.svg` },
  { file: 'supabase.svg', url: `${DEVICON_BASE}/supabase/supabase-original.svg` },
  { file: 'oracle.svg', url: `${DEVICON_BASE}/oracle/oracle-original.svg` },
  { file: 'redis.svg', url: `${DEVICON_BASE}/redis/redis-original.svg` },
  { file: 'gitlab.svg', url: `${DEVICON_BASE}/gitlab/gitlab-original.svg` },
  { file: 'gitkraken.svg', url: `${DEVICON_BASE}/gitkraken/gitkraken-original.svg` },
  { file: 'gradle.svg', url: `${DEVICON_BASE}/gradle/gradle-original.svg` },
  { file: 'maven.svg', url: `${DEVICON_BASE}/maven/maven-original.svg` },
  {
    file: 'yolo.svg',
    url: `${SIMPLE_BASE}/yolo.svg`,
    transform: (svg) => svg.replace('<path ', '<path fill="#0047FF" ')
  },
  {
    file: 'mediapipe.svg',
    url: `${SIMPLE_BASE}/mediapipe.svg`,
    transform: (svg) => svg.replace('<path ', '<path fill="#007F9E" ')
  }
];

// JSF: JavaServer Faces vector icon combining Java coffee cup with JSF tag
const JSF_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
  <path fill="#EA2D2E" d="M48.2 24.3c-1.8 14.1 6.3 19.8 11.2 26.6-4.5-9.6-6.4-15.8-2.1-23.7 4.2-7.8 2.2-12.7-9.1-2.9z"/>
  <path fill="#EA2D2E" d="M63.8 12.5c-2.3 8.2 2.1 13.9 6.2 19.3-3.6-7.8-4.2-11.8-.7-17 3.5-5.2 2.1-8.5-5.5-2.3z"/>
  <path fill="#0074BD" d="M36 62.5c1.2-1.5 3.2-1.8 4.7-.7 13.5 9.8 39.5 9.8 53 0 1.5-1.1 3.5-.8 4.7.7 1.1 1.5.8 3.5-.7 4.7-16.1 11.7-44.9 11.7-61 0-1.5-1.2-1.8-3.2-.7-4.7z"/>
  <path fill="#0074BD" d="M42.5 73.8c12.2 6.5 34.8 6.5 47 0 1.6-.9 3.6-.3 4.5 1.3.9 1.6.3 3.6-1.3 4.5-14.8 7.9-40.6 7.9-55.4 0-1.6-.9-2.2-2.9-1.3-4.5.9-1.6 2.9-2.2 4.5-1.3z"/>
  <path fill="#0074BD" d="M28 89.2c22.1 5.8 53.9 5.8 76 0 1.8-.5 3.7.6 4.1 2.4.5 1.8-.6 3.7-2.4 4.1-24.8 6.5-58.6 6.5-83.4 0-1.8-.5-2.9-2.4-2.4-4.1.4-1.8 2.3-2.9 4.1-2.4z"/>
  <rect x="22" y="101" width="84" height="24" rx="6" fill="#0074BD"/>
  <text x="64" y="118.5" fill="#FFFFFF" font-family="system-ui, -apple-system, sans-serif" font-size="14.5" font-weight="900" letter-spacing="1.5" text-anchor="middle">JSF</text>
</svg>
`;

async function run() {
  console.log('Downloading skills icons to:', ROOT);

  for (const item of ICONS_TO_FETCH) {
    try {
      const res = await fetch(item.url, { signal: AbortSignal.timeout(5000) });
      if (!res.ok) {
        console.error(`Failed ${item.file}: HTTP ${res.status}`);
        continue;
      }
      let content = await res.text();
      if (item.transform) {
        content = item.transform(content);
      }
      const outPath = resolve(ROOT, item.file);
      writeFileSync(outPath, content, 'utf8');
      console.log(`Saved ${item.file} (${content.length} bytes)`);
    } catch (err) {
      console.error(`Error fetching ${item.file}:`, err.message);
    }
  }

  // Write JSF
  const jsfPath = resolve(ROOT, 'jsf.svg');
  writeFileSync(jsfPath, JSF_SVG, 'utf8');
  console.log(`Saved jsf.svg (${JSF_SVG.length} bytes)`);

  // Also make a copy for yolo as yolov8.svg
  const yoloPath = resolve(ROOT, 'yolo.svg');
  if (existsSync(yoloPath)) {
    const yolov8Path = resolve(ROOT, 'yolov8.svg');
    writeFileSync(yolov8Path, JSF_SVG ? readFileSync(yoloPath, 'utf8') : '', 'utf8');
    console.log('Saved yolov8.svg (alias for yolo.svg)');
  }
}

import { readFileSync } from 'node:fs';
run();
