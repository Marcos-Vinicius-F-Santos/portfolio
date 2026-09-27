import { InjectionToken } from '@angular/core';
import type {
  PortfolioAcademicEntry,
  PortfolioContactLink,
  PortfolioSkill,
  PortfolioSkillCategory,
} from './portfolio-content.models';

export type PortfolioTranslations = Partial<PortfolioCopy>;

export interface PortfolioCopy {
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
  educationInstitutionLabel: string;
  educationPeriodLabel: string;
  educationCompetenciesLabel: string;
  educationContentLabel: string;
  educationCurrentLabel: string;
  contactTitle: string;
  contactBody: string;
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
};

export const PORTFOLIO_SKILL_CATEGORIES: readonly PortfolioSkillCategory[] = [
  {
    id: 'languages-runtime',
    labelKey: 'skillsLanguagesRuntimeLabel',
    skills: ['Java', 'JavaScript', 'TypeScript', 'Node.js', 'ABAP'].map(fallbackSkill),
  },
  {
    id: 'corporate-integrations',
    labelKey: 'skillsCorporateIntegrationsLabel',
    skills: ['SAP', 'RFC', 'BAPI', 'JCo', 'REST APIs', 'SMTP', 'Mendix', 'OutSystems'].map(
      fallbackSkill,
    ),
  },
  {
    id: 'frontend',
    labelKey: 'skillsFrontendLabel',
    skills: ['React', 'HTML', 'CSS'].map(fallbackSkill),
  },
  {
    id: 'devops-observability',
    labelKey: 'skillsDevopsObservabilityLabel',
    skills: ['Docker', 'Gradle', 'Maven', 'Grafana'].map(fallbackSkill),
  },
  {
    id: 'databases',
    labelKey: 'skillsDatabasesLabel',
    skills: ['SQL Server', 'MySQL', 'PostgreSQL', 'MongoDB'].map(fallbackSkill),
  },
  {
    id: 'version-control',
    labelKey: 'skillsVersionControlLabel',
    skills: ['Git', 'GitHub', 'GitLab'].map(fallbackSkill),
  },
];

export const PORTFOLIO_ACADEMIC_ENTRIES: readonly PortfolioAcademicEntry[] = [
  {
    id: 'data-science',
    nameKey: 'educationDataScience',
    institution: 'Unopar Anhanguera',
    startDate: '2023-07-12',
    endDate: '2024-05-07',
    isCurrent: false,
    competencies: [
      'Python com Spark',
      'R',
      'ETL',
      'Data Warehouse',
      'Big Data',
      'NoSQL',
      'Processamento paralelo e distribuído',
      'Machine Learning',
      'OLAP e visualização de dados',
    ],
    studiedContent: [
      'Linguagens de programação para ciência de dados (Python com Spark)',
      'Técnicas estatísticas: teoria e prática (R Programming)',
      'Integração e fluxo de dados (ETL)',
      'Modelagem e arquitetura do DW (Data Warehouse)',
      'Banco de dados relacional e Big Data',
      'Bancos de dados não relacionais (NoSQL)',
      'Projeto em ciência de dados com soluções para processamento paralelo e distribuído de dados',
      'Machine Learning',
      'Data Discovery, OLAP e visualização de dados',
    ],
    displayOrder: 0,
  },
  {
    id: 'applied-statistics',
    nameKey: 'educationAppliedStatistics',
    institution: 'Unopar Anhanguera',
    startDate: '2023-12-13',
    endDate: '2024-06-12',
    isCurrent: false,
    competencies: [
      'Estatística experimental',
      'Métodos quantitativos de apoio à decisão',
      'Métodos estatísticos',
      'Análise multivariada e modelos de regressão',
      'Otimização numérica',
      'R',
      'Análise de dados',
      'Análise exploratória e técnicas de amostragem',
    ],
    studiedContent: [
      'Estatística experimental',
      'Métodos quantitativos de apoio à decisão',
      'Métodos estatísticos',
      'Gestão de carreira',
      'Análise multivariada e modelos de regressão',
      'Otimização numérica',
      'Técnicas estatísticas: teoria e prática (R Programming)',
      'Análise de dados',
      'Análise exploratória e técnicas de amostragem',
    ],
    displayOrder: 1,
  },
  {
    id: 'graphic-design',
    nameKey: 'educationGraphicDesign',
    institution: 'Unopar Anhanguera',
    startDate: '2022-02-01',
    endDate: '2023-06-21',
    isCurrent: false,
    competencies: [
      'Comunicação',
      'Publicidade',
      'Propaganda',
      'Marketing',
      'Métodos e técnicas modernas de comunicação',
    ],
    studiedContent: [
      'Curso Superior de Tecnologia em Design Gráfico',
      'Formação para atuação em comunicação, publicidade, propaganda e marketing',
    ],
    displayOrder: 2,
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
    href: 'https://www.linkedin.com/in/marcos-santos-b9b544214/',
    symbol: 'linkedin',
    iconPath: '/assets/contact/linkedin.svg',
  },
  {
    id: 'github',
    labelKey: 'contactGithubLabel',
    href: 'https://github.com/Marcos-Vinicius-F-Santos',
    symbol: 'github',
    iconPath: '/assets/contact/github.svg',
  },
  {
    id: 'email',
    labelKey: 'contactEmailLabel',
    href: 'mailto:marcossantosjdev@gmail.com',
    symbol: 'email',
    iconPath: '/assets/contact/email.svg',
  },
  {
    id: 'phone',
    labelKey: 'contactPhoneLabel',
    href: 'tel:+5537998292763',
    symbol: 'phone',
    iconPath: '/assets/contact/phone.svg',
  },
];

