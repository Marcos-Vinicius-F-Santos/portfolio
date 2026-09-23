import { InjectionToken } from '@angular/core';
import type { PortfolioCopy } from './portfolio-content';
export type PortfolioTranslations = Partial<PortfolioCopy>;

export const ENGLISH_COPY: PortfolioCopy = {
  eyebrow: 'Professional portfolio',
  intro: 'Software engineering, solution architecture and digital transformation.',
  navigation: 'Main navigation',
  aboutTitle: 'About me',
  aboutBody: 'Professional introduction content will be connected in upcoming features.',
  experienceTitle: 'Experience',
  experienceBody: 'Professional experience will be presented in this section.',
  stackTitle: 'Tech stack',
  stackBody: 'Technologies and skills will be presented in this section.',
  languageLabel: 'Language',
};

export const TRANSLATION_SOURCE = new InjectionToken<() => PortfolioTranslations>(
  'Portfolio translations',
  {
    providedIn: 'root',
    factory: () => () => ENGLISH_COPY,
  },
);
