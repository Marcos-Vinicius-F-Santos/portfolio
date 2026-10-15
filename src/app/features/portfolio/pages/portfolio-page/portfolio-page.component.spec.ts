import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { PortfolioPageComponent, extractBrandInitials } from './portfolio-page.component';
import {
  BROWSER_LANGUAGE,
  PortfolioLanguageService,
} from '../../services/portfolio-language.service';
import { TRANSLATION_SOURCE } from '../../services/portfolio-translations';
import {
  ORIGINAL_COPY,
  type PortfolioCopy,
} from '../../services/portfolio-content';
import { PortfolioContentService } from '../../services/portfolio-content.service';
import type {
  PortfolioContactLink,
  PortfolioFile,
  PortfolioProject,
  PortfolioProjectImage,
} from '../../services/portfolio-content.models';
import { ENGLISH_COPY } from '../../services/portfolio-translations';

let projectRows: PortfolioProject[] = [];
let curriculumRows: Partial<Record<'pt-BR' | 'en', PortfolioFile | null>> = {};
const editorialOrder = signal<string[]>([]);
const TEST_CONTACT_LINKS: PortfolioContactLink[] = [
  { id: 'linkedin', labelKey: 'contactLinkedinLabel', href: 'https://example.com/network', symbol: 'linkedin', iconPath: '/assets/contact/linkedin.svg' },
  { id: 'github', labelKey: 'contactGithubLabel', href: 'https://github.com/example', symbol: 'github', iconPath: '/assets/contact/github.svg' },
  { id: 'email', labelKey: 'contactEmailLabel', href: 'mailto:contact@example.com', symbol: 'email', iconPath: '/assets/contact/email.svg' },
  { id: 'phone', labelKey: 'contactPhoneLabel', href: 'tel:+5511999990000', symbol: 'phone', iconPath: '/assets/contact/phone.svg' },
];

