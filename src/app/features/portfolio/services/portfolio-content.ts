import { InjectionToken } from '@angular/core';
import type {
  PortfolioAcademicEntry,
  PortfolioContactLink,
  PortfolioExperience,
  PortfolioLocale,
  PortfolioProject,
  PortfolioSkill,
  PortfolioSkillCategory,
} from './portfolio-content.models';

export type PortfolioTranslations = Partial<PortfolioCopy>;

export interface PortfolioCopy {
  name: string;
  heroName: string;
  heroRole: string;
  heroAvailability: string;
  eyebrow: string;
  presentationTitle: string;
  intro: string;
  navigation: string;
  portfolioEyebrow: string;
  portfolioTitle: string;
  portfolioSubtitle: string;
  aboutTitle: string;
  aboutHeadline: string;
  aboutBody: string;
  aboutFocus: string;
  aboutPillar1Title: string;
  aboutPillar1Description: string;
  aboutPillar2Title: string;
  aboutPillar2Description: string;
  aboutPillar3Title: string;
  aboutPillar3Description: string;
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
  contactHeadline: string;
  contactSubtitle: string;
  contactExplanation: string;
  contactRedirectNote: string;
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
  contactSendingLabel: string;
  contactSuccessTitle: string;
  contactSuccessBody: string;
  contactErrorMessage: string;
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
    skills: ['FastAPI', 'Spring Boot', 'Laravel', 'Node.js', 'REST APIs', 'JSF'].map(fallbackSkill),
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
    skills: ['PostgreSQL', 'Supabase', 'MySQL', 'Redis', 'Oracle Database'].map(fallbackSkill),
  },
  {
    id: 'version-control',
    labelKey: 'skillsVersionControlLabel',
    skills: ['Git', 'GitHub', 'GitLab', 'GitKraken', 'OpenCV', 'YOLOv8', 'MediaPipe'].map(fallbackSkill),
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
    href: 'https://www.linkedin.com/in/xjoaovitordf/',
    symbol: 'linkedin',
    iconPath: '/assets/contact/linkedin.svg',
  },
  {
    id: 'github',
    labelKey: 'contactGithubLabel',
    href: 'https://github.com/joaovitordf',
    symbol: 'github',
    iconPath: '/assets/contact/github.svg',
  },
  {
    id: 'email',
    labelKey: 'contactEmailLabel',
    href: 'mailto:profissional.joaovitordf@gmail.com',
    symbol: 'email',
    iconPath: '/assets/contact/email.svg',
  },
  {
    id: 'phone',
    labelKey: 'contactPhoneLabel',
    href: 'tel:+5537999429018',
    symbol: 'phone',
    iconPath: '/assets/contact/phone.svg',
  },
];

