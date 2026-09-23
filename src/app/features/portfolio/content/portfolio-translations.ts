import { InjectionToken } from '@angular/core';
import type { PortfolioCopy } from './portfolio-content';

export type PortfolioTranslations = Partial<PortfolioCopy>;

export const ENGLISH_COPY: PortfolioCopy = {
  eyebrow: 'Professional portfolio',
  presentationTitle: 'Presentation',
  intro:
    'Marcos Santos is a software engineer working across solution architecture, corporate integrations, process automation, and digital transformation. His work involves analyzing technical alternatives and trade-offs, creating reusable solutions, and contributing to scalable and sustainable systems through collaboration, adaptability, and empathy.',
  navigation: 'Main navigation',
  aboutTitle: 'About me',
  aboutBody:
    'I work across software engineering, architecture, integrations, automation, and digital transformation, pursuing reusable, scalable, and sustainable solutions. I value analyzing alternatives and trade-offs, collaboration, adaptability, and empathy.',
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
