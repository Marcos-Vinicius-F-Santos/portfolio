export interface PortfolioCopy {
  eyebrow: string;
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

export const ORIGINAL_COPY: PortfolioCopy = {
  eyebrow: 'Portfólio profissional',
  intro: 'Engenharia de software, arquitetura de soluções e transformação digital.',
  navigation: 'Navegação principal',
  aboutTitle: 'Sobre mim',
  aboutBody: 'Conteúdo profissional da apresentação será conectado nas próximas features.',
  experienceTitle: 'Experiências',
  experienceBody: 'As experiências profissionais serão apresentadas nesta seção.',
  stackTitle: 'Stack técnica',
  stackBody: 'As tecnologias e competências serão apresentadas nesta seção.',
  languageLabel: 'Idioma',
};

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
