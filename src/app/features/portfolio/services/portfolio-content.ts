import { InjectionToken } from '@angular/core';
import type {
  PortfolioAcademicEntry,
  PortfolioContactLink,
  PortfolioSkill,
  PortfolioSkillCategory,
} from './portfolio-content.models';

export type PortfolioTranslations = Partial<PortfolioCopy>;

export interface PortfolioCopy {
  name: string;
  eyebrow: string;
  presentationTitle: string;
  intro: string;
  navigation: string;
  aboutTitle: string;
  aboutBody: string;
  experienceTitle: string;
  experienceBody: string;
  experiencePeriodLabel: string;
  experienceContextLabel: string;
  experienceResponsibilitiesLabel: string;
  experienceTechnicalDecisionsLabel: string;
  experienceResultsLabel: string;
  stackTitle: string;
  stackBody: string;
  skillsLanguagesRuntimeLabel: string;
  skillsCorporateIntegrationsLabel: string;
  skillsFrontendLabel: string;
  skillsDevopsObservabilityLabel: string;
  skillsDatabasesLabel: string;
  skillsVersionControlLabel: string;
  educationTitle: string;
  educationBody: string;
  educationDataScience: string;
  educationAppliedStatistics: string;
  educationGraphicDesign: string;
  educationNameLabel: string;
  educationInstitutionLabel: string;
  educationLevelLabel: string;
  educationStatusLabel: string;
  educationCompletedLabel: string;
  educationPeriodLabel: string;
  educationCompetenciesLabel: string;
  educationContentLabel: string;
  educationCurrentLabel: string;
  contactTitle: string;
  contactBody: string;
  contactPanelTitle: string;
  contactPanelBody: string;
  contactNameLabel: string;
  contactNamePlaceholder: string;
  contactEmailFieldLabel: string;
  contactEmailPlaceholder: string;
  contactMessageLabel: string;
  contactMessagePlaceholder: string;
  contactWhatsAppActionLabel: string;
  contactEmailActionLabel: string;
  contactEmailSubject: string;
  contactNameRequiredMessage: string;
  contactEmailRequiredMessage: string;
  contactEmailInvalidMessage: string;
  contactMessageRequiredMessage: string;
  contactLinkedinLabel: string;
  contactGithubLabel: string;
  contactEmailLabel: string;
  contactPhoneLabel: string;
  contactCurriculumPtLabel: string;
  contactCurriculumEnLabel: string;
  contactCurriculumDownloadLabel: string;
  languageLabel: string;
  resultsTitle: string;
  resultsTimeReductionLabel: string;
  resultsTimeReduction: string;
  resultsStepsReductionLabel: string;
  resultsStepsReduction: string;
  resultsUsersServedLabel: string;
  resultsUsersServed: string;
  resultsProductivityGainLabel: string;
  resultsProductivityGain: string;
  projectsTitle: string;
  professionalProjectsTitle: string;
  personalProjectsTitle: string;
  projectDescriptionLabel: string;
  projectContextLabel: string;
  projectRoleLabel: string;
  projectTechnicalDecisionsLabel: string;
  projectTechnologiesLabel: string;
  projectResultsLabel: string;
  projectLearningsLabel: string;
  projectLinksLabel: string;
}

export type PortfolioSection = 'presentation' | 'about' | 'results';

export const PORTFOLIO_RESULT_KEYS = [
  'resultsTimeReduction',
  'resultsStepsReduction',
  'resultsUsersServed',
  'resultsProductivityGain',
] as const satisfies readonly (keyof PortfolioCopy)[];

