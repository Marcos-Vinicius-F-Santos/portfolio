import { DOCUMENT, NgTemplateOutlet } from '@angular/common';
import { ProjectTechnologies } from '../projects/project-technologies';
import { ContactPanel } from '../contact-panel/contact-panel';
import { technologyIcon } from '../../content/technology-icons';
import {
  afterNextRender,
  Component,
  computed,
  effect,
  inject,
  signal,
  viewChild,
  ElementRef,
} from '@angular/core';
import {
  hasPortfolioSectionContent,
  ORIGINAL_COPY,
  PORTFOLIO_ACADEMIC_ENTRIES,
  PORTFOLIO_CONTACT_LINKS,
  PORTFOLIO_SKILL_CATEGORIES,
  PortfolioCopy,
  selectPortfolioCopy,
} from '../../content/portfolio-content';
import { PortfolioLanguageService } from '../../content/portfolio-language.service';
import { ENGLISH_COPY, TRANSLATION_SOURCE } from '../../content/portfolio-translations';
import { PortfolioContentService } from '../../content/portfolio-content.service';
import {
  hasPortfolioProjectContent,
  type PortfolioFile,
  type PortfolioExperience,
  type PortfolioAcademicEntry,
  type PortfolioContactLink,
  type PortfolioProject,
  type PortfolioSkill,
  type PortfolioSkillCategory,
} from '../../content/portfolio-content.models';

type NavigationItem = {
  title: keyof PortfolioCopy;
  body: keyof PortfolioCopy;
  targetId: string;
};
const SECTION_ID_BY_TARGET: Readonly<Record<string, string>> = {
  apresentacao: 'presentation-section',
  'sobre-mim': 'about-section',
  'resultados-profissionais': 'results-section',
  experiencias: 'experiences-section',
  'stack-tecnica': 'skills-section',
  'formacao-academica': 'education-section',
  projetos: 'projects-section',
  contato: 'contact-section',
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
  imports: [NgTemplateOutlet, ProjectTechnologies, ContactPanel],
  templateUrl: './portfolio-page.html',
  styleUrl: './portfolio-page.scss',
})
export class PortfolioPage {
  protected readonly sectionIdByTarget = SECTION_ID_BY_TARGET;
  protected readonly language = inject(PortfolioLanguageService);
  private readonly translationSource = inject(TRANSLATION_SOURCE);
  private readonly content = inject(PortfolioContentService);
  private readonly editorialSectionOrder = (
    this.content as PortfolioContentService & { editorialSectionOrder?: () => string[] }
  ).editorialSectionOrder;
  private readonly editorialContentRevision = (
    this.content as PortfolioContentService & { editorialContentRevision?: () => number }
  ).editorialContentRevision;
  protected readonly editorialMode = Boolean(this.editorialContentRevision);
  protected readonly copy = computed(() => {
    const localCopy = selectPortfolioCopy(this.language.language(), this.translationSource);
    const remoteCopy = this.content.remoteCopy();
    return Object.keys(remoteCopy).length === 0 ? localCopy : { ...localCopy, ...remoteCopy };
  });
  protected readonly original = ORIGINAL_COPY;
  protected readonly english = ENGLISH_COPY;
  protected readonly skillCategories = signal<PortfolioSkillCategory[]>([
    ...PORTFOLIO_SKILL_CATEGORIES,
  ]);
  protected readonly academicEntries = signal<PortfolioAcademicEntry[]>([
    ...PORTFOLIO_ACADEMIC_ENTRIES,
  ]);
  protected readonly contactLinks = signal<PortfolioContactLink[]>([...PORTFOLIO_CONTACT_LINKS]);
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
  protected readonly curriculum = signal<PortfolioFile | null>(null);
  protected readonly professionalProjects = computed(() =>
    this.projects().filter((project) => project.type === 'professional'),
  );
  protected readonly personalProjects = computed(() =>
    this.projects().filter((project) => project.type === 'personal'),
  );
  protected readonly showProjects = computed(() => this.projects().length > 0);
  private readonly sectionOrder = signal<string[]>(Object.values(SECTION_ID_BY_TARGET));
  protected readonly navigationItems = computed(() => {
    const items: NavigationItem[] = [];

    if (this.showPresentation()) {
      items.push({
        title: 'presentationTitle',
        body: 'intro',
        targetId: 'apresentacao',
      });
    }
    if (this.showAbout()) {
      items.push({ title: 'aboutTitle', body: 'aboutBody', targetId: 'sobre-mim' });
    }

    items.push({ title: 'stackTitle', body: 'stackBody', targetId: 'stack-tecnica' });
    if (this.showExperiences() || this.editorialMode) {
      items.push({
        title: 'experienceTitle',
        body: 'experienceBody',
        targetId: 'experiencias',
      });
    }
    if (this.showResults()) {
      items.push({
        title: 'resultsTitle',
        body: 'resultsTitle',
        targetId: 'resultados-profissionais',
      });
    }
    if (this.showProjects() || this.editorialMode) {
      items.push({
        title: 'projectsTitle',
        body: 'projectsTitle',
        targetId: 'projetos',
      });
    }
    items.push({
      title: 'educationTitle',
      body: 'educationBody',
      targetId: 'formacao-academica',
    });
    items.push({
      title: 'contactTitle',
      body: 'contactBody',
      targetId: 'contato',
    });
    const order = this.editorialSectionOrder?.() ?? this.sectionOrder();
    return items.sort(
      (a, b) =>
        order.indexOf(SECTION_ID_BY_TARGET[a.targetId]) -
        order.indexOf(SECTION_ID_BY_TARGET[b.targetId]),
    );
  });
  protected readonly sectionItems = computed(() =>
    this.navigationItems().filter((item) => item.targetId !== 'apresentacao'),
  );
  private readonly document = inject(DOCUMENT);
  private readonly suggestion = viewChild<ElementRef<HTMLDialogElement>>('suggestion');
  private readonly selector = viewChild<ElementRef<HTMLSelectElement>>('selector');

