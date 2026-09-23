export type PortfolioLanguage = 'pt-BR' | 'en';

export interface LanguagePreference {
  language: PortfolioLanguage;
  declined: boolean;
}

export function classifyBrowserLanguage(value: unknown): PortfolioLanguage | 'other' | null {
  if (typeof value !== 'string' || !/^[a-z]{2,3}(?:-[a-z0-9]{2,8})*$/i.test(value)) {
    return null;
  }
  const base = value.toLowerCase().split('-')[0];
  return base === 'pt' ? 'pt-BR' : base === 'en' ? 'en' : 'other';
}