const FALLBACK_SKILL_ICON_URLS: Readonly<Record<string, string>> = {
  Java: '/assets/skills/java.png',
  JavaScript: '/assets/skills/javascript.png',
  TypeScript: '/assets/skills/typescript.png',
  'Node.js': '/assets/skills/node-js.png',
  SAP: '/assets/skills/sap.png',
  'REST APIs': '/assets/skills/rest-apis.png',
  Mendix: '/assets/skills/mendix.png',
  React: '/assets/skills/react.png',
  HTML: '/assets/skills/html.png',
  CSS: '/assets/skills/css.png',
  Docker: '/assets/skills/docker.png',
  Grafana: '/assets/skills/grafana.png',
  'SQL Server': '/assets/skills/sql-server.png',
  MySQL: '/assets/skills/mysql.png',
  PostgreSQL: '/assets/skills/postgresql.png',
  MongoDB: '/assets/skills/mongodb.png',
  Git: '/assets/skills/git.png',
  GitHub: '/assets/skills/github.png',
  Python: '/assets/skills/python.svg',
  OpenCV: '/assets/skills/opencv.svg',
  YOLOv8: '/assets/skills/yolov8.svg',
  MediaPipe: '/assets/skills/mediapipe.svg',
  Flutter: '/assets/skills/flutter.svg',
  Angular: '/assets/skills/angular.svg',
  FastAPI: '/assets/skills/fastapi.svg',
  Laravel: '/assets/skills/laravel.svg',
  Dart: '/assets/skills/dart.svg',
  PHP: '/assets/skills/php.svg',
  JSF: '/assets/skills/jsf.svg',
  Supabase: '/assets/skills/supabase.svg',
  'Oracle Database': '/assets/skills/oracle.svg',
  Redis: '/assets/skills/redis.svg',
  GitLab: '/assets/skills/gitlab.svg',
  GitKraken: '/assets/skills/gitkraken.svg',
  Gradle: '/assets/skills/gradle.svg',
  Maven: '/assets/skills/maven.svg',
  'Spring Boot': '/assets/technologies/spring.svg',
};

export const PORTFOLIO_SKILL_CATEGORIES: readonly PortfolioSkillCategory[] = [
  {
    id: 'languages-runtime',
    labelKey: 'skillsLanguagesRuntimeLabel',
    skills: ['TypeScript', 'Python', 'Java', 'PHP', 'JavaScript', 'Dart'].map(fallbackSkill),
  },
  {
    id: 'corporate-integrations',
    labelKey: 'skillsCorporateIntegrationsLabel',
    skills: ['FastAPI', 'Spring Boot', 'Laravel', 'REST APIs', 'JSF'].map(fallbackSkill),
  },
  {
    id: 'frontend',
    labelKey: 'skillsFrontendLabel',
    skills: ['Angular', 'Flutter', 'HTML', 'CSS', 'React'].map(fallbackSkill),
  },
  {
    id: 'devops-observability',
    labelKey: 'skillsDevopsObservabilityLabel',
    skills: ['Docker', 'Gradle', 'Maven', 'Grafana'].map(fallbackSkill),
  },
  {
    id: 'databases',
    labelKey: 'skillsDatabasesLabel',
    skills: ['PostgreSQL', 'Supabase', 'MySQL', 'Oracle Database'].map(fallbackSkill),
  },
  {
    id: 'version-control',
    labelKey: 'skillsVersionControlLabel',
    skills: ['Git', 'GitHub', 'GitLab', 'GitKraken', 'OpenCV', 'YOLOv8'].map(fallbackSkill),
  },
];

export const PORTFOLIO_ACADEMIC_ENTRIES: readonly PortfolioAcademicEntry[] = [
  {
    id: 'academic-fallback',
    nameKey: 'educationDataScience',
    institution: 'Instituição de Ensino Superior',
    level: 'Graduação',
    startDate: '2020-01-01',
    endDate: '2024-12-31',
    isCurrent: false,
    competencies: [
      'Engenharia de Software',
      'Estruturas de Dados e Algoritmos',
      'Bancos de Dados',
      'Sistemas Distribuídos',
    ],
    studiedContent: [
      'Graduação em Computação e Engenharia de Software',
    ],
    displayOrder: 0,
  },
];

