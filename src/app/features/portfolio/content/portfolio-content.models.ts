export type PortfolioLocale = 'pt-BR' | 'en';
export type PortfolioProjectType = 'professional' | 'personal';

export interface PortfolioProjectLink {
  label: string;
  url: string;
}

export interface PortfolioExperience {
  id: string;
  startDate: string;
  endDate: string | null;
  displayOrder: number;
  title: string;
  context: string;
  responsibilities: string[];
  technicalDecisions: string[];
  results: string[];
  editorialListIds?: Readonly<Record<string, readonly string[]>>;
}

export interface PortfolioProjectImage {
  id: string;
  projectId: string;
  storagePath: string;
  originalName: string;
  mimeType: 'image/png' | 'image/jpeg';
  sizeBytes: number;
  displayOrder: number;
  publicUrl: string;
}

export interface PortfolioProject {
  id: string;
  displayOrder: number;
  type: PortfolioProjectType;
  locale: PortfolioLocale;
  name: string;
  description: string;
  problemContext: string;
  solution: string;
  role: string;
  technicalDecisions: string[];
  technologies: string[];
  technologyIds?: string[];
  results: string[];
  learnings: string[];
  links: PortfolioProjectLink[];
  images: PortfolioProjectImage[];
  editorialListIds?: Readonly<Record<string, readonly string[]>>;
}

export function hasPortfolioProjectContent(project: PortfolioProject): boolean {
  return (
    project.name.trim().length > 0 &&
    project.description.trim().length > 0 &&
    project.problemContext.trim().length > 0 &&
    project.role.trim().length > 0 &&
    project.technicalDecisions.some((item) => item.trim().length > 0) &&
    project.technologies.some((item) => item.trim().length > 0) &&
    project.results.some((item) => item.trim().length > 0) &&
    project.learnings.some((item) => item.trim().length > 0)
  );
}

export interface PortfolioFile {
  id: string;
  fileType: 'curriculum';
  locale: PortfolioLocale;
  storagePath: string;
  originalName: string;
  mimeType: 'application/pdf';
  sizeBytes: number;
  publicUrl: string;
}

export interface PortfolioSkillCategory {
  id: string;
  labelKey: string;
  label?: string;
  skills: readonly PortfolioSkill[];
  displayOrder?: number;
}

export interface PortfolioSkill {
  id: string;
  name: string;
  iconUrl?: string;
  iconStoragePath?: string;
  iconPublicUrl?: string;
}

export interface PortfolioAcademicEntry {
  id: string;
  nameKey: string;
  name?: string;
  institution: string;
  startDate?: string | null;
  endDate?: string | null;
  isCurrent?: boolean;
  competencies?: string[];
  studiedContent?: string[];
  displayOrder?: number;
  editorialListIds?: Readonly<Record<string, readonly string[]>>;
}

export type PortfolioContactSymbol = 'linkedin' | 'github' | 'email' | 'phone';

export interface PortfolioContactLink {
  id: string;
  labelKey: string;
  label?: string;
  href: string;
  symbol: PortfolioContactSymbol;
  iconPath: string;
  displayOrder?: number;
}