describe('PortfolioPage', () => {
  beforeEach(async () => {
    localStorage.clear();
    projectRows = [];
    curriculumRows = {};
    editorialOrder.set([]);
    const contentService = {
      remoteCopy: signal<Partial<PortfolioCopy>>({}),
      editorialSectionOrder: editorialOrder,
      loadCopy: vi.fn(async () => ({})),
      listProjects: vi.fn(async (locale: 'pt-BR' | 'en') =>
        projectRows.map((project) => ({
          ...project,
          locale,
          name: locale === 'en' ? 'English ' + project.name : project.name,
          description: locale === 'en' ? 'English description' : project.description,
          problemContext: locale === 'en' ? 'English context' : project.problemContext,
          role: locale === 'en' ? 'English role' : project.role,
          technicalDecisions: locale === 'en' ? ['English decision'] : project.technicalDecisions,
          technologies: locale === 'en' ? ['English technology'] : project.technologies,
          results: locale === 'en' ? ['English result'] : project.results,
          learnings: locale === 'en' ? ['English learning'] : project.learnings,
        })),
      ),
      getCurriculum: vi.fn(async (locale: 'pt-BR' | 'en') => curriculumRows[locale] ?? null),
      listContactLinks: vi.fn(async () => TEST_CONTACT_LINKS),
    };
    await TestBed.configureTestingModule({
      imports: [PortfolioPageComponent],
      providers: [
        { provide: BROWSER_LANGUAGE, useValue: () => 'pt-BR' },
        { provide: PortfolioContentService, useValue: contentService },
      ],
    }).compileComponents();
  });

  async function render() {
    const fixture = TestBed.createComponent(PortfolioPageComponent);
    await fixture.whenStable();
    return { fixture, element: fixture.nativeElement as HTMLElement };
  }

  it('renders the presentation, about, and existing sections with stable navigation targets', async () => {
    const { fixture, element } = await render();
    const sections = [...element.querySelectorAll('.sections > section')];
    for (const language of ['en', 'pt-BR'] as const) {
      TestBed.inject(PortfolioLanguageService).choose(language);
      await fixture.whenStable();
      expect(element.querySelector('#apresentacao')).toBeTruthy();
      for (const id of ['sobre-mim', 'stack-tecnica', 'contato']) {
        expect(element.querySelector('#' + id)).toBeTruthy();
        expect(element.querySelector(`a[href="#${id}"]`)).toBeTruthy();
      }
      expect(element.querySelector('#resultados-profissionais')).toBeNull();
      expect(element.querySelector('a[href="#apresentacao"]')).toBeTruthy();
      expect([...element.querySelectorAll('.sections > section')]).toEqual(sections);
      expect([...element.querySelectorAll('.sections > section')].map((section) => section.id)).toEqual([
        'sobre-mim',
        'stack-tecnica',
        'contato',
      ]);
      expect(element.querySelectorAll('nav a')).toHaveLength(4);
    }
  });

  it('renders the navigation in the site header instead of the presentation block', async () => {
    const { element } = await render();

    expect(element.querySelector('.site-header nav')).toBeTruthy();
    expect(element.querySelector('.page-header nav')).toBeNull();
    expect(element.querySelectorAll('.site-header nav a')).toHaveLength(4);
  });

  it('aplica a mesma ordem editorial às seções e ao menu', async () => {
    editorialOrder.set([
      'presentation-section',
      'skills-section',
      'about-section',
      'results-section',
      'contact-section',
    ]);
    const { element } = await render();
    expect(
      [...element.querySelectorAll('.sections > section')].map((section) => section.id).slice(0, 2),
    ).toEqual(['stack-tecnica', 'sobre-mim']);
    expect(
      [...element.querySelectorAll('.site-header nav a')]
        .map((link) => link.getAttribute('href'))
        .slice(0, 3),
    ).toEqual(['#apresentacao', '#stack-tecnica', '#sobre-mim']);
  });

  it('renders the approved skills, contact links and curriculum', async () => {
    curriculumRows = {
      'pt-BR': createCurriculum('pt-BR'),
      en: createCurriculum('en'),
    };
    const { element } = await render();

    expect(element.querySelector('.hero-name')?.textContent).toContain(ORIGINAL_COPY.heroName);
    expect(element.querySelector('.hero-subtitle')?.textContent).toContain('Engenheiro de Software');
    expect(element.querySelector('.eyebrow')).toBeNull();
    expect(element.querySelector('#stack-tecnica h2')?.textContent).toContain('Habilidades');
    expect(element.querySelectorAll('.skill-category')).toHaveLength(6);
    expect(
      element.querySelector('[data-testid="skills-languages-runtime"]')?.textContent,
    ).toContain('JavaScript');
    expect(element.querySelector('#formacao-academica')).toBeNull();
    expect(element.querySelector('a[href="#formacao-academica"]')).toBeNull();
    expect(element.querySelector('#contato')).toBeTruthy();
    expect([...element.querySelectorAll('.sections > section')].at(-1)?.id).toBe('contato');
    expect(
      (element.querySelector('[data-testid="contact-linkedin"]') as HTMLAnchorElement).href,
    ).toBe(TEST_CONTACT_LINKS.find((l) => l.symbol === 'linkedin')?.href);
    expect(
      (element.querySelector('[data-testid="contact-github"]') as HTMLAnchorElement).href,
    ).toBe(TEST_CONTACT_LINKS.find((l) => l.symbol === 'github')?.href);
    expect((element.querySelector('[data-testid="contact-email"]') as HTMLAnchorElement).href).toBe(
      TEST_CONTACT_LINKS.find((l) => l.symbol === 'email')?.href,
    );
    expect((element.querySelector('[data-testid="contact-phone"]') as HTMLAnchorElement).href).toBe(
      TEST_CONTACT_LINKS.find((l) => l.symbol === 'phone')?.href,
    );
    expect(element.querySelector('[data-testid="contact-links"]')?.textContent).toContain(
      'LinkedIn',
    );
    expect(element.querySelector('[data-testid="contact-panel"]')).toBeTruthy();
    expect(element.querySelector('#contact-panel-title')?.textContent).toContain(
      'Fale comigo',
    );
    expect(
      element.querySelectorAll('[data-testid="compact-contact-links"] .compact-contact-link'),
    ).toHaveLength(4);
    const heroContactBtn = element.querySelector('[data-testid="hero-contact-button"]') as HTMLAnchorElement;
    expect(heroContactBtn).toBeTruthy();
    expect(heroContactBtn.getAttribute('href')).toBe('#contato');
    expect(element.querySelectorAll('.section-index')).toHaveLength(0);
    const contactContent = element.querySelector('#contato')!;
    expect(contactContent.querySelector('.contact-intro-header .contact-explanation')).toBeTruthy();
    expect(contactContent.querySelector('.contact-left-col .contact-explanation')).toBeNull();
    expect(
      [...contactContent.querySelectorAll('[data-testid="contact-links"], [data-testid="contact-panel"], [data-testid="contact-curriculum"]')].map(
        (node) => node.getAttribute('data-testid'),
      ),
    ).toEqual(['contact-links', 'contact-curriculum', 'contact-panel']);
    expect(element.querySelector('app-contact-panel.contact-panel-layout')).toBeTruthy();
    expect(
      (element.querySelector('[data-testid="contact-curriculum"]') as HTMLAnchorElement).href,
    ).toBe('https://storage.test/curriculum-pt-BR.pdf');
  });

  it('switches the curriculum and translated labels with the selected language', async () => {
    curriculumRows = {
      'pt-BR': createCurriculum('pt-BR'),
      en: createCurriculum('en'),
    };
    const { fixture, element } = await render();
    const select = element.querySelector('select')!;
    select.value = 'en';
    select.dispatchEvent(new Event('change'));
    await fixture.whenStable();

    expect(element.querySelector('.hero-subtitle')?.textContent).toContain('Software Engineer');
    expect(element.querySelector('#stack-tecnica h2')?.textContent).toContain('Skills');
    expect(element.querySelector('#formacao-academica')).toBeNull();
    expect(element.querySelector('#contact-panel-title')?.textContent).toContain(
      'Get in touch',
    );
    expect(
      (element.querySelector('#contact-panel-name') as HTMLInputElement).placeholder,
    ).toBe('Your name');
    expect(
      (element.querySelector('[data-testid="contact-curriculum"]') as HTMLAnchorElement).href,
    ).toBe('https://storage.test/curriculum-en.pdf');
  });

  it('keeps contact usable when the selected curriculum is unavailable', async () => {
    curriculumRows = { 'pt-BR': null };
    const { element } = await render();

    expect(element.querySelector('#contato')).toBeTruthy();
    expect(element.querySelector('[data-testid="contact-curriculum"]')).toBeNull();
    expect(element.querySelector('[data-testid="contact-linkedin"]')).toBeTruthy();
  });

  it.each([
    'apresentacao',
    'sobre-mim',
    'stack-tecnica',
    'contato',
  ])('scrolls smoothly to %s', async (id) => {
    const { element } = await render();
    const target = element.querySelector('#' + id)!;
    const scrollIntoView = vi.fn();
    Object.defineProperty(target, 'scrollIntoView', { configurable: true, value: scrollIntoView });
    (element.querySelector(`a[href="#${id}"]`) as HTMLAnchorElement).click();
    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' });
  });

  it('does not render the removed experience or academic sections', async () => {
    const { element } = await render();

    expect(element.querySelector('#experiencias')).toBeNull();
    expect(element.querySelector('a[href="#experiencias"]')).toBeNull();
    expect(element.querySelector('#formacao-academica')).toBeNull();
    expect(element.querySelector('a[href="#formacao-academica"]')).toBeNull();
  });

  it('keeps the page usable when the actual navigation target is missing', async () => {
    const { element } = await render();
    element.querySelector('#sobre-mim')!.remove();
    expect(() =>
      (element.querySelector('a[href="#sobre-mim"]') as HTMLAnchorElement).click(),
    ).not.toThrow();
    expect(element.querySelector('[data-testid="portfolio-page"]')).toBeTruthy();
  });

  it('hides a feature section when its original content is unavailable', async () => {
    const originalTitle = ORIGINAL_COPY.aboutTitle;
    const originalBody = ORIGINAL_COPY.aboutBody;
    ORIGINAL_COPY.aboutTitle = '';
    ORIGINAL_COPY.aboutBody = '';
    try {
      const { element } = await render();
      expect(element.querySelector('#sobre-mim')).toBeNull();
      expect(element.querySelector('a[href="#sobre-mim"]')).toBeNull();
      expect(element.querySelector('#apresentacao')).toBeTruthy();
      expect(element.querySelector('#contato')).toBeTruthy();
    } finally {
      ORIGINAL_COPY.aboutTitle = originalTitle;
      ORIGINAL_COPY.aboutBody = originalBody;
    }
  });

  it('switches manually and preserves section nodes (AC-003)', async () => {
    const { fixture, element } = await render();
    const select = element.querySelector('select')!;
    const section = element.querySelector('#sobre-mim');
    select.value = 'en';
    select.dispatchEvent(new Event('change'));
    await fixture.whenStable();
    expect(element.querySelector('#sobre-mim-title .translated-text')?.textContent).toBe(
      'About me',
    );
    expect(document.documentElement.lang).toBe('en');
    expect(element.querySelector('#sobre-mim')).toBe(section);
    select.value = 'pt-BR';
    select.dispatchEvent(new Event('change'));
    await fixture.whenStable();
    expect(element.querySelector('#sobre-mim-title .translated-text')?.textContent).toBe(
      'Sobre mim',
    );
  });

  it('renders the enhanced about section with headline, bio, focus box and 3 pillars (AC-001, AC-002)', async () => {
    const { fixture, element } = await render();
    const section = element.querySelector('#sobre-mim')!;
    expect(section).toBeTruthy();
    expect(section.querySelector('.about-headline')?.textContent).toContain(
      ORIGINAL_COPY.aboutHeadline,
    );
    expect(section.querySelector('.about-bio')?.textContent).toContain('Engenheiro de Software');
    expect(section.querySelector('.about-focus-badge')?.textContent).toBe('FOCO');
    expect(section.querySelector('.about-focus-text')?.textContent).toContain('TypeScript');

    const pillarCards = section.querySelectorAll('.about-pillar-card');
    expect(pillarCards).toHaveLength(3);
    expect(pillarCards[0].querySelector('.about-pillar-title')?.textContent).toContain(
      ORIGINAL_COPY.aboutPillar1Title,
    );
    expect(pillarCards[1].querySelector('.about-pillar-title')?.textContent).toContain(
      ORIGINAL_COPY.aboutPillar2Title,
    );
    expect(pillarCards[2].querySelector('.about-pillar-title')?.textContent).toContain(
      ORIGINAL_COPY.aboutPillar3Title,
    );

    // Switch to English
    const select = element.querySelector('select')!;
    select.value = 'en';
    select.dispatchEvent(new Event('change'));
    await fixture.whenStable();

    expect(section.querySelector('.about-headline')?.textContent).toContain(
      ENGLISH_COPY.aboutHeadline,
    );
    expect(section.querySelector('.about-focus-badge')?.textContent).toBe('FOCUS');
    expect(pillarCards[0].querySelector('.about-pillar-title')?.textContent).toContain(
      ENGLISH_COPY.aboutPillar1Title,
    );
  });

  it.each([true, false])('responds to the popup; accept=%s', async (accept) => {
    TestBed.overrideProvider(BROWSER_LANGUAGE, { useValue: () => 'es' });
    const { fixture, element } = await render();
    const service = TestBed.inject(PortfolioLanguageService);
    service.initialize();
    expect(service.showSuggestion()).toBe(true);
    const buttons = element.querySelectorAll<HTMLButtonElement>('dialog button');
    buttons[accept ? 1 : 0].click();
    await fixture.whenStable();
    expect(service.language()).toBe(accept ? 'en' : 'pt-BR');
    expect(service.showSuggestion()).toBe(false);
  });

  it('does not interpret Escape as refusal', async () => {
    const { element } = await render();
    const cancel = new Event('cancel', { cancelable: true });
    element.querySelector('dialog')!.dispatchEvent(cancel);
    expect(cancel.defaultPrevented).toBe(true);
  });

  it('renders original content on source failure while retaining section nodes', async () => {
    TestBed.overrideProvider(TRANSLATION_SOURCE, {
      useValue: () => {
        throw new Error('failed');
      },
    });
    const { fixture, element } = await render();
    const section = element.querySelector('#sobre-mim');
    TestBed.inject(PortfolioLanguageService).choose('en');
    await fixture.whenStable();
    expect(element.querySelector('#sobre-mim .translated-text')?.textContent).toBe(
      ORIGINAL_COPY.aboutTitle,
    );
    expect(element.querySelector('#sobre-mim')).toBe(section);
  });

  it('omits professional results section from the home page while keeping resultItems available for project details', async () => {
    const { fixture, element } = await render();
    const component = fixture.componentInstance as any;
    expect(element.querySelector('#resultados-profissionais')).toBeNull();
    expect(element.querySelector('a[href="#resultados-profissionais"]')).toBeNull();
    expect(component.resultItems()).toHaveLength(4);
    expect(component.resultItems().map((r: any) => r.testId)).toEqual([
      'time-reduction',
      'steps-reduction',
      'users-served',
      'productivity-gain',
    ]);
  });

  it('filters resultItems based on available copy values without rendering on home page', async () => {
    const original = {
      resultsTimeReduction: ORIGINAL_COPY.resultsTimeReduction,
      resultsStepsReduction: ORIGINAL_COPY.resultsStepsReduction,
      resultsUsersServed: ORIGINAL_COPY.resultsUsersServed,
      resultsProductivityGain: ORIGINAL_COPY.resultsProductivityGain,
    };
    ORIGINAL_COPY.resultsTimeReduction = '';
    ORIGINAL_COPY.resultsStepsReduction = '';
    try {
      const { fixture, element } = await render();
      const component = fixture.componentInstance as any;
      expect(element.querySelector('#resultados-profissionais')).toBeNull();
      expect(component.resultItems()).toHaveLength(2);
      expect(component.resultItems().map((r: any) => r.testId)).toEqual([
        'users-served',
        'productivity-gain',
      ]);
    } finally {
      ORIGINAL_COPY.resultsTimeReduction = original.resultsTimeReduction;
      ORIGINAL_COPY.resultsStepsReduction = original.resultsStepsReduction;
      ORIGINAL_COPY.resultsUsersServed = original.resultsUsersServed;
      ORIGINAL_COPY.resultsProductivityGain = original.resultsProductivityGain;
    }
  });

  it('handles empty result metrics cleanly without rendering on home page', async () => {
    const original = {
      resultsTimeReduction: ORIGINAL_COPY.resultsTimeReduction,
      resultsStepsReduction: ORIGINAL_COPY.resultsStepsReduction,
      resultsUsersServed: ORIGINAL_COPY.resultsUsersServed,
      resultsProductivityGain: ORIGINAL_COPY.resultsProductivityGain,
    };
    ORIGINAL_COPY.resultsTimeReduction = '';
    ORIGINAL_COPY.resultsStepsReduction = '';
    ORIGINAL_COPY.resultsUsersServed = '';
    ORIGINAL_COPY.resultsProductivityGain = '';
    try {
      const { fixture, element } = await render();
      const component = fixture.componentInstance as any;
      expect(element.querySelector('#resultados-profissionais')).toBeNull();
      expect(element.querySelector('a[href="#resultados-profissionais"]')).toBeNull();
      expect(component.resultItems()).toHaveLength(0);
      expect(element.querySelector('#contato')).toBeTruthy();
    } finally {
      ORIGINAL_COPY.resultsTimeReduction = original.resultsTimeReduction;
      ORIGINAL_COPY.resultsStepsReduction = original.resultsStepsReduction;
      ORIGINAL_COPY.resultsUsersServed = original.resultsUsersServed;
      ORIGINAL_COPY.resultsProductivityGain = original.resultsProductivityGain;
    }
  });

  it('renders portfolio cards, category filter tabs, and links to complete project pages', async () => {
    projectRows = [
      createProject('professional-1', 'professional', 2),
      createProject('personal-1', 'personal', 1),
    ];
    const { element } = await render();

    expect(element.querySelector('#portfolio')).toBeTruthy();
    expect(element.querySelector('#projetos')).toBeTruthy();
    expect(element.querySelector('a[href="#portfolio"]')).toBeTruthy();
    expect(element.querySelector('.hero-action--primary')?.getAttribute('href')).toBe('#portfolio');
    expect(element.querySelector('.hero-action:not(.hero-action--primary)')?.getAttribute('href')).toBe(
      '#contato',
    );
    expect(element.querySelector('[data-testid="filter-all"]')).toBeTruthy();
    expect(element.querySelector('[data-testid="filter-professional"]')).toBeTruthy();
    expect(element.querySelector('[data-testid="filter-personal"]')).toBeTruthy();

    const professional = element.querySelector(
      '[data-testid="professional-project-professional-1"]',
    )!;
    expect(professional.textContent).toContain('Projeto professional-1');
    expect(professional.textContent).toContain('Descrição professional-1');
    expect(professional.textContent).toContain('Tecnologia professional-1');
    expect(element.querySelector('[data-testid="personal-project-personal-1"]')).toBeTruthy();
    expect((professional.querySelector('.project-full-link') as HTMLAnchorElement).href).toBe(
      new URL('/projetos/professional-1', document.baseURI).href,
    );
  });

  it('filters portfolio cards by category tabs: all, professional, and personal', async () => {
    projectRows = [
      createProject('professional-1', 'professional', 2),
      createProject('personal-1', 'personal', 1),
    ];
    const { fixture, element } = await render();

    expect(element.querySelector('[data-testid="professional-project-professional-1"]')).toBeTruthy();
    expect(element.querySelector('[data-testid="personal-project-personal-1"]')).toBeTruthy();

    const profBtn = element.querySelector<HTMLButtonElement>('[data-testid="filter-professional"]')!;
    profBtn.click();
    fixture.detectChanges();
    expect(element.querySelector('[data-testid="professional-project-professional-1"]')).toBeTruthy();
    expect(element.querySelector('[data-testid="personal-project-personal-1"]')).toBeNull();

    const personalBtn = element.querySelector<HTMLButtonElement>('[data-testid="filter-personal"]')!;
    personalBtn.click();
    fixture.detectChanges();
    expect(element.querySelector('[data-testid="professional-project-professional-1"]')).toBeNull();
    expect(element.querySelector('[data-testid="personal-project-personal-1"]')).toBeTruthy();

    const allBtn = element.querySelector<HTMLButtonElement>('[data-testid="filter-all"]')!;
    allBtn.click();
    fixture.detectChanges();
    expect(element.querySelector('[data-testid="professional-project-professional-1"]')).toBeTruthy();
    expect(element.querySelector('[data-testid="personal-project-personal-1"]')).toBeTruthy();
  });

  it('renders the first project image by display order with 16:10 dimensions or placeholder fallback', async () => {
    const projectWithImages = createProject('personal-images', 'personal', 1);
    projectWithImages.images = [
      createImage('later', 'personal-images', 2),
      createImage('first', 'personal-images', 1),
    ];
    const projectWithoutImages = createProject('personal-without-images', 'personal', 2);
    projectRows = [projectWithImages, projectWithoutImages];

    const { element } = await render();
    const cardWithImages = element.querySelector('[data-testid="personal-project-personal-images"]')!;
    const image = cardWithImages.querySelector<HTMLImageElement>('[data-testid="project-cover"]')!;

    expect(image.src).toBe('https://storage.test/personal-images-first.png');
    expect(image.alt).toBe('Projeto personal-images — first.png');
    expect(image.getAttribute('loading')).toBe('lazy');
    expect(image.getAttribute('width')).toBe('600');
    expect(image.getAttribute('height')).toBe('375');

    const cardWithoutImages = element.querySelector('[data-testid="personal-project-personal-without-images"]')!;
    expect(cardWithoutImages.querySelector('[data-testid="project-cover"]')).toBeNull();
    expect(cardWithoutImages.querySelector('[data-testid="project-cover-placeholder"]')).toBeTruthy();
  });

  it('tries the next project image after a cover failure and isolates the fallback per project', async () => {
    const firstProject = createProject('personal-first', 'personal', 1);
    firstProject.images = [
      createImage('first-broken', 'personal-first', 1),
      createImage('second', 'personal-first', 2),
    ];
    const secondProject = createProject('personal-second', 'personal', 2);
    secondProject.images = [createImage('other-first', 'personal-second', 1)];
    projectRows = [firstProject, secondProject];

    const { fixture, element } = await render();
    const firstCard = element.querySelector('[data-testid="personal-project-personal-first"]')!;
    const firstImage = firstCard.querySelector<HTMLImageElement>('[data-testid="project-cover"]')!;
    firstImage.dispatchEvent(new Event('error'));
    fixture.detectChanges();

    expect(firstCard.querySelector<HTMLImageElement>('[data-testid="project-cover"]')?.src).toBe(
      'https://storage.test/personal-first-second.png',
    );
    expect(
      element
        .querySelector('[data-testid="personal-project-personal-second"] [data-testid="project-cover"]')
        ?.getAttribute('src'),
    ).toBe('https://storage.test/personal-second-other-first.png');
  });

  it('hides the entire portfolio section when no projects are available', async () => {
    projectRows = [createProject('professional-1', 'professional', 1)];
    const { element } = await render();
    expect(element.querySelector('#portfolio')).toBeTruthy();

    projectRows = [];
    const empty = await render();
    expect(empty.element.querySelector('#portfolio')).toBeNull();
    expect(empty.element.querySelector('a[href="#portfolio"]')).toBeNull();
  });

  it('filters incomplete projects without name or description', async () => {
    const incomplete = createProject('incomplete', 'personal', 1);
    incomplete.description = '';
    const withoutLinks = createProject('without-links', 'personal', 2);
    withoutLinks.links = [];
    projectRows = [incomplete, withoutLinks];

    const { element } = await render();

    expect(element.querySelector('[data-testid="personal-project-incomplete"]')).toBeNull();
    expect(element.querySelector('[data-testid="personal-project-without-links"]')).toBeTruthy();
  });

  it('reloads project translations when the language changes', async () => {
    projectRows = [createProject('personal-1', 'personal', 1)];
    const { fixture, element } = await render();

    const select = element.querySelector('select')!;
    select.value = 'en';
    select.dispatchEvent(new Event('change'));
    await fixture.whenStable();

    const project = element.querySelector('[data-testid="personal-project-personal-1"]');
    expect(project?.textContent).toContain('English Projeto personal-1');
    expect(project?.textContent).toContain('English description');
    expect(element.querySelector('[data-testid="filter-all"]')?.textContent?.trim()).toBe('All');
  });

  it('renders the modern header with dynamic brand monogram, capsule nav, and action pills', async () => {
    const fixture = TestBed.createComponent(PortfolioPageComponent);
    fixture.detectChanges();
    await fixture.whenStable();

    const element = fixture.nativeElement as HTMLElement;
    const monogram = element.querySelector('.brand-logo');
    expect(monogram).toBeTruthy();
    expect(element.querySelector('.nav-capsule')).toBeTruthy();
    expect(element.querySelector('[data-testid="header-cv-trigger"]')).toBeTruthy();
    expect(element.querySelector('[data-testid="header-lang-trigger"]')).toBeTruthy();

    // Verify button order: CV trigger is first, language trigger is second
    const triggers = element.querySelectorAll('.site-header__actions .header-dropdown button.action-pill');
    expect(triggers[0].getAttribute('data-testid')).toBe('header-cv-trigger');
    expect(triggers[1].getAttribute('data-testid')).toBe('header-lang-trigger');

    // Verify CV trigger text in Portuguese defaults to Currículo
    expect(element.querySelector('[data-testid="header-cv-trigger"]')?.textContent).toContain('Currículo');
  });

  it('toggles CV download dropdown and triggers download on selection', async () => {
    const fixture = TestBed.createComponent(PortfolioPageComponent);
    fixture.detectChanges();
    await fixture.whenStable();

    const element = fixture.nativeElement as HTMLElement;
    const cvTrigger = element.querySelector<HTMLButtonElement>('[data-testid="header-cv-trigger"]')!;
    expect(element.querySelector('.dropdown-menu--cv')).toBeNull();

    cvTrigger.click();
    fixture.detectChanges();

    const cvMenu = element.querySelector('.dropdown-menu--cv');
    expect(cvMenu).toBeTruthy();

    const ptOption = element.querySelector<HTMLButtonElement>('[data-testid="download-cv-pt"]')!;
    expect(ptOption).toBeTruthy();
    ptOption.click();
    fixture.detectChanges();

    expect(element.querySelector('.dropdown-menu--cv')).toBeNull();
  });

  it('toggles language dropdown, switches language, and updates CV trigger text to Resume', async () => {
    const fixture = TestBed.createComponent(PortfolioPageComponent);
    fixture.detectChanges();
    await fixture.whenStable();

    const element = fixture.nativeElement as HTMLElement;
    const langTrigger = element.querySelector<HTMLButtonElement>('[data-testid="header-lang-trigger"]')!;
    expect(element.querySelector('.dropdown-menu--lang')).toBeNull();

    langTrigger.click();
    fixture.detectChanges();

    const langMenu = element.querySelector('.dropdown-menu--lang');
    expect(langMenu).toBeTruthy();

    const enOption = element.querySelector<HTMLButtonElement>('[data-testid="lang-option-en"]')!;
    expect(enOption).toBeTruthy();
    enOption.click();
    fixture.detectChanges();

    expect(TestBed.inject(PortfolioLanguageService).language()).toBe('en');
    expect(element.querySelector('.dropdown-menu--lang')).toBeNull();
    expect(element.querySelector('[data-testid="header-cv-trigger"]')?.textContent).toContain('Resume');
  });

  it('toggles mobile drawer on hamburger button click', async () => {
    const fixture = TestBed.createComponent(PortfolioPageComponent);
    fixture.detectChanges();
    await fixture.whenStable();

    const element = fixture.nativeElement as HTMLElement;
    const toggle = element.querySelector<HTMLButtonElement>('.mobile-menu-toggle')!;
    expect(element.querySelector('.mobile-drawer')).toBeNull();

    toggle.click();
    fixture.detectChanges();

    expect(element.querySelector('.mobile-drawer')).toBeTruthy();

    toggle.click();
    fixture.detectChanges();

    expect(element.querySelector('.mobile-drawer')).toBeNull();
  });

  describe('extractBrandInitials', () => {
    it('returns default initials (PF) for generic fallback role titles', () => {
      expect(extractBrandInitials('Desenvolvedor de Software')).toBe('PF');
      expect(extractBrandInitials('Software Engineer')).toBe('PF');
      expect(extractBrandInitials('desenvolvedor')).toBe('PF');
      expect(extractBrandInitials('')).toBe('PF');
      expect(extractBrandInitials(null)).toBe('PF');
      expect(extractBrandInitials(undefined)).toBe('PF');
    });

    it('returns custom default initials when provided for generic roles', () => {
      expect(extractBrandInitials('Desenvolvedor de Software', 'GX')).toBe('GX');
    });

    it('extracts initials dynamically from personal names', () => {
      expect(extractBrandInitials('Ada Lovelace')).toBe('AL');
      expect(extractBrandInitials('Ada Byron')).toBe('AB');
      expect(extractBrandInitials('Grace Hopper')).toBe('GH');
      expect(extractBrandInitials('Alan Turing')).toBe('AT');
    });

    it('skips Portuguese and English prepositions/stopwords', () => {
      expect(extractBrandInitials('Lucas de Souza')).toBe('LS');
      expect(extractBrandInitials('Ana da Silva')).toBe('AS');
      expect(extractBrandInitials('Carlos do Carmo')).toBe('CC');
      expect(extractBrandInitials('John of York')).toBe('JY');
    });
  });

  it('renders PF.dev on the brand monogram header when default fallback is active', async () => {
    const fixture = TestBed.createComponent(PortfolioPageComponent);
    fixture.detectChanges();
    await fixture.whenStable();

    const element = fixture.nativeElement as HTMLElement;
    const monogram = element.querySelector('.brand-logo__initials');
    expect(monogram?.textContent?.trim()).toBe('PF');

    const suffix = element.querySelector('.brand-logo__suffix');
    expect(suffix?.textContent?.trim()).toBe('.dev');
  });

  describe('position-based scroll spy (computeActiveSectionByPosition)', () => {
    it('sets active section to apresentacao when scrollY is near the top', async () => {
      const fixture = TestBed.createComponent(PortfolioPageComponent);
      fixture.detectChanges();
      await fixture.whenStable();

      const component = fixture.componentInstance as any;
      Object.defineProperty(window, 'scrollY', { value: 0, writable: true, configurable: true });
      component.computeActiveSectionByPosition();
      expect(component.activeSectionId()).toBe('apresentacao');
    });

    it('sets active section to the last item when scrolled to bottom of page', async () => {
      const fixture = TestBed.createComponent(PortfolioPageComponent);
      fixture.detectChanges();
      await fixture.whenStable();

      const component = fixture.componentInstance as any;
      Object.defineProperty(window, 'scrollY', { value: 3000, writable: true, configurable: true });
      Object.defineProperty(window, 'innerHeight', { value: 800, writable: true, configurable: true });
      Object.defineProperty(document.documentElement, 'scrollHeight', { value: 3800, writable: true, configurable: true });

      component.computeActiveSectionByPosition();
      expect(component.activeSectionId()).toBe('contato');
    });

    it('updates active section based on section element bounding rects', async () => {
      const fixture = TestBed.createComponent(PortfolioPageComponent);
      fixture.detectChanges();
      await fixture.whenStable();

      const component = fixture.componentInstance as any;
      Object.defineProperty(window, 'scrollY', { value: 500, writable: true, configurable: true });
      Object.defineProperty(window, 'innerHeight', { value: 800, writable: true, configurable: true });
      Object.defineProperty(document.documentElement, 'scrollHeight', { value: 4000, writable: true, configurable: true });

      const sobreMimEl = document.getElementById('sobre-mim');
      if (sobreMimEl) {
        vi.spyOn(sobreMimEl, 'getBoundingClientRect').mockReturnValue({
          top: 150,
          bottom: 600,
          left: 0,
          right: 800,
          width: 800,
          height: 450,
          x: 0,
          y: 150,
          toJSON: () => {},
        });
      }

      component.computeActiveSectionByPosition();
      expect(component.activeSectionId()).toBe('sobre-mim');
    });
  });

  function createProject(
    id: string,
    type: 'professional' | 'personal',
    displayOrder: number,
  ): PortfolioProject {
    return {
      id,
      displayOrder,
      type,
      locale: 'pt-BR',
      name: 'Projeto ' + id,
      description: 'Descrição ' + id,
      problemContext: 'Contexto ' + id,
      solution: 'Solução ' + id,
      role: 'Papel ' + id,
      technicalDecisions: ['Decisão ' + id],
      technologies: ['Tecnologia ' + id],
      results: ['Resultado ' + id],
      learnings: ['Aprendizado ' + id],
      links: [{ label: 'Site ' + id, url: 'https://example.com/' + id }],
      images: [],
    };
  }

  function createImage(id: string, projectId: string, displayOrder: number): PortfolioProjectImage {
    return {
      id,
      projectId,
      storagePath: projectId + '/' + id + '.png',
      originalName: id + '.png',
      mimeType: 'image/png',
      sizeBytes: 100,
      displayOrder,
      publicUrl: 'https://storage.test/' + projectId + '-' + id + '.png',
    };
  }

  function createCurriculum(locale: 'pt-BR' | 'en'): PortfolioFile {
    return {
      id: 'curriculum-' + locale,
      fileType: 'curriculum',
      locale,
      storagePath: 'curriculum-' + locale + '.pdf',
      originalName: 'curriculum-' + locale + '.pdf',
      mimeType: 'application/pdf',
      sizeBytes: 1000,
      publicUrl: 'https://storage.test/curriculum-' + locale + '.pdf',
    };
  }
});