function fallbackSkill(name: string): PortfolioSkill {
  return {
    id: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    name,
    iconUrl: FALLBACK_SKILL_ICON_URLS[name],
  };
}

export const PORTFOLIO_CONTACT_LINKS: readonly PortfolioContactLink[] = [
  {
    id: 'linkedin',
    labelKey: 'contactLinkedinLabel',
    href: 'https://www.linkedin.com/',
    symbol: 'linkedin',
    iconPath: '/assets/contact/linkedin.svg',
  },
  {
    id: 'github',
    labelKey: 'contactGithubLabel',
    href: 'https://github.com/',
    symbol: 'github',
    iconPath: '/assets/contact/github.svg',
  },
  {
    id: 'email',
    labelKey: 'contactEmailLabel',
    href: 'mailto:contato@exemplo.com',
    symbol: 'email',
    iconPath: '/assets/contact/email.svg',
  },
  {
    id: 'phone',
    labelKey: 'contactPhoneLabel',
    href: 'tel:+5500000000000',
    symbol: 'phone',
    iconPath: '/assets/contact/phone.svg',
  },
];

export const ORIGINAL_COPY: PortfolioCopy = {
  name: 'Desenvolvedor de Software',
  eyebrow: 'Portfólio profissional',
  presentationTitle: 'Apresentação',
  intro:
    'Desenvolvedor de Software com atuação em engenharia de sistemas, desenvolvimento web e soluções modernas. Experiência na construção de aplicações escaláveis, APIs RESTful, automação e integrações corporativas.',
  navigation: 'Navegação principal',
  aboutTitle: 'Sobre mim',
  aboutBody:
    'Profissional de tecnologia com sólida formação e experiência em desenvolvimento de software e soluções web. Atuação orientada a boas práticas de engenharia, arquitetura limpa, performance e colaboração técnica.',
  experienceTitle: 'Experiências',
  experienceBody: 'Experiências profissionais em engenharia de software e desenvolvimento de soluções tecnológicas.',
  experiencePeriodLabel: 'Período',
  experienceContextLabel: 'Contexto',
  experienceResponsibilitiesLabel: 'Responsabilidades',
  experienceTechnicalDecisionsLabel: 'Decisões técnicas',
  experienceResultsLabel: 'Resultados',
  stackTitle: 'Habilidades',
  stackBody: 'Tecnologias, linguagens, frameworks e ferramentas aplicadas em projetos e sistemas em produção.',
  skillsLanguagesRuntimeLabel: 'Linguagens e runtime',
  skillsCorporateIntegrationsLabel: 'Backend e APIs',
  skillsFrontendLabel: 'Frontend e Mobile',
  skillsDevopsObservabilityLabel: 'DevOps e ferramentas',
  skillsDatabasesLabel: 'Bancos de dados',
  skillsVersionControlLabel: 'Versionamento e ferramentas',
  educationTitle: 'Formação acadêmica',
  educationBody: 'Formação acadêmica e especializações.',
  educationDataScience: 'Computação e Engenharia de Software',
  educationAppliedStatistics: 'Estatística Aplicada',
  educationGraphicDesign: 'Design Gráfico',
  educationNameLabel: 'Formação',
  educationInstitutionLabel: 'Instituição',
  educationLevelLabel: 'Nível',
  educationStatusLabel: 'Status',
  educationCompletedLabel: 'Concluído',
  educationPeriodLabel: 'Período',
  educationCompetenciesLabel: 'Competências desenvolvidas',
  educationContentLabel: 'Conteúdos estudados',
  educationCurrentLabel: 'Em andamento',
  contactTitle: 'Contato',
  contactBody: 'Canais profissionais e currículos.',
  contactPanelTitle: 'Fale comigo',
  contactPanelBody: 'Envie uma mensagem pelo canal que preferir.',
  contactNameLabel: 'Nome',
  contactNamePlaceholder: 'Seu nome',
  contactEmailFieldLabel: 'E-mail',
  contactEmailPlaceholder: 'seu@email.com',
  contactMessageLabel: 'Mensagem',
  contactMessagePlaceholder: 'Escreva sua mensagem...',
  contactWhatsAppActionLabel: 'Enviar pelo WhatsApp',
  contactEmailActionLabel: 'Enviar por e-mail',
  contactEmailSubject: '',
  contactNameRequiredMessage: 'Informe seu nome.',
  contactEmailRequiredMessage: 'Informe seu e-mail.',
  contactEmailInvalidMessage: 'Informe um e-mail válido.',
  contactMessageRequiredMessage: 'Escreva uma mensagem.',
  contactLinkedinLabel: 'LinkedIn',
  contactGithubLabel: 'GitHub',
  contactEmailLabel: 'E-mail',
  contactPhoneLabel: 'Telefone',
  contactCurriculumPtLabel: 'Currículo em português',
  contactCurriculumEnLabel: 'Currículo em inglês',
  contactCurriculumDownloadLabel: 'Baixar currículo',
  languageLabel: 'Idioma',
  resultsTitle: 'Resultados profissionais',
  resultsTimeReductionLabel: 'Otimização de carregamento',
  resultsTimeReduction:
    'Otimização expressiva no tempo de carregamento da aplicação com refatoração modular e lazy loading.',
  resultsStepsReductionLabel: 'Eficiência de processamento',
  resultsStepsReduction:
    'Ganhos de eficiência e estabilidade operacional em fluxos contínuos de processamento de dados.',
  resultsUsersServedLabel: 'Clientes atendidos',
  resultsUsersServed:
    'Desenvolvimento de soluções com impacto direto em usuários e clientes corporativos.',
  resultsProductivityGainLabel: 'Aceleração de entrega',
  resultsProductivityGain:
    'Aumento de produtividade e padronização através de bibliotecas modulares de componentes reutilizáveis.',
  projectsTitle: 'Projetos',
  professionalProjectsTitle: 'Projetos profissionais',
  personalProjectsTitle: 'Projetos pessoais',
  projectDescriptionLabel: 'Descrição',
  projectContextLabel: 'Contexto',
  projectRoleLabel: 'Papel desempenhado',
  projectTechnicalDecisionsLabel: 'Decisões técnicas',
  projectTechnologiesLabel: 'Tecnologias',
  projectResultsLabel: 'Resultados',
  projectLearningsLabel: 'Aprendizados',
  projectLinksLabel: 'Links relacionados',
};