export const PORTFOLIO_PROJECTS_PT: readonly PortfolioProject[] = [
  {
    id: 'russian-mastery',
    displayOrder: 1,
    type: 'personal',
    locale: 'pt-BR',
    name: 'Russian Mastery',
    description:
      'Plataforma full-stack para aprendizado do idioma russo com repetição espaçada SM-2, simulador de teclado cirílico e sistema de gamificação.',
    problemContext:
      'O aprendizado de idiomas com alfabetos distintos exige retenção duradoura de vocabulário, treino de digitação e acompanhamento contínuo de revisões.',
    solution:
      'Plataforma completa com front-end reativo, teclado cirílico interativo em tela, exercícios dinâmicos, gamificação com XP/níveis e API RESTful rápida.',
    role: 'Arquiteto e Desenvolvedor Full-Stack do projeto.',
    technologies: ['TypeScript', 'Angular', 'Python', 'FastAPI', 'PostgreSQL', 'Redis', 'Docker'],
    technicalDecisions: [
      'Implementação do algoritmo de repetição espaçada SM-2 (SuperMemo-2).',
      'API RESTful em FastAPI com cache Redis para otimização de consultas da base de +43.000 palavras.',
      'Autenticação JWT, controle de acesso RBAC e conteinerização completa com Docker.',
    ],
    results: [
      'Base de dados com mais de 43.000 palavras e sentenças catalogadas.',
      'Simulador de digitação cirílica interativo com reprodução de pronúncia.',
    ],
    learnings: [
      'Domínio de algoritmos de repetição espaçada para retenção de memória.',
      'Arquitetura de cache multi-nível em Redis com persistência PostgreSQL.',
    ],
    links: [{ label: 'GitHub', url: 'https://github.com/joaovitordf/russian-mastery' }],
    images: [],
  },
  {
    id: 'boxing-cv-pipeline',
    displayOrder: 2,
    type: 'personal',
    locale: 'pt-BR',
    name: 'Pipeline de Visão Computacional para Boxe',
    description:
      'Pipeline de visão computacional em tempo real para estimativa de pose, rastreamento de atletas e contagem automatizada de golpes em lutas de boxe (TCC).',
    problemContext:
      'A análise esportiva e a arbitragem em esportes de combate exigem detecção precisa de golpes em alta velocidade sem interferência de oclusões e movimentação rápida.',
    solution:
      'Pipeline que combina estimativa de pose com modelos YOLO fine-tuned, ROIs dinâmicas, máquina de estados finitos (FSM) para validação de golpes e streaming via celular.',
    role: 'Pesquisador e Desenvolvedor (Trabalho de Conclusão de Curso em Ciência da Computação - IFMG).',
    technologies: ['Python', 'OpenCV', 'YOLOv8', 'MediaPipe', 'Flutter'],
    technicalDecisions: [
      'Treinamento e fine-tuning de modelos YOLO em dataset customizado.',
      'Segmentação geométrica com ROIs dinâmicas para o corpo dos atletas, reduzindo em 83,6% o tempo total de processamento.',
      'Autômato de estados finitos (FSM) para contagem de golpes válidos e identificação de faltas.',
      'Integração de app mobile com servidor assíncrono para streaming de vídeo ao vivo.',
    ],
    results: [
      'Redução de 83,6% no tempo de processamento comparado à abordagem de clusterização.',
      'Detecção e contagem automatizada de golpes com alta acurácia.',
    ],
    learnings: [
      'Otimização de inferência de redes neurais para visão computacional em tempo real.',
      'Modelagem de máquinas de estados aplicadas a eventos esportivos complexos.',
    ],
    links: [{ label: 'GitHub', url: 'https://github.com/joaovitordf/boxing-cv' }],
    images: [],
  },
];

export const PORTFOLIO_PROJECTS_EN: readonly PortfolioProject[] = [
  {
    id: 'russian-mastery',
    displayOrder: 1,
    type: 'personal',
    locale: 'en',
    name: 'Russian Mastery',
    description:
      'Full-stack Russian language learning platform featuring SuperMemo-2 (SM-2) spaced repetition, on-screen Cyrillic keyboard simulator, and gamification.',
    problemContext:
      'Learning a language with a distinct alphabet requires dynamic spaced recall, Cyrillic typing muscle memory, and structured progression.',
    solution:
      'Full-stack web application with responsive UI, gamified practice sessions with XP and leveling, and an asynchronous backend.',
    role: 'Full-Stack Architect and Developer.',
    technologies: ['TypeScript', 'Angular', 'Python', 'FastAPI', 'PostgreSQL', 'Redis', 'Docker'],
    technicalDecisions: [
      'SuperMemo-2 (SM-2) algorithm implementation for spaced interval calculations.',
      'FastAPI RESTful service integrated with Redis caching for 43,000+ words database.',
      'JWT authentication, RBAC, and full Docker containerization.',
    ],
    results: [
      'Database of 43,000+ words and contextual sentences.',
      'Interactive Cyrillic keyboard simulator with audio pronunciation support.',
    ],
    learnings: [
      'Spaced repetition algorithms and dynamic memory scheduling.',
      'High-throughput Redis cache design paired with relational persistence.',
    ],
    links: [{ label: 'GitHub', url: 'https://github.com/joaovitordf/russian-mastery' }],
    images: [],
  },
  {
    id: 'boxing-cv-pipeline',
    displayOrder: 2,
    type: 'personal',
    locale: 'en',
    name: 'Computer Vision Pipeline for Boxing Matches',
    description:
      'Real-time computer vision pipeline for human pose estimation, athlete tracking, and automated strike counting in boxing matches (Bachelor Thesis).',
    problemContext:
      'Combat sports analytics and judging require accurate real-time detection of high-velocity strikes without failing under occlusion.',
    solution:
      'Computer vision pipeline integrating custom-trained YOLO models, dynamic ROIs, finite-state machine (FSM) strike validation, and live streaming.',
    role: 'Researcher and Developer (Bachelor Thesis in Computer Science - IFMG).',
    technologies: ['Python', 'OpenCV', 'YOLOv8', 'MediaPipe', 'Flutter'],
    technicalDecisions: [
      'Custom YOLO model training and fine-tuning on annotated boxing footage.',
      'Geometric segmentation with dynamic ROIs, reducing total processing time by 83.6%.',
      'Finite-state machine (FSM) to classify and count valid strikes and fouls.',
      'Asynchronous backend server streaming live video from a mobile device.',
    ],
    results: [
      '83.6% reduction in total pipeline processing time.',
      'Reliable strike classification and automated count verification.',
    ],
    learnings: [
      'Real-time neural network inference optimizations for high-FPS video.',
      'State machine modeling for complex kinetic sports events.',
    ],
    links: [{ label: 'GitHub', url: 'https://github.com/joaovitordf/boxing-cv' }],
    images: [],
  },
];