  constructor() {
    effect(() => {
      const revision = this.editorialContentRevision?.() ?? 0;
      if (revision > 0) void this.reloadEditableContent();
    });
    afterNextRender(() => {
      this.language.initialize();
      this.document.documentElement.lang = this.language.language();
      void this.content.loadCopy(this.language.language());
      void this.loadExperiences();
      void this.loadProjects();
      void this.loadCurriculum();
      void this.loadEditableCatalogs();
      void this.loadSectionOrder();
      if (this.language.showSuggestion()) this.suggestion()?.nativeElement.showModal?.();
    });
  }
  private async reloadEditableContent(): Promise<void> {
    await Promise.all([this.loadExperiences(), this.loadProjects(), this.loadEditableCatalogs()]);
  }
  private async loadSectionOrder(): Promise<void> {
    const content = this.content as PortfolioContentService & {
      listSectionOrder?: () => Promise<string[]>;
    };
    if (typeof content.listSectionOrder === 'function')
      this.sectionOrder.set(await content.listSectionOrder());
  }

  private async loadExperiences(): Promise<void> {
    const experiences = await this.content.listExperiences(this.language.language());
    this.experiences.set(experiences);
  }

  private async loadProjects(): Promise<void> {
    const projects = await this.content.listProjects(this.language.language());
    this.projects.set(this.editorialMode ? projects : projects.filter(hasPortfolioProjectContent));
  }

  private async loadCurriculum(): Promise<void> {
    const locale = this.language.language();
    const curriculum = await this.content.getCurriculum(locale);
    if (locale === this.language.language()) {
      this.curriculum.set(curriculum);
    }
  }

