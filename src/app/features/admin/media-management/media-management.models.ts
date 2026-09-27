import type { PortfolioLocale } from '../../portfolio/content/portfolio-content.models';

export interface AdminMediaImage {
  id: string;
  projectId: string;
  storagePath: string;
  originalName: string;
  mimeType: 'image/png' | 'image/jpeg';
  sizeBytes: number;
  displayOrder: number;
  publicUrl: string;
}

export interface AdminMediaProject {
  id: string;
  label: string;
  images: AdminMediaImage[];
}

export interface AdminMediaSkill {
  id: string;
  label: string;
  iconUrl: string;
  iconStoragePath: string;
  iconPublicUrl: string;
  iconMediaId?: string;
  bundledAsset?: string;
  iconMime?: string;
}

export interface AdminMediaCurriculum {
  id: string;
  locale: PortfolioLocale;
  storagePath: string;
  originalName: string;
  sizeBytes: number;
  publicUrl: string;
}

export interface AdminMediaSnapshot {
  projects: AdminMediaProject[];
  skills: AdminMediaSkill[];
  curricula: Partial<Record<PortfolioLocale, AdminMediaCurriculum>>;
  revision?: number;
}

export type MediaOperationResult = { ok: true } | { ok: false; message: string };
export type SkillOperationResult =
  | { ok: true; revision: number }
  | { ok: false; message: string };