export function getFallbackProjects(locale: PortfolioLocale): PortfolioProject[] {
  return (locale === 'en' ? PORTFOLIO_PROJECTS_EN : PORTFOLIO_PROJECTS_PT).map((p) => ({
    ...p,
    technicalDecisions: [...p.technicalDecisions],
    technologies: [...p.technologies],
    results: [...p.results],
    learnings: [...p.learnings],
    links: p.links.map((l) => ({ ...l })),
    images: p.images.map((img) => ({ ...img })),
  }));
}

export const PORTFOLIO_PROJECTS: readonly PortfolioProject[] = PORTFOLIO_PROJECTS_PT;

export const PORTFOLIO_EXPERIENCES_PT: readonly PortfolioExperience[] = [
  {
    id: 'exp-sensoreng',
    startDate: '2025-09-01',
    endDate: '2026-09-01',
    displayOrder: 1,
    title: 'Desenvolvedor Front-end · SensorEng',
    context:
      'Atuação remota em equipe ágil em plataforma de automação industrial e visão computacional na SensorEng, impactando diretamente mais de 50 clientes corporativos.',
    responsibilities: [
      'Liderei a refatoração arquitetural de um monólito legado para uma estrutura modular, implementando carregamento sob demanda e reduzindo em 85% o tamanho do pacote inicial de carregamento da aplicação.',
      'Desenvolvi e evoluí interfaces para monitoramento industrial em tempo real, integrando transmissão de vídeo contínua, inferências de modelos de Inteligência Artificial e telemetria de sensores IoT com mapas georreferenciados.',
      'Criei uma biblioteca interna com componentes reutilizáveis (tabelas dinâmicas, filtros e modais) aplicados em todo o sistema, padronizando a interface de usuário e acelerando em 60% a entrega de novas telas.',
      'Implementei controle de níveis de permissão por perfil de usuário com proteção de rotas e autenticação, assegurando o isolamento seguro de dados entre múltiplas empresas clientes.',
    ],
    technicalDecisions: [
      'Arquitetura modular em Angular com lazy loading de rotas.',
      'Integração de WebSockets e streaming de vídeo de baixa latência.',
      'Controle de acesso baseado em papéis (RBAC) com Route Guards.',
    ],
    results: [
      'Redução de 85% no tamanho do pacote inicial de carregamento da aplicação com refatoração modular e lazy loading.',
      'Redução de 60% no tempo de entrega de novas telas com criação de biblioteca padronizada de componentes reutilizáveis.',
      'Plataforma de automação industrial e visão computacional impactando diretamente mais de 50 clientes corporativos.',
    ],
  },
  {
    id: 'exp-avante',
    startDate: '2024-08-01',
    endDate: '2025-01-01',
    displayOrder: 2,
    title: 'Desenvolvedor Júnior Fullstack · Avante Sistemas',
    context:
      'Atuação presencial na Avante Sistemas em Formiga (MG), contribuindo para sistemas de gestão empresarial utilizados por diferentes segmentos de negócio.',
    responsibilities: [
      'Desenvolvi e mantive funcionalidades em sistemas de gestão empresarial utilizando PHP, Laravel e bancos relacionais.',
      'Construí e consumi APIs RESTful para integração com serviços parceiros e relatórios gerenciais.',
      'Atuei na resolução de bugs, otimização de consultas SQL e suporte ao deploy contínuo.',
    ],
    technicalDecisions: [
      'Adoção do padrão MVC e Repository Pattern no Laravel.',
      'Normalização e indexação de tabelas no MySQL para acelerar relatórios analíticos.',
    ],
    results: [
      'Estabilidade operacional em rotinas críticas de faturamento e gestão de estoques.',
      'Redução no tempo de resposta de relatórios de vendas complexos.',
    ],
  },
  {
    id: 'exp-ifmg-credito',
    startDate: '2024-03-01',
    endDate: '2025-03-01',
    displayOrder: 3,
    title: 'Estagiário de Engenharia de Software · Polo de Inovação IFMG',
    context:
      'Atuação híbrida como aluno bolsista em projeto de extensão no Polo de Inovação do Instituto Federal de Minas Gerais em parceria com o setor privado, desenvolvendo uma plataforma web para automação e concessão de crédito comercial.',
    responsibilities: [
      'Desenvolvi módulos de cadastro, validação e análise de dados para concessão de crédito.',
      'Implementei regras de negócio para cálculo automatizado de risco financeiro.',
    ],
    technicalDecisions: [
      'Arquitetura de microsserviços com FastAPI e front-end responsivo.',
      'Persistência em PostgreSQL com modelagem transacional ACID.',
    ],
    results: [
      'Automação do fluxo de concessão de crédito, reduzindo o tempo manual de triagem.',
    ],
  },
  {
    id: 'exp-ifmg-jornada',
    startDate: '2023-05-01',
    endDate: '2023-10-01',
    displayOrder: 4,
    title: 'Estagiário de Engenharia de Software · Polo de Inovação IFMG',
    context:
      'Atuação no Polo de Inovação do Instituto Federal de Minas Gerais, desenvolvendo um aplicativo de celular para controle de jornada e frequência dos servidores e colaboradores do campus.',
    responsibilities: [
      'Desenvolvi aplicativo mobile multiplataforma em Flutter com autenticação segura e sincronização offline.',
      'Criei serviços de backend para registro e validação de batidas de ponto georreferenciadas.',
    ],
    technicalDecisions: [
      'Uso de Flutter/Dart para aplicativo multiplataforma (Android/iOS).',
      'Validação de cercas virtuais (geofencing) para registro confiável de ponto.',
    ],
    results: [
      'Substituição de controles manuais por registro eletrônico ágil e auditável.',
    ],
  },
];