export type PortfolioCopyKey = keyof PortfolioCopy;

export const PORTFOLIO_EDITABLE_COPY_KEYS = Object.keys(ORIGINAL_COPY) as PortfolioCopyKey[];

export function hasPortfolioSectionContent(
  copy: PortfolioCopy,
  section: PortfolioSection,
): boolean {
  const keys: (keyof PortfolioCopy)[] =
    section === 'presentation'
      ? ['intro']
      : section === 'about'
        ? ['aboutTitle', 'aboutBody']
        : [...PORTFOLIO_RESULT_KEYS];
  return section === 'results'
    ? keys.some((key) => copy[key].trim().length > 0)
    : keys.every((key) => copy[key].trim().length > 0);
}

export function selectPortfolioCopy(
  language: 'pt-BR' | 'en',
  source: () => Partial<PortfolioCopy>,
): PortfolioCopy {
  const copy = { ...ORIGINAL_COPY };
  if (language === 'pt-BR') return copy;
  try {
    const translation = source();
    for (const key of Object.keys(copy) as (keyof PortfolioCopy)[]) {
      try {
        const text = translation[key];
        if (typeof text === 'string' && text.trim()) copy[key] = text;
      } catch {
        // A failed field falls back independently of the remaining content.
      }
    }
  } catch {
    // A failed source keeps the complete original content available.
  }
  return copy;
}
