import { TestBed } from '@angular/core/testing';
import { PortfolioPage } from './portfolio-page';
import {
  BROWSER_LANGUAGE,
  PortfolioLanguageService,
} from '../../content/portfolio-language.service';
import { TRANSLATION_SOURCE } from '../../content/portfolio-translations';
import { ORIGINAL_COPY } from '../../content/portfolio-content';

describe('PortfolioPage', () => {
  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [PortfolioPage],
      providers: [{ provide: BROWSER_LANGUAGE, useValue: () => 'pt-BR' }],
    }).compileComponents();
  });

  async function render() {
    const fixture = TestBed.createComponent(PortfolioPage);
    await fixture.whenStable();
    return { fixture, element: fixture.nativeElement as HTMLElement };
  }

  it('renders the presentation, about, and existing sections with stable navigation targets', async () => {
    const { fixture, element } = await render();
    const sections = [...element.querySelectorAll('section')];
    for (const language of ['en', 'pt-BR'] as const) {
      TestBed.inject(PortfolioLanguageService).choose(language);
      await fixture.whenStable();
      expect(element.querySelector('#apresentacao')).toBeTruthy();
      for (const id of ['sobre-mim', 'experiencias', 'stack-tecnica']) {
        expect(element.querySelector('#' + id)).toBeTruthy();
        expect(element.querySelector(`a[href="#${id}"]`)).toBeTruthy();
      }
      expect(element.querySelector('a[href="#apresentacao"]')).toBeTruthy();
      expect([...element.querySelectorAll('section')]).toEqual(sections);
      expect(element.querySelectorAll('nav a')).toHaveLength(4);
    }
  });

  it.each(['apresentacao', 'sobre-mim', 'experiencias', 'stack-tecnica'])(
    'scrolls smoothly to %s',
    async (id) => {
      const { element } = await render();
      const target = element.querySelector('#' + id)!;
      const scrollIntoView = vi.fn();
      Object.defineProperty(target, 'scrollIntoView', { configurable: true, value: scrollIntoView });
      (element.querySelector(`a[href="#${id}"]`) as HTMLAnchorElement).click();
      expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' });
    },
  );

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
});
