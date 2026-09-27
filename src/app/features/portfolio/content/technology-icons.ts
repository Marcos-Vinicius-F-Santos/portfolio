import { PORTFOLIO_SKILL_CATEGORIES } from './portfolio-content';

const RELATED_ICON_NAMES: Readonly<Record<string, string>> = {
  abap: 'sap', rfc: 'sap', bapi: 'sap', jco: 'sap', smtp: 'java', outsystems: 'mendix',
  'spring boot': 'java', 'spring data jpa': 'java', flyway: 'java', junit: 'java', testcontainers: 'java',
  'docker compose': 'docker', minio: 'docker', 'react router': 'react', vite: 'javascript',
  'tailwind css': 'css', 'firebase authentication': 'javascript', 'cloud firestore': 'javascript',
  'firebase functions': 'javascript', vercel: 'node.js', 'java 21': 'java', 'react 18': 'react',
  'maven': 'java', 'gradle': 'java', 'gitlab': 'git',
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
