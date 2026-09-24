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
  experiencePeriodLabel: 'Period',
  experienceContextLabel: 'Context',
  experienceResponsibilitiesLabel: 'Responsibilities',
  experienceTechnicalDecisionsLabel: 'Technical decisions',
  experienceResultsLabel: 'Results',
  stackTitle: 'Tech stack',
  stackBody: 'Technologies and skills will be presented in this section.',
  languageLabel: 'Language',
  resultsTitle: 'Professional results',
  resultsTimeReductionLabel: 'Time reduction',
  resultsTimeReduction:
    'Onboarding reduced from days to hours; 30% reduction in task completion time.',
  resultsStepsReductionLabel: 'Step reduction',
  resultsStepsReduction: 'Manual steps reduced from 8–10 to 3–5.',
  resultsUsersServedLabel: 'Users served',
  resultsUsersServed: 'Platform used by more than 2,000 monthly users.',
  resultsProductivityGainLabel: 'Productivity gains',
  resultsProductivityGain:
    'Approximately 50% reduction in JSON mapping effort; 25% reduction in form change requests.',
  projectsTitle: 'Projects',
  professionalProjectsTitle: 'Professional projects',
  personalProjectsTitle: 'Personal projects',
  projectDescriptionLabel: 'Description',
  projectContextLabel: 'Context',
  projectRoleLabel: 'Role',
  projectTechnicalDecisionsLabel: 'Technical decisions',
  projectTechnologiesLabel: 'Technologies',
  projectResultsLabel: 'Results',
  projectLearningsLabel: 'Learnings',
  projectLinksLabel: 'Related links',
};

export const TRANSLATION_SOURCE = new InjectionToken<() => PortfolioTranslations>(
  'Portfolio translations',
  {
    providedIn: 'root',
    factory: () => () => ENGLISH_COPY,
  },
);
