import { DOCUMENT, NgTemplateOutlet } from '@angular/common';
import { getUiLabels } from '../../services/portfolio-ui-labels';
import { ContactPanelComponent } from '../../../../shared/components/contact-panel/contact-panel.component';
import type { ContactPanelDestinations } from '../../../../shared/components/contact-panel/contact-panel.models';
import { supabaseRuntimeConfig } from '../../../../core/config/supabase-runtime-config';
import { technologyIcon } from '../../services/technology-icons';
import {
  afterNextRender,
  Component,
  computed,
  DestroyRef,
  effect,
  HostListener,
  inject,
  signal,
  viewChild,
  ElementRef,
} from '@angular/core';
import {
  hasPortfolioSectionContent,
  ORIGINAL_COPY,
  PORTFOLIO_CONTACT_LINKS,
  PORTFOLIO_SKILL_CATEGORIES,
  PortfolioCopy,
  selectPortfolioCopy,
} from '../../services/portfolio-content';
import { PortfolioLanguageService } from '../../services/portfolio-language.service';
import { ENGLISH_COPY, TRANSLATION_SOURCE } from '../../services/portfolio-translations';
import { PortfolioContentService } from '../../services/portfolio-content.service';
import {
  hasPortfolioProjectCardContent,
  hasPortfolioProjectContent,
  type PortfolioFile,
  type PortfolioContactLink,
  type PortfolioProject,
  type PortfolioProjectImage,
  type PortfolioSkill,
  type PortfolioSkillCategory,
} from '../../services/portfolio-content.models';
import { ProjectCardComponent } from '../../../../shared/components/project-card/project-card.component';

