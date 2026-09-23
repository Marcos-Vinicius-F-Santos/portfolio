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
  stackTitle: string;
  stackBody: string;
  languageLabel: string;
}

export type PortfolioSection = 'presentation' | 'about';

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
  stackTitle: 'Stack técnica',
  stackBody: 'As tecnologias e competências serão apresentadas nesta seção.',
  languageLabel: 'Idioma',
};

export function hasPortfolioSectionContent(copy: PortfolioCopy, section: PortfolioSection): boolean {
  const keys: (keyof PortfolioCopy)[] =
    section === 'presentation' ? ['intro'] : ['aboutTitle', 'aboutBody'];
  return keys.every((key) => copy[key].trim().length > 0);
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