export const PORTFOLIO_EXPERIENCES_EN: readonly PortfolioExperience[] = [
  {
    id: 'exp-sensoreng',
    startDate: '2025-09-01',
    endDate: '2026-09-01',
    displayOrder: 1,
    title: 'Frontend Developer · SensorEng',
    context:
      'Remote agile software development at SensorEng in an industrial automation and computer vision platform directly serving over 50 enterprise clients.',
    responsibilities: [
      'Led architectural refactoring of legacy code into a modular architecture with lazy loading, reducing initial bundle size by 85%.',
      'Engineered real-time industrial monitoring interfaces integrating live video feeds, AI inference pipelines, and IoT sensor telemetry.',
      'Built a centralized reusable component library (dynamic tables, filters, modals), standardizing UI patterns and speeding up screen delivery by 60%.',
      'Implemented role-based access control (RBAC) and route guards ensuring secure tenant data isolation across client organizations.',
    ],
    technicalDecisions: [
      'Modular Angular architecture with route-level lazy loading.',
      'WebSocket and low-latency live video streaming integration.',
      'Role-based access control (RBAC) with Route Guards.',
    ],
    results: [
      '85% initial bundle size reduction through modularization and lazy loading.',
      '60% reduction in screen delivery time via standard design system components.',
      'Production industrial automation platform supporting 50+ enterprise clients.',
    ],
  },
  {
    id: 'exp-avante',
    startDate: '2024-08-01',
    endDate: '2025-01-01',
    displayOrder: 2,
    title: 'Junior Full-Stack Developer · Avante Sistemas',
    context:
      'On-site position at Avante Sistemas in Formiga, MG, building enterprise management solutions across diverse business segments.',
    responsibilities: [
      'Developed and maintained ERP features using PHP, Laravel, and relational databases.',
      'Constructed and consumed RESTful APIs for integrations and operational analytics.',
      'Resolved production bugs and optimized SQL queries.',
    ],
    technicalDecisions: [
      'MVC and Repository patterns adoption in Laravel.',
      'MySQL indexing and query tuning for analytical reporting.',
    ],
    results: [
      'Operational reliability across core invoicing and inventory management routines.',
      'Decreased latency in sales data aggregation reports.',
    ],
  },
  {
    id: 'exp-ifmg-credito',
    startDate: '2024-03-01',
    endDate: '2025-03-01',
    displayOrder: 3,
    title: 'Software Engineering Intern · IFMG Innovation Hub',
    context:
      'Hybrid role as a scholarship research intern in an extension project at the IFMG Innovation Hub in partnership with the private sector, developing a web platform for commercial credit automation and approval.',
    responsibilities: [
      'Developed registration and validation workflows for credit approval applications.',
      'Implemented automated financial risk rating logic.',
    ],
    technicalDecisions: [
      'Microservices architecture with FastAPI and responsive frontend.',
      'PostgreSQL persistence with transactional integrity.',
    ],
    results: [
      'Streamlined credit application pipeline, cutting manual triage turnaround time.',
    ],
  },
  {
    id: 'exp-ifmg-jornada',
    startDate: '2023-05-01',
    endDate: '2023-10-01',
    displayOrder: 4,
    title: 'Software Engineering Intern · IFMG Innovation Hub',
    context:
      'Work at the IFMG Innovation Hub, developing a mobile application for daily work hours and attendance tracking for campus faculty and staff.',
    responsibilities: [
      'Built a cross-platform Flutter application with offline-first local synchronization.',
      'Created backend validation services with geolocation verification.',
    ],
    technicalDecisions: [
      'Flutter/Dart cross-platform framework targeting mobile platforms.',
      'Geofencing validation for verified campus check-ins.',
    ],
    results: [
      'Automated timecard management system replacing manual logging.',
    ],
  },
];

