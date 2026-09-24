import { DOCUMENT, NgTemplateOutlet } from '@angular/common';
import {
  afterNextRender,
  Component,
  computed,
  inject,
  signal,
  viewChild,
  ElementRef,
} from '@angular/core';
import {
  hasPortfolioSectionContent,
  ORIGINAL_COPY,
  PortfolioCopy,
  selectPortfolioCopy,
} from '../../content/portfolio-content';
import { PortfolioLanguageService } from '../../content/portfolio-language.service';
import { ENGLISH_COPY, TRANSLATION_SOURCE } from '../../content/portfolio-translations';
import { PortfolioContentService } from '../../content/portfolio-content.service';
import {
  hasPortfolioProjectContent,
  type PortfolioExperience,
  type PortfolioProject,
} from '../../content/portfolio-content.models';

type NavigationItem = {
  title: keyof PortfolioCopy;
  body: keyof PortfolioCopy;
  targetId: string;
  index: string;
};

type ProfessionalResultItem = {
  testId: string;
  label: keyof PortfolioCopy;
  value: keyof PortfolioCopy;
};

const PROFESSIONAL_RESULTS: readonly ProfessionalResultItem[] = [
  {
    testId: 'time-reduction',
    label: 'resultsTimeReductionLabel',
    value: 'resultsTimeReduction',
  },
  {
    testId: 'steps-reduction',
    label: 'resultsStepsReductionLabel',
    value: 'resultsStepsReduction',
  },
  {
    testId: 'users-served',
    label: 'resultsUsersServedLabel',
    value: 'resultsUsersServed',
  },
  {
    testId: 'productivity-gain',
    label: 'resultsProductivityGainLabel',
    value: 'resultsProductivityGain',
  },
];

@Component({
  selector: 'app-portfolio-page',
  imports: [NgTemplateOutlet],
  templateUrl: './portfolio-page.html',
  styleUrl: './portfolio-page.scss',
})
export class PortfolioPage {
  protected readonly language = inject(PortfolioLanguageService);
  private readonly translationSource = inject(TRANSLATION_SOURCE);
  private readonly content = inject(PortfolioContentService);
  protected readonly copy = computed(() => {
    const localCopy = selectPortfolioCopy(this.language.language(), this.translationSource);
    const remoteCopy = this.content.remoteCopy();
    return Object.keys(remoteCopy).length === 0 ? localCopy : { ...localCopy, ...remoteCopy };
  });
  protected readonly original = ORIGINAL_COPY;
  protected readonly english = ENGLISH_COPY;
  protected readonly showPresentation = computed(() =>
    hasPortfolioSectionContent(this.copy(), 'presentation'),
  );
  protected readonly showAbout = computed(() => hasPortfolioSectionContent(this.copy(), 'about'));
  protected readonly resultItems = computed(() => {
    const copy = this.copy();
    return PROFESSIONAL_RESULTS.filter((result) => copy[result.value].trim().length > 0);
  });
  protected readonly showResults = computed(() => this.resultItems().length > 0);
  protected readonly experiences = signal<PortfolioExperience[]>([]);
  protected readonly showExperiences = computed(() => this.experiences().length > 0);
  protected readonly projects = signal<PortfolioProject[]>([]);
  protected readonly professionalProjects = computed(() =>
    this.projects().filter((project) => project.type === 'professional'),
  );
  protected readonly personalProjects = computed(() =>
    this.projects().filter((project) => project.type === 'personal'),
  );
  protected readonly showProjects = computed(() => this.projects().length > 0);
  protected readonly navigationItems = computed(() => {
    const items: NavigationItem[] = [];

    if (this.showPresentation()) {
      items.push({
        title: 'presentationTitle',
        body: 'intro',
        targetId: 'apresentacao',
        index: '00',
      });
    }
    if (this.showAbout()) {
      items.push({ title: 'aboutTitle', body: 'aboutBody', targetId: 'sobre-mim', index: '01' });
    }

    items.push({ title: 'stackTitle', body: 'stackBody', targetId: 'stack-tecnica', index: '02' });
    if (this.showExperiences()) {
      items.push({
        title: 'experienceTitle',
        body: 'experienceBody',
        targetId: 'experiencias',
        index: '03',
      });
    }
    if (this.showResults()) {
      items.push({
        title: 'resultsTitle',
        body: 'resultsTitle',
        targetId: 'resultados-profissionais',
        index: '04',
      });
    }
    if (this.showProjects()) {
      items.push({
        title: 'projectsTitle',
        body: 'projectsTitle',
        targetId: 'projetos',
        index: '05',
      });
    }
    return items;
  });
  protected readonly sectionItems = computed(() =>
    this.navigationItems().filter((item) => item.targetId !== 'apresentacao'),
  );
  private readonly document = inject(DOCUMENT);
  private readonly suggestion = viewChild<ElementRef<HTMLDialogElement>>('suggestion');
  private readonly selector = viewChild<ElementRef<HTMLSelectElement>>('selector');

  constructor() {
    afterNextRender(() => {
      this.language.initialize();
      this.document.documentElement.lang = this.language.language();
      void this.content.loadCopy(this.language.language());
      void this.loadExperiences();
      void this.loadProjects();
      if (this.language.showSuggestion()) this.suggestion()?.nativeElement.showModal?.();
    });
  }

  private async loadExperiences(): Promise<void> {
    const experiences = await this.content.listExperiences(this.language.language());
    this.experiences.set(experiences);
  }

  private async loadProjects(): Promise<void> {
    const projects = await this.content.listProjects(this.language.language());
    this.projects.set(projects.filter(hasPortfolioProjectContent));
  }

  protected choose(language: string): void {
    if (language !== 'pt-BR' && language !== 'en') return;
    this.language.choose(language);
    this.document.documentElement.lang = this.language.language();
    void this.content.loadCopy(this.language.language());
    void this.loadExperiences();
    void this.loadProjects();
  }

  protected respond(accept: boolean): void {
    if (accept) this.language.acceptSuggestion();
    else this.language.declineSuggestion();
    this.document.documentElement.lang = this.language.language();
    void this.content.loadCopy(this.language.language());
    void this.loadExperiences();
    void this.loadProjects();
    this.suggestion()?.nativeElement.close?.();
    this.selector()?.nativeElement.focus({ preventScroll: true });
  }

  protected formatExperiencePeriod(experience: PortfolioExperience): string {
    return `${this.formatExperienceDate(experience.startDate)} – ${this.formatExperienceDate(experience.endDate)}`;
  }

  private formatExperienceDate(value: string | null): string {
    if (!value) return '';
    const [year, month] = value.slice(0, 10).split('-');
    return year && month ? `${month}/${year}` : '';
  }

  protected navigateToSection(event: Event, targetId: string): void {
    event.preventDefault();
    const target = this.document.getElementById(targetId);
    target?.scrollIntoView?.({ behavior: 'smooth', block: 'start' });
  }
}
