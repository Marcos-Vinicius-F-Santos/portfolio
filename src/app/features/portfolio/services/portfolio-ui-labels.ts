import type { PortfolioLocale } from './portfolio-content.models';

export interface UiLabels {
  cvButton: string;
  viewProjects: string;
  contactMe: string;
  languageLabel: string;
  resumeLabel: string;
  downloadCurriculumPdf: string;
  viewFullProject: string;
  filterAll: string;
  filterProfessional: string;
  filterPersonal: string;
  focusBadge: string;
  backToProjects: string;
  solution: string;
  loadingProject: string;
  errorLoadingProject: string;
  refreshToTryAgain: string;
}

export const PORTFOLIO_UI_LABELS: Record<PortfolioLocale, UiLabels> = {
  'pt-BR': {
    cvButton: 'Currículo',
    viewProjects: 'Ver projetos',
    contactMe: 'Fale comigo',
    languageLabel: 'Idioma:',
    resumeLabel: 'Currículo:',
    downloadCurriculumPdf: 'Baixar currículo completo (PDF)',
    viewFullProject: 'Ver projeto completo',
    filterAll: 'Todos',
    filterProfessional: 'Profissionais',
    filterPersonal: 'Pessoais',
    focusBadge: 'FOCO',
    backToProjects: 'Voltar aos projetos',
    solution: 'Solução',
    loadingProject: 'Carregando projeto…',
    errorLoadingProject: 'Não foi possível carregar o projeto',
    refreshToTryAgain: 'Atualize a página para tentar novamente.',
  },
  en: {
    cvButton: 'Resume',
    viewProjects: 'View Projects',
    contactMe: 'Contact Me',
    languageLabel: 'Language:',
    resumeLabel: 'Resume:',
    downloadCurriculumPdf: 'Download full resume (PDF)',
    viewFullProject: 'View full project',
    filterAll: 'All',
    filterProfessional: 'Professional',
    filterPersonal: 'Personal',
    focusBadge: 'FOCUS',
    backToProjects: 'Back to projects',
    solution: 'Solution',
    loadingProject: 'Loading project…',
    errorLoadingProject: 'Unable to load project',
    refreshToTryAgain: 'Please refresh the page to try again.',
  },
};

export function getUiLabels(locale: PortfolioLocale): UiLabels {
  return PORTFOLIO_UI_LABELS[locale] ?? PORTFOLIO_UI_LABELS['pt-BR'];
}