  private async loadEditableCatalogs(): Promise<void> {
    const locale = this.language.language();
    const content = this.content as PortfolioContentService & {
      listSkillCategories?: PortfolioContentService['listSkillCategories'];
      listAcademicEntries?: PortfolioContentService['listAcademicEntries'];
      listContactLinks?: PortfolioContentService['listContactLinks'];
    };
    const [skills, academic, contacts] = await Promise.all([
      typeof content.listSkillCategories === 'function'
        ? content.listSkillCategories(locale)
        : Promise.resolve([...PORTFOLIO_SKILL_CATEGORIES]),
      typeof content.listAcademicEntries === 'function'
        ? content.listAcademicEntries(locale)
        : Promise.resolve([...PORTFOLIO_ACADEMIC_ENTRIES]),
      typeof content.listContactLinks === 'function'
        ? content.listContactLinks(locale)
        : Promise.resolve([...PORTFOLIO_CONTACT_LINKS]),
    ]);
    if (locale !== this.language.language()) return;
    this.skillCategories.set(skills);
    this.academicEntries.set(academic);
    this.contactLinks.set(contacts);
  }

  protected choose(language: string): void {
    if (language !== 'pt-BR' && language !== 'en') return;
    this.language.choose(language);
    this.document.documentElement.lang = this.language.language();
    void this.content.loadCopy(this.language.language());
    void this.loadExperiences();
    void this.loadProjects();
    void this.loadCurriculum();
    void this.loadEditableCatalogs();
  }

  protected respond(accept: boolean): void {
    if (accept) this.language.acceptSuggestion();
    else this.language.declineSuggestion();
    this.document.documentElement.lang = this.language.language();
    void this.content.loadCopy(this.language.language());
    void this.loadExperiences();
    void this.loadProjects();
    void this.loadCurriculum();
    void this.loadEditableCatalogs();
    this.suggestion()?.nativeElement.close?.();
    this.selector()?.nativeElement.focus({ preventScroll: true });
  }

  protected formatExperiencePeriod(experience: PortfolioExperience): string {
    return `${this.formatExperienceDate(experience.startDate)} – ${this.formatExperienceDate(experience.endDate)}`;
  }

  protected curriculumLabelKey(): keyof PortfolioCopy {
    return this.language.language() === 'en'
      ? 'contactCurriculumEnLabel'
      : 'contactCurriculumPtLabel';
  }

  protected skillCategoryLabel(category: PortfolioSkillCategory): string {
    return category.label?.trim() || this.copy()[category.labelKey as keyof PortfolioCopy] || '';
  }

  protected academicEntryName(entry: PortfolioAcademicEntry): string {
    return entry.name?.trim() || this.copy()[entry.nameKey as keyof PortfolioCopy] || '';
  }

  protected contactLinkLabel(link: PortfolioContactLink): string {
    return link.label?.trim() || this.copy()[link.labelKey as keyof PortfolioCopy] || '';
  }

  protected academicPeriod(entry: PortfolioAcademicEntry): string {
    const start = this.formatAcademicDate(entry.startDate);
    if (entry.isCurrent) return `${start} – ${this.copy().educationCurrentLabel}`;
    const end = this.formatAcademicDate(entry.endDate);
    return start && end ? `${start} – ${end}` : start || end;
  }

  protected listText(values: string[] | undefined): string {
    return (values ?? []).filter(Boolean).join(' · ');
  }

  protected skillIcon(skill: PortfolioSkill): string | null {
    return skill.iconPublicUrl || skill.iconUrl || technologyIcon(skill.name) || null;
  }

  protected onSkillIconError(event: Event, skill: PortfolioSkill): void {
    const image = event.currentTarget as HTMLImageElement;
    if (skill.iconUrl && image.src !== skill.iconUrl) {
      image.src = skill.iconUrl;
      return;
    }
    image.hidden = true;
  }

  private formatExperienceDate(value: string | null): string {
    if (!value) return '';
    const [year, month] = value.slice(0, 10).split('-');
    return year && month ? `${month}/${year}` : '';
  }

  private formatAcademicDate(value: string | null | undefined): string {
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