type NavigationItem = {
  title: keyof PortfolioCopy;
  body: keyof PortfolioCopy;
  targetId: string;
};
const SECTION_ID_BY_TARGET: Readonly<Record<string, string>> = {
  apresentacao: 'presentation-section',
  'sobre-mim': 'about-section',
  'resultados-profissionais': 'results-section',
  'stack-tecnica': 'skills-section',
  portfolio: 'projects-section',
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

const STOPWORDS = new Set([
  'de',
  'da',
  'do',
  'das',
  'dos',
  'e',
  'of',
  'and',
  'the',
  'van',
  'von',
  'del',
  'der',
]);

const GENERIC_TITLES = new Set([
  'desenvolvedor de software',
  'desenvolvedor',
  'software engineer',
  'software developer',
  'engenheiro de software',
  'engenharia de software',
]);
const GENERIC_PROFILE_IMAGE = '/assets/profile/avatar-generic.svg';

export function extractBrandInitials(name: string | undefined | null, defaultInitials = 'PF'): string {
  const clean = name?.trim() || '';
  if (!clean || GENERIC_TITLES.has(clean.toLowerCase())) {
    return defaultInitials;
  }

  const words = clean
    .split(/\s+/)
    .map((w) => w.replace(/[^a-zA-ZÀ-ÿ]/g, ''))
    .filter((w) => w.length > 0 && !STOPWORDS.has(w.toLowerCase()));

  if (words.length === 0) return defaultInitials;
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

@Component({
  selector: 'app-portfolio-page',
  imports: [NgTemplateOutlet, ContactPanelComponent, ProjectCardComponent],
  templateUrl: './portfolio-page.component.html',
  styleUrl: './portfolio-page.component.css',
})
export class PortfolioPageComponent {
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
  protected readonly contactLinks = signal<PortfolioContactLink[]>([...PORTFOLIO_CONTACT_LINKS]);
  protected readonly contactDestinations = computed<ContactPanelDestinations>(() => {
    const links = this.contactLinks();
    const phone = links.find((l) => l.symbol === 'phone');
    const email = links.find((l) => l.symbol === 'email');
    const rawPhone = phone?.href ? phone.href.replace(/^tel:/i, '') : '';
    const whatsappNumber = rawPhone.replace(/\D/g, '');
    const emailAddress = email?.href ? email.href.replace(/^mailto:/i, '').trim() : '';
    return {
      whatsappNumber,
      email: emailAddress,
      web3FormsAccessKey: supabaseRuntimeConfig.web3FormsAccessKey,
    };
  });
  protected readonly showPresentation = computed(() =>
    hasPortfolioSectionContent(this.copy(), 'presentation'),
  );
  protected readonly showAbout = computed(() => hasPortfolioSectionContent(this.copy(), 'about'));
  protected readonly resultItems = computed(() => {
    const copy = this.copy();
    return PROFESSIONAL_RESULTS.filter((result) => copy[result.value].trim().length > 0);
  });
  protected readonly showResults = computed(() => this.resultItems().length > 0);
  protected readonly projects = signal<PortfolioProject[]>([]);
  protected readonly projectFilter = signal<'all' | 'professional' | 'personal'>('all');
  protected readonly filteredProjects = computed(() => {
    const filter = this.projectFilter();
    const all = this.projects();
    if (filter === 'all') return all;
    return all.filter((project) => project.type === filter);
  });
  protected setProjectFilter(filter: 'all' | 'professional' | 'personal'): void {
    this.projectFilter.set(filter);
  }
  protected readonly failedProjectImageIds = signal<Record<string, string[]>>({});
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
    if (this.showProjects() || this.editorialMode) {
      items.push({
        title: 'portfolioEyebrow',
        body: 'portfolioSubtitle',
        targetId: 'portfolio',
      });
    }
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
  private readonly destroyRef = inject(DestroyRef);
  private readonly suggestion = viewChild<ElementRef<HTMLDialogElement>>('suggestion');
  private readonly selector = viewChild<ElementRef<HTMLSelectElement>>('selector');

  protected readonly brandMonogram = computed(() => {
    const config = typeof globalThis !== 'undefined' ? globalThis.__PORTFOLIO_SUPABASE_CONFIG__ : undefined;
    const defaultInitials = config?.brandInitials?.trim() || 'PF';
    return extractBrandInitials(this.copy().name, defaultInitials);
  });
  protected readonly authorName = computed(() => {
    const config = typeof globalThis !== 'undefined' ? globalThis.__PORTFOLIO_SUPABASE_CONFIG__ : undefined;
    if (config?.authorName?.trim()) return config.authorName.trim();
    const copyHeroName = this.copy().heroName?.trim();
    if (copyHeroName && !GENERIC_TITLES.has(copyHeroName.toLowerCase())) {
      return copyHeroName;
    }
    const copyName = this.copy().name?.trim();
    if (copyName && !GENERIC_TITLES.has(copyName.toLowerCase())) {
      return copyName;
    }
    return 'Desenvolvedor de Software';
  });
  protected readonly profileImageFailed = signal(false);
  protected readonly profileImageUrl = computed(() => {
    if (this.profileImageFailed()) return GENERIC_PROFILE_IMAGE;
    const config =
      typeof globalThis !== 'undefined' ? globalThis.__PORTFOLIO_SUPABASE_CONFIG__ : undefined;
    const configuredUrl = config?.profileImageUrl?.trim();
    if (configuredUrl) return configuredUrl;
    const profileIdentity = (
      this.content as PortfolioContentService & {
        profileIdentity?: () => { imageUrl?: string } | null;
      }
    ).profileIdentity?.();
    return profileIdentity?.imageUrl?.trim() || GENERIC_PROFILE_IMAGE;
  });
  protected onProfileImageError(): void {
    this.profileImageFailed.set(true);
  }
  protected readonly ui = computed(() => getUiLabels(this.language.language()));
  protected readonly roleSubtitle = computed(() => {
    return this.copy().heroRole?.trim() || (this.language.language() === 'en' ? 'Software Engineer' : 'Engenheiro de Software');
  });
  protected readonly heroAvailability = computed(() => {
    return this.copy().heroAvailability?.trim() || (this.language.language() === 'en' ? 'Open to new opportunities · Remote' : 'Disponível para novos projetos · Remoto');
  });
  protected readonly cvMenuOpen = signal(false);
  protected readonly languageMenuOpen = signal(false);
  protected readonly mobileMenuOpen = signal(false);
  protected readonly activeSectionId = signal<string>('apresentacao');
  private scrollRafId: number | null = null;
  private scrollCleanups: Array<() => void> = [];

  constructor() {
    effect(() => {
      const revision = this.editorialContentRevision?.() ?? 0;
      if (revision > 0) void this.reloadEditableContent();
    });
    afterNextRender(() => {
      this.language.initialize();
      this.document.documentElement.lang = this.language.language();
      void this.content.loadCopy(this.language.language());
      void this.loadProjects();
      void this.loadCurriculum();
      void this.loadEditableCatalogs();
      void this.loadSectionOrder();
      if (this.language.showSuggestion()) this.suggestion()?.nativeElement.showModal?.();
      this.initScrollSpy();
    });
  }
  private async reloadEditableContent(): Promise<void> {
    await Promise.all([this.loadProjects(), this.loadEditableCatalogs()]);
  }
  private async loadSectionOrder(): Promise<void> {
    const content = this.content as PortfolioContentService & {
      listSectionOrder?: () => Promise<string[]>;
    };
    if (typeof content.listSectionOrder === 'function')
      this.sectionOrder.set(await content.listSectionOrder());
  }

  private async loadProjects(): Promise<void> {
    const projects = await this.content.listProjects(this.language.language());
    this.failedProjectImageIds.set({});
    this.projects.set(this.editorialMode ? projects : projects.filter(hasPortfolioProjectCardContent));
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
      listContactLinks?: PortfolioContentService['listContactLinks'];
    };
    const [skills, contacts] = await Promise.all([
      typeof content.listSkillCategories === 'function'
        ? content.listSkillCategories(locale)
        : Promise.resolve([...PORTFOLIO_SKILL_CATEGORIES]),
      typeof content.listContactLinks === 'function'
        ? content.listContactLinks(locale)
        : Promise.resolve([...PORTFOLIO_CONTACT_LINKS]),
    ]);
    if (locale !== this.language.language()) return;
    this.skillCategories.set(skills);
    this.contactLinks.set(contacts);
  }

  protected choose(language: string): void {
    if (language !== 'pt-BR' && language !== 'en') return;
    this.language.choose(language);
    this.document.documentElement.lang = this.language.language();
    void this.content.loadCopy(this.language.language());
    void this.loadProjects();
    void this.loadCurriculum();
    void this.loadEditableCatalogs();
    this.closeAllMenus();
  }

  protected respond(accept: boolean): void {
    if (accept) this.language.acceptSuggestion();
    else this.language.declineSuggestion();
    this.document.documentElement.lang = this.language.language();
    void this.content.loadCopy(this.language.language());
    void this.loadProjects();
    void this.loadCurriculum();
    void this.loadEditableCatalogs();
    this.suggestion()?.nativeElement.close?.();
    this.selector()?.nativeElement.focus({ preventScroll: true });
  }

  protected curriculumLabelKey(): keyof PortfolioCopy {
    return this.language.language() === 'en'
      ? 'contactCurriculumEnLabel'
      : 'contactCurriculumPtLabel';
  }

  protected skillCategoryLabel(category: PortfolioSkillCategory): string {
    return category.label?.trim() || this.copy()[category.labelKey as keyof PortfolioCopy] || '';
  }

  protected contactLinkLabel(link: PortfolioContactLink): string {
    return link.label?.trim() || this.copy()[link.labelKey as keyof PortfolioCopy] || '';
  }

  protected platformDisplayValue(link: PortfolioContactLink): string {
    if (!link.href) return '';
    if (link.symbol === 'email') return link.href.replace(/^mailto:/i, '');
    if (link.symbol === 'phone') {
      const num = link.href.replace(/^tel:/i, '');
      return num.startsWith('+55') && num.length >= 13
        ? `${num.slice(0, 3)} (${num.slice(3, 5)}) ${num.slice(5, 10)}-${num.slice(10)}`
        : num;
    }
    if (link.symbol === 'linkedin') {
      return link.href.replace(/^https?:\/\/(www\.)?/i, '').replace(/\/$/, '');
    }
    if (link.symbol === 'github') {
      return link.href.replace(/^https?:\/\/(www\.)?/i, '').replace(/\/$/, '');
    }
    return link.href;
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

  protected projectGalleryImages(project: PortfolioProject): PortfolioProjectImage[] {
    const failedIds = new Set(this.failedProjectImageIds()[project.id] ?? []);
    return [...project.images]
      .filter((image) => image.publicUrl.trim().length > 0 && !failedIds.has(image.id))
      .sort((left, right) => left.displayOrder - right.displayOrder);
  }

  protected onProjectCoverImageError(projectId: string, imageId: string): void {
    this.failedProjectImageIds.update((current) => ({
      ...current,
      [projectId]: [...new Set([...(current[projectId] ?? []), imageId])],
    }));
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    this.closeAllMenus();
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.closeAllMenus();
  }

  protected toggleCvMenu(event?: Event): void {
    event?.stopPropagation();
    this.cvMenuOpen.update((open) => !open);
    if (this.cvMenuOpen()) {
      this.languageMenuOpen.set(false);
    }
  }

  protected toggleLanguageMenu(event?: Event): void {
    event?.stopPropagation();
    this.languageMenuOpen.update((open) => !open);
    if (this.languageMenuOpen()) {
      this.cvMenuOpen.set(false);
    }
  }

  protected toggleMobileMenu(event?: Event): void {
    event?.stopPropagation();
    this.mobileMenuOpen.update((open) => !open);
    if (this.mobileMenuOpen()) {
      this.cvMenuOpen.set(false);
      this.languageMenuOpen.set(false);
    }
  }

  protected closeAllMenus(): void {
    this.cvMenuOpen.set(false);
    this.languageMenuOpen.set(false);
    this.mobileMenuOpen.set(false);
  }

  private isNavigating = false;
  private navigatingTimeout: ReturnType<typeof setTimeout> | null = null;

  private startNavigatingLock(targetId: string): void {
    this.activeSectionId.set(targetId);
    this.isNavigating = true;

    if (this.navigatingTimeout) {
      clearTimeout(this.navigatingTimeout);
      this.navigatingTimeout = null;
    }

    const win = this.document.defaultView;
    if (win) {
      const unlock = () => {
        this.isNavigating = false;
        if (this.navigatingTimeout) {
          clearTimeout(this.navigatingTimeout);
          this.navigatingTimeout = null;
        }
        win.removeEventListener('scrollend', unlock);
        win.removeEventListener('wheel', unlock);
        win.removeEventListener('touchmove', unlock);
        this.computeActiveSectionByPosition();
      };

      win.addEventListener('scrollend', unlock, { once: true });
      win.addEventListener('wheel', unlock, { once: true, passive: true });
      win.addEventListener('touchmove', unlock, { once: true, passive: true });

      this.navigatingTimeout = setTimeout(unlock, 900);
    }
  }

  protected computeActiveSectionByPosition(): void {
    const win = this.document.defaultView;
    if (!win) return;

    const items = this.navigationItems();
    if (items.length === 0) return;

    const scrollY = win.scrollY ?? win.pageYOffset ?? 0;
    const innerHeight = win.innerHeight || 800;
    const scrollHeight = this.document.documentElement.scrollHeight || 1000;

    // 1. Boundary: User is near the top of the page
    if (scrollY < 80) {
      const firstTarget = items[0]?.targetId;
      if (firstTarget && this.activeSectionId() !== firstTarget) {
        this.activeSectionId.set(firstTarget);
      }
      return;
    }

    // 2. Boundary: User is near the bottom of the page
    if (scrollY + innerHeight >= scrollHeight - 50) {
      const lastTarget = items[items.length - 1]?.targetId;
      if (lastTarget && this.activeSectionId() !== lastTarget) {
        this.activeSectionId.set(lastTarget);
      }
      return;
    }

    // 3. Focal zone: calculate section by its vertical bounding rect relative to the comfortable reading line
    const focalLine = Math.max(120, Math.min(220, Math.floor(innerHeight * 0.25)));
    let activeTargetId = items[0].targetId;

    for (const item of items) {
      const el = this.document.getElementById(item.targetId);
      if (!el) continue;
      const rect = el.getBoundingClientRect();
      if (rect.height === 0 && rect.width === 0) continue;

      if (rect.top <= focalLine) {
        activeTargetId = item.targetId;
      } else {
        break;
      }
    }

    if (this.activeSectionId() !== activeTargetId) {
      this.activeSectionId.set(activeTargetId);
    }
  }

  private initScrollSpy(): void {
    const win = this.document.defaultView;
    if (!win) return;

    const onScrollOrResize = () => {
      if (this.isNavigating) return;
      if (this.scrollRafId !== null) return;
      this.scrollRafId = win.requestAnimationFrame(() => {
        this.scrollRafId = null;
        this.computeActiveSectionByPosition();
      });
    };

    win.addEventListener('scroll', onScrollOrResize, { passive: true });
    win.addEventListener('resize', onScrollOrResize, { passive: true });

    this.scrollCleanups.push(() => {
      win.removeEventListener('scroll', onScrollOrResize);
      win.removeEventListener('resize', onScrollOrResize);
      if (this.scrollRafId !== null) {
        win.cancelAnimationFrame(this.scrollRafId);
        this.scrollRafId = null;
      }
    });

    this.destroyRef.onDestroy(() => {
      this.scrollCleanups.forEach((cleanup) => cleanup());
      this.scrollCleanups = [];
      if (this.navigatingTimeout) {
        clearTimeout(this.navigatingTimeout);
        this.navigatingTimeout = null;
      }
    });

    this.computeActiveSectionByPosition();
  }

  protected async downloadCurriculum(locale: 'pt-BR' | 'en'): Promise<void> {
    this.closeAllMenus();
    const file = await this.content.getCurriculum(locale);
    const fallbackUrl = locale === 'pt-BR' ? '/curriculum-pt.pdf' : '/curriculum-en.pdf';
    const url = file?.publicUrl || fallbackUrl;
    const filename =
      file?.originalName || (locale === 'pt-BR' ? 'Curriculo.pdf' : 'Curriculum.pdf');
    const a = this.document.createElement('a');
    a.href = url;
    a.download = filename;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    this.document.body.appendChild(a);
    a.click();
    a.remove();
  }

  protected scrollToTop(event: Event): void {
    event.preventDefault();
    this.startNavigatingLock('apresentacao');
    this.closeAllMenus();
    const target = this.document.getElementById('apresentacao');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      this.document.defaultView?.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  protected navigateToSection(event: Event, targetId: string): void {
    event.preventDefault();
    this.startNavigatingLock(targetId);
    this.closeAllMenus();
    const target = this.document.getElementById(targetId);
    target?.scrollIntoView?.({ behavior: 'smooth', block: 'start' });
  }
}