export function getFallbackExperiences(locale: PortfolioLocale): PortfolioExperience[] {
  return (locale === 'en' ? PORTFOLIO_EXPERIENCES_EN : PORTFOLIO_EXPERIENCES_PT).map((e) => ({
    ...e,
    responsibilities: [...e.responsibilities],
    technicalDecisions: [...e.technicalDecisions],
    results: [...e.results],
  }));
}

export const PORTFOLIO_EXPERIENCES: readonly PortfolioExperience[] = PORTFOLIO_EXPERIENCES_PT;

export const ORIGINAL_COPY: PortfolioCopy = {
  name: 'João Vitor',
  heroName: 'João Vitor',
  heroRole: 'Engenheiro de Software',
  heroAvailability: 'Disponível para novos projetos · Remoto',
  eyebrow: 'Portfólio profissional',
  presentationTitle: 'Apresentação',
  intro:
    'Desenvolvedor de Software com atuação em engenharia de sistemas, desenvolvimento web e soluções modernas. Experiência na construção de aplicações escaláveis, APIs RESTful, automação e integrações corporativas.',
  navigation: 'Navegação principal',
  portfolioEyebrow: 'Portfólio',
  portfolioTitle: 'Projetos em Destaque',
  portfolioSubtitle:
    'Projetos e soluções desenvolvidos com foco em engenharia, performance e usabilidade.',
  aboutTitle: 'Sobre mim',
  aboutHeadline:
    'Construindo soluções robustas com engenharia de software, arquitetura limpa e visão técnica',
  aboutBody:
    'Engenheiro de Software com sólida formação e experiência em desenvolvimento de software e soluções web. Atuação orientada a boas práticas de engenharia, arquitetura limpa, performance e colaboração técnica.',
  aboutFocus:
    'Foco principal: TypeScript, Angular, APIs RESTful, bancos de dados relacionais e arquiteturas modernas.',
  aboutPillar1Title: 'Engenharia Front-end & Performance',
  aboutPillar1Description:
    'Desenvolvimento de SPAs escaláveis, arquitetura modular, componentização reutilizável e interfaces responsivas.',
  aboutPillar2Title: 'Backend & APIs Escaláveis',
  aboutPillar2Description:
    'Criação de APIs RESTful de alta performance, integrações eficientes, modelagem de dados e conteinerização.',
  aboutPillar3Title: 'Arquitetura & Automação',
  aboutPillar3Description:
    'Desenvolvimento de soluções com foco em automação, confiabilidade operacional e arquitetura de sistemas.',
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
  contactHeadline: 'Vamos Trabalhar Juntos!',
  contactSubtitle: 'Tem um projeto, oportunidade ou desafio interessante? Vamos conversar.',
  contactExplanation:
    'Procurando alguém para desenvolver soluções modernas, escaláveis e de alta performance? Seja um projeto, oportunidade ou desafio técnico, sinta-se à vontade para entrar em contato.',
  contactRedirectNote: 'Você será redirecionado para o WhatsApp ou cliente de e-mail para enviar a mensagem.',
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
  contactEmailSubject: 'Contato via Portfólio',
  contactNameRequiredMessage: 'Informe seu nome.',
  contactEmailRequiredMessage: 'Informe seu e-mail.',
  contactEmailInvalidMessage: 'Informe um e-mail válido.',
  contactMessageRequiredMessage: 'Escreva uma mensagem.',
  contactSendingLabel: 'Enviando...',
  contactSuccessTitle: 'Mensagem enviada com sucesso!',
  contactSuccessBody: 'Obrigado pelo contato! Responderei em breve.',
  contactErrorMessage: 'Não foi possível enviar a mensagem no momento. Tente novamente ou use o WhatsApp.',
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