export const ORIGINAL_COPY: PortfolioCopy = {
  eyebrow: 'Portfólio profissional',
  presentationTitle: 'Apresentação',
  intro:
    'Marcos Santos é engenheiro de software com atuação em arquitetura de soluções, integrações corporativas, automação de processos e transformação digital. Seu trabalho envolve analisar alternativas técnicas e trade-offs, criar soluções reutilizáveis e contribuir para sistemas escaláveis e sustentáveis, com colaboração, adaptabilidade e empatia.',
  navigation: 'Navegação principal',
  aboutTitle: 'Sobre mim',
  aboutBody:
    'Atuo em engenharia de software, arquitetura, integrações, automação e transformação digital, buscando soluções reutilizáveis, escaláveis e sustentáveis. Valorizo a análise de alternativas e trade-offs, a colaboração, a adaptabilidade e a empatia.',
  experienceTitle: 'Experiências',
  experienceBody: 'As experiências profissionais serão apresentadas nesta seção.',
  experiencePeriodLabel: 'Período',
  experienceContextLabel: 'Contexto',
  experienceResponsibilitiesLabel: 'Responsabilidades',
  experienceTechnicalDecisionsLabel: 'Decisões técnicas',
  experienceResultsLabel: 'Resultados',
  stackTitle: 'Habilidades',
  stackBody: 'As tecnologias e competências serão apresentadas nesta seção.',
  skillsLanguagesRuntimeLabel: 'Linguagens e runtime',
  skillsCorporateIntegrationsLabel: 'Sistemas corporativos e integrações',
  skillsFrontendLabel: 'Frontend',
  skillsDevopsObservabilityLabel: 'DevOps e observabilidade',
  skillsDatabasesLabel: 'Bancos de dados',
  skillsVersionControlLabel: 'Versionamento',
  educationTitle: 'Formação acadêmica',
  educationBody: 'Pós-graduações realizadas na Unopar Anhanguera.',
  educationDataScience: 'Ciência de Dados',
  educationAppliedStatistics: 'Estatística Aplicada',
  educationGraphicDesign: 'Design Gráfico',
  educationInstitutionLabel: 'Instituição',
  educationPeriodLabel: 'Período',
  educationCompetenciesLabel: 'Competências desenvolvidas',
  educationContentLabel: 'Conteúdos estudados',
  educationCurrentLabel: 'Em andamento',
  contactTitle: 'Contato',
  contactBody: 'Canais profissionais e currículos.',
  contactLinkedinLabel: 'LinkedIn',
  contactGithubLabel: 'GitHub',
  contactEmailLabel: 'E-mail',
  contactPhoneLabel: 'Telefone',
  contactCurriculumPtLabel: 'Currículo em português',
  contactCurriculumEnLabel: 'Currículo em inglês',
  contactCurriculumDownloadLabel: 'Baixar currículo',
  languageLabel: 'Idioma',
  resultsTitle: 'Resultados profissionais',
  resultsTimeReductionLabel: 'Redução de tempo',
  resultsTimeReduction:
    'Onboarding reduzido de dias para horas; redução de 30% no tempo de conclusão de tarefas.',
  resultsStepsReductionLabel: 'Redução de etapas',
  resultsStepsReduction: 'Etapas manuais reduzidas de 8–10 para 3–5.',
  resultsUsersServedLabel: 'Usuários atendidos',
  resultsUsersServed: 'Plataforma utilizada por mais de 2.000 usuários mensais.',
  resultsProductivityGainLabel: 'Ganhos de produtividade',
  resultsProductivityGain:
    'Redução aproximada de 50% no esforço de mapeamento JSON; redução de 25% nas solicitações de alteração em formulários.',
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
