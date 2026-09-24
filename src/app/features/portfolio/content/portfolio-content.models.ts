export type PortfolioLocale = 'pt-BR' | 'en';

export interface PortfolioExperience {
  id: string;
  startDate: string;
  endDate: string | null;
  name: string;
  displayOrder: number;
  title: string;
  context: string;
  responsibilities: string[];
  technicalDecisions: string[];
  results: string[];
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
  locale: PortfolioLocale;
  name: string;
  description: string;
  problemContext: string;
  solution: string;
  role: string;
  technicalDecisions: string[];
  technologies: string[];
  results: string[];
  learnings: string[];
  links: unknown[];
  images: PortfolioProjectImage[];
}

export interface PortfolioFile {
  id: string;
  fileType: 'curriculum';
  locale: PortfolioLocale;
  storagePath: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  publicUrl: string;
}
