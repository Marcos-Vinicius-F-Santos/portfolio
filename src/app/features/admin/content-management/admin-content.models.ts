import type { PortfolioCopyKey } from '../../portfolio/content/portfolio-content';
import type {
  PortfolioContactSymbol,
  PortfolioProjectLink,
} from '../../portfolio/content/portfolio-content.models';

export type AdminLocale = 'pt-BR' | 'en';

export interface LocalizedValue<T> {
  'pt-BR': T;
  en: T;
}

export interface AdminCopyEntry {
  key: PortfolioCopyKey;
  label: string;
  value: LocalizedValue<string>;
}

export interface AdminExperienceDraft {
  id: string;
  startDate: string;
  endDate: string;
  name: string;
  displayOrder: number;
  translations: LocalizedValue<AdminExperienceTranslation>;
}

export interface AdminExperienceTranslation {
  title: string;
  context: string;
  responsibilities: string[];
  technicalDecisions: string[];
  results: string[];
}

export interface AdminProjectDraft {
  id: string;
  displayOrder: number;
  type: 'professional' | 'personal';
  translations: LocalizedValue<AdminProjectTranslation>;
}

export interface AdminProjectTranslation {
  name: string;
  description: string;
  problemContext: string;
  solution: string;
  role: string;
  technicalDecisions: string[];
  technologies: string[];
  results: string[];
  learnings: string[];
  links: PortfolioProjectLink[];
}

export interface AdminSkillDraft {
  id: string;
  name: LocalizedValue<string>;
  displayOrder: number;
  iconUrl: string;
  iconStoragePath: string;
}

export interface AdminSkillCategoryDraft {
  id: string;
  categoryKey: string;
  displayOrder: number;
  label: LocalizedValue<string>;
  skills: AdminSkillDraft[];
}

export interface AdminAcademicDraft {
  id: string;
  displayOrder: number;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  translation: LocalizedValue<{
    name: string;
    institution: string;
    competencies: string[];
    studiedContent: string[];
  }>;
}

export interface AdminContactDraft {
  id: string;
  symbol: PortfolioContactSymbol;
  href: string;
  displayOrder: number;
  label: LocalizedValue<string>;
}

export interface AdminContentDraft {
  copy: AdminCopyEntry[];
  experiences: AdminExperienceDraft[];
  projects: AdminProjectDraft[];
  skillCategories: AdminSkillCategoryDraft[];
  academicEntries: AdminAcademicDraft[];
  contacts: AdminContactDraft[];
}

export type AdminSaveResult = { ok: true } | { ok: false; message: string };

export const LOCALES: readonly AdminLocale[] = ['pt-BR', 'en'];
