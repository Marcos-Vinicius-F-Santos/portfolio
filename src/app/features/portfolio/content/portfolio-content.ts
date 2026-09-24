import { InjectionToken } from '@angular/core';

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
  stackTitle: 'Stack técnica',
  stackBody: 'As tecnologias e competências serão apresentadas nesta seção.',
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
