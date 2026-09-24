import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { PortfolioPage } from './portfolio-page';
import {
  BROWSER_LANGUAGE,
  PortfolioLanguageService,
} from '../../content/portfolio-language.service';
import { TRANSLATION_SOURCE } from '../../content/portfolio-translations';
import { ORIGINAL_COPY, type PortfolioCopy } from '../../content/portfolio-content';
import { PortfolioContentService } from '../../content/portfolio-content.service';
import type { PortfolioExperience } from '../../content/portfolio-content.models';
import { ENGLISH_COPY } from '../../content/portfolio-translations';

let experienceRows: PortfolioExperience[] = [];

describe('PortfolioPage', () => {
  beforeEach(async () => {
    localStorage.clear();
    experienceRows = createExperiences('pt-BR');
    const contentService = {
      remoteCopy: signal<Partial<PortfolioCopy>>({}),
      loadCopy: vi.fn(async () => ({})),
      listExperiences: vi.fn(async (locale: 'pt-BR' | 'en') =>
        experienceRows.length > 0 ? createExperiences(locale) : [],
      ),
    };
    await TestBed.configureTestingModule({
      imports: [PortfolioPage],
      providers: [
        { provide: BROWSER_LANGUAGE, useValue: () => 'pt-BR' },
        { provide: PortfolioContentService, useValue: contentService },
      ],
    }).compileComponents();
  });

  async function render() {
    const fixture = TestBed.createComponent(PortfolioPage);
    await fixture.whenStable();
    return { fixture, element: fixture.nativeElement as HTMLElement };
  }

  it('renders the presentation, about, results, and existing sections with stable navigation targets', async () => {
    const { fixture, element } = await render();
    const sections = [...element.querySelectorAll('section')];
    for (const language of ['en', 'pt-BR'] as const) {
      TestBed.inject(PortfolioLanguageService).choose(language);
      await fixture.whenStable();
      expect(element.querySelector('#apresentacao')).toBeTruthy();
      for (const id of ['sobre-mim', 'experiencias', 'stack-tecnica', 'resultados-profissionais']) {
        expect(element.querySelector('#' + id)).toBeTruthy();
        expect(element.querySelector(`a[href="#${id}"]`)).toBeTruthy();
      }
      expect(element.querySelector('a[href="#apresentacao"]')).toBeTruthy();
      expect([...element.querySelectorAll('section')]).toEqual(sections);
      expect(element.querySelectorAll('nav a')).toHaveLength(5);
    }
  });

  it.each([
    'apresentacao',
    'sobre-mim',
    'experiencias',
    'stack-tecnica',
    'resultados-profissionais',
  ])('scrolls smoothly to %s', async (id) => {
    const { element } = await render();
    const target = element.querySelector('#' + id)!;
    const scrollIntoView = vi.fn();
    Object.defineProperty(target, 'scrollIntoView', { configurable: true, value: scrollIntoView });
    (element.querySelector(`a[href="#${id}"]`) as HTMLAnchorElement).click();
    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' });
  });

  it('renders the structured experiences in chronological order', async () => {
    const { element } = await render();
    const experiences = [...element.querySelectorAll<HTMLElement>('.experience-card')];

    expect(experiences.map((experience) => experience.dataset['testid'])).toEqual([
      'professional-experience-newer',
      'professional-experience-older',
    ]);
    expect(experiences[0]?.textContent).toContain('Dairy Corp');
    expect(experiences[0]?.textContent).toContain('05/2025 – 03/2026');
    expect(experiences[0]?.textContent).toContain('Engenheiro de software');
    expect(experiences[0]?.textContent).toContain('Setor de laticínios');
    expect(experiences[0]?.textContent).toContain('Responsabilidade nova');
    expect(experiences[0]?.textContent).toContain('Decisão nova');
    expect(experiences[0]?.textContent).toContain('Resultado novo');
  });

  it('hides the experience section and navigation when no experience is available', async () => {
    experienceRows = [];
    const { element } = await render();

    expect(element.querySelector('#experiencias')).toBeNull();
    expect(element.querySelector('a[href="#experiencias"]')).toBeNull();
    expect(element.querySelector('#sobre-mim')).toBeTruthy();
    expect(element.querySelector('#stack-tecnica')).toBeTruthy();
  });

  it('reloads translated experience fields when the language changes', async () => {
    const { fixture, element } = await render();
    const select = element.querySelector('select')!;
    select.value = 'en';
    select.dispatchEvent(new Event('change'));
    await fixture.whenStable();

    expect(element.querySelector('.experience-title')?.textContent).toContain('Software Engineer');
    expect(element.querySelector('.experience-block p')?.textContent).toContain('Dairy industry');
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
      expect(element.querySelector('#experiencias')).toBeTruthy();
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

  it('renders the approved professional results in the happy path', async () => {
    const { element } = await render();
    expect(element.querySelector('#resultados-profissionais')).toBeTruthy();
    expect(element.querySelector('a[href="#resultados-profissionais"]')).toBeTruthy();
    expect(element.querySelectorAll('.result-card')).toHaveLength(4);
    expect(
      element.querySelector('[data-testid="professional-result-time-reduction"]')?.textContent,
    ).toContain('dias para horas');
    expect(
      element.querySelector('[data-testid="professional-result-steps-reduction"]')?.textContent,
    ).toContain('8–10 para 3–5');
    expect(
      element.querySelector('[data-testid="professional-result-users-served"]')?.textContent,
    ).toContain('2.000');
    expect(
      element.querySelector('[data-testid="professional-result-productivity-gain"]')?.textContent,
    ).toContain('50%');
  });

  it('renders only the approved professional results that are available', async () => {
    const original = {
      resultsTimeReduction: ORIGINAL_COPY.resultsTimeReduction,
      resultsStepsReduction: ORIGINAL_COPY.resultsStepsReduction,
      resultsUsersServed: ORIGINAL_COPY.resultsUsersServed,
      resultsProductivityGain: ORIGINAL_COPY.resultsProductivityGain,
    };
    ORIGINAL_COPY.resultsTimeReduction = '';
    ORIGINAL_COPY.resultsStepsReduction = '';
    try {
      const { element } = await render();
      expect(element.querySelector('#resultados-profissionais')).toBeTruthy();
      expect(element.querySelectorAll('.result-card')).toHaveLength(2);
      expect(
        element.querySelector('[data-testid="professional-result-users-served"]'),
      ).toBeTruthy();
      expect(
        element.querySelector('[data-testid="professional-result-productivity-gain"]'),
      ).toBeTruthy();
      expect(
        element.querySelector('[data-testid="professional-result-time-reduction"]'),
      ).toBeNull();
      expect(
        element.querySelector('[data-testid="professional-result-steps-reduction"]'),
      ).toBeNull();
    } finally {
      ORIGINAL_COPY.resultsTimeReduction = original.resultsTimeReduction;
      ORIGINAL_COPY.resultsStepsReduction = original.resultsStepsReduction;
      ORIGINAL_COPY.resultsUsersServed = original.resultsUsersServed;
      ORIGINAL_COPY.resultsProductivityGain = original.resultsProductivityGain;
    }
  });

  it('hides the professional results section when no approved result is available', async () => {
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
      const { element } = await render();
      expect(element.querySelector('#resultados-profissionais')).toBeNull();
      expect(element.querySelector('a[href="#resultados-profissionais"]')).toBeNull();
      expect(element.querySelector('#experiencias')).toBeTruthy();
    } finally {
      ORIGINAL_COPY.resultsTimeReduction = original.resultsTimeReduction;
      ORIGINAL_COPY.resultsStepsReduction = original.resultsStepsReduction;
      ORIGINAL_COPY.resultsUsersServed = original.resultsUsersServed;
      ORIGINAL_COPY.resultsProductivityGain = original.resultsProductivityGain;
    }
  });

  it('uses the original approved result when the selected translation is missing', async () => {
    TestBed.overrideProvider(TRANSLATION_SOURCE, {
      useValue: () => ({
        ...ENGLISH_COPY,
        resultsTimeReduction: '',
      }),
    });
    const { fixture, element } = await render();
    TestBed.inject(PortfolioLanguageService).choose('en');
    await fixture.whenStable();
    expect(
      element.querySelector('[data-testid="professional-result-time-reduction"] p .translated-text')
        ?.textContent,
    ).toContain(ORIGINAL_COPY.resultsTimeReduction);
    expect(
      element.querySelector(
        '[data-testid="professional-result-steps-reduction"] p .translated-text',
      )?.textContent,
    ).toContain(ENGLISH_COPY.resultsStepsReduction);
  });
  function createExperiences(locale: 'pt-BR' | 'en'): PortfolioExperience[] {
    const english = locale === 'en';
    return [
      {
        id: 'newer',
        startDate: '2025-05-01',
        endDate: '2026-03-01',
        name: 'Dairy Corp',
        displayOrder: 2,
        title: english ? 'Software Engineer' : 'Engenheiro de software',
        context: english ? 'Dairy industry' : 'Setor de laticínios',
        responsibilities: [english ? 'New responsibility' : 'Responsabilidade nova'],
        technicalDecisions: [english ? 'New decision' : 'Decisão nova'],
        results: [english ? 'New result' : 'Resultado novo'],
      },
      {
        id: 'older',
        startDate: '2023-12-01',
        endDate: '2025-05-01',
        name: 'Digital Corp',
        displayOrder: 1,
        title: english ? 'Developer' : 'Desenvolvedor',
        context: english ? 'Corporate digitization' : 'Digitalização corporativa',
        responsibilities: [english ? 'Old responsibility' : 'Responsabilidade antiga'],
        technicalDecisions: [english ? 'Old decision' : 'Decisão antiga'],
        results: [english ? 'Old result' : 'Resultado antigo'],
      },
    ];
  }
});
