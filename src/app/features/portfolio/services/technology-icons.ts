import { PORTFOLIO_SKILL_CATEGORIES } from './portfolio-content';

const RELATED_ICON_NAMES: Readonly<Record<string, string>> = {
  abap: 'sap', rfc: 'sap', bapi: 'sap', jco: 'sap', smtp: 'java', outsystems: 'mendix',
  'spring boot': 'java', 'spring data jpa': 'java', flyway: 'java', junit: 'java', testcontainers: 'java',
  'docker compose': 'docker', minio: 'docker', 'react router': 'react', vite: 'javascript',
  'tailwind css': 'css', 'firebase authentication': 'javascript', 'cloud firestore': 'javascript',
  'firebase functions': 'javascript', vercel: 'node.js', 'java 21': 'java', 'react 18': 'react',
  rxjs: 'typescript', bootstrap: 'css', 'chart.js': 'javascript', chartjs: 'javascript',
  openlayers: 'javascript', 'hls.js': 'javascript', cuda: 'python', 'web scraping': 'python',
};

const DIRECT_ICON_URLS: Readonly<Record<string, string>> = {
  spring: '/assets/technologies/spring.svg',
  'spring boot': '/assets/technologies/spring.svg',
  'spring data jpa': '/assets/technologies/spring.svg',
  mendix: '/assets/skills/mendix.png',
  outsystems: '/assets/technologies/outsystems.png',
  firebase: '/assets/technologies/firebase.svg',
  'firebase authentication': '/assets/technologies/firebase.svg',
  'cloud firestore': '/assets/technologies/firebase.svg',
  'firebase functions': '/assets/technologies/firebase.svg',
  python: '/assets/skills/python.svg',
  opencv: '/assets/skills/opencv.svg',
  yolo: '/assets/skills/yolo.svg',
  yolov8: '/assets/skills/yolov8.svg',
  mediapipe: '/assets/skills/mediapipe.svg',
  flutter: '/assets/skills/flutter.svg',
  angular: '/assets/skills/angular.svg',
  fastapi: '/assets/skills/fastapi.svg',
  laravel: '/assets/skills/laravel.svg',
  dart: '/assets/skills/dart.svg',
  php: '/assets/skills/php.svg',
  jsf: '/assets/skills/jsf.svg',
  supabase: '/assets/skills/supabase.svg',
  oracle: '/assets/skills/oracle.svg',
  'oracle database': '/assets/skills/oracle.svg',
  redis: '/assets/skills/redis.svg',
  gitlab: '/assets/skills/gitlab.svg',
  gitkraken: '/assets/skills/gitkraken.svg',
  gradle: '/assets/skills/gradle.svg',
  maven: '/assets/skills/maven.svg',
  rxjs: '/assets/skills/rxjs.svg',
  bootstrap: '/assets/skills/bootstrap.svg',
  'chart.js': '/assets/skills/chartjs.svg',
  chartjs: '/assets/skills/chartjs.svg',
  openlayers: '/assets/skills/openlayers.svg',
  cuda: '/assets/skills/cuda.svg',
  ocr: '/assets/skills/ocr.svg',
  'optical character recognition': '/assets/skills/ocr.svg',
};

/** Shared icon catalog for skills and project technologies, including versioned names. */
export function technologyIcon(name: string): string | undefined {
  const normalized = name
    .trim()
    .toLowerCase()
    .replace(/\s+\d.*$/, '');
  if (DIRECT_ICON_URLS[normalized]) return DIRECT_ICON_URLS[normalized];
  const skills = PORTFOLIO_SKILL_CATEGORIES.flatMap((category) => category.skills);
  const exact = skills.find(
    (skill) => skill.name.toLowerCase() === normalized,
  );
  if (exact?.iconUrl) return exact.iconUrl;
  const related = RELATED_ICON_NAMES[normalized];
  return related ? skills.find((skill) => skill.name.toLowerCase() === related)?.iconUrl : undefined;
}
