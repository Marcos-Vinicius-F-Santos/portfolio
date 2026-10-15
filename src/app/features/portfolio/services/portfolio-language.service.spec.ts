import { TestBed } from '@angular/core/testing';
import {
  BROWSER_LANGUAGE,
  LANGUAGE_STORAGE,
  PortfolioLanguageService,
} from './portfolio-language.service';
import { LANGUAGE_STORAGE_KEY, PortfolioLanguageStorage } from './portfolio-language-storage';

describe('portfolio language decisions', () => {
  const primary = vi.fn<() => unknown>();
  beforeEach(() => {
    localStorage.clear();
    primary.mockReset().mockReturnValue('en-US');
    TestBed.configureTestingModule({
      providers: [
        { provide: BROWSER_LANGUAGE, useValue: primary },
        {
          provide: LANGUAGE_STORAGE,
          useFactory: () => new PortfolioLanguageStorage(() => localStorage),
        },
      ],
    });
  });
  const service = () => TestBed.inject(PortfolioLanguageService);

  it.each(['en-US', 'es', 'fr-FR'])('starts Portuguese and suggests English for %s', (locale) => {
    primary.mockReturnValue(locale);
    const state = service();
    expect(state.language()).toBe('pt-BR');
    expect(state.showSuggestion()).toBe(false);
    state.initialize();
    expect(state.language()).toBe('pt-BR');
    expect(state.showSuggestion()).toBe(true);
  });

  it.each(['pt-BR', 'pt-PT', undefined, 'invalid locale'])('does not suggest for %s', (locale) => {
    primary.mockReturnValue(locale);
    service().initialize();
    expect(service().language()).toBe('pt-BR');
    expect(service().showSuggestion()).toBe(false);
  });

  it('keeps Portuguese when detection throws (AC-005)', () => {
    primary.mockImplementation(() => {
      throw new Error('unavailable');
    });
    expect(() => service().initialize()).not.toThrow();
    expect(service().language()).toBe('pt-BR');
    expect(service().showSuggestion()).toBe(false);
  });

  it.each(['en', 'pt-BR'] as const)(
    'restores %s only after initial Portuguese and never consults browser (AC-010)',
    (language) => {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, JSON.stringify({ language, declined: false }));
      const state = service();
      expect(state.language()).toBe('pt-BR');
      state.initialize();
      expect(state.language()).toBe(language);
      expect(state.showSuggestion()).toBe(false);
      expect(primary).not.toHaveBeenCalled();
    },
  );

  it('accepts and saves English (AC-002)', () => {
    service().initialize();
    service().acceptSuggestion();
    expect(service().language()).toBe('en');
    expect(service().showSuggestion()).toBe(false);
    expect(JSON.parse(localStorage.getItem(LANGUAGE_STORAGE_KEY)!)).toEqual({
      language: 'en',
      declined: false,
    });
  });

  it('keeps refusal through manual switches (AC-003/004)', () => {
    service().initialize();
    service().declineSuggestion();
    expect(service().language()).toBe('pt-BR');
    service().choose('en');
    expect(service().language()).toBe('en');
    service().choose('pt-BR');
    expect(JSON.parse(localStorage.getItem(LANGUAGE_STORAGE_KEY)!)).toEqual({
      language: 'pt-BR',
      declined: true,
    });
    service().initialize();
    expect(service().showSuggestion()).toBe(false);
  });

  it('restores a saved refusal without a suggestion', () => {
    localStorage.setItem(
      LANGUAGE_STORAGE_KEY,
      JSON.stringify({ language: 'pt-BR', declined: true }),
    );
    service().initialize();
    expect(service().showSuggestion()).toBe(false);
  });

  it('suggests again after deletion before the next visit (AC-012)', () => {
    localStorage.setItem(
      LANGUAGE_STORAGE_KEY,
      JSON.stringify({ language: 'pt-BR', declined: true }),
    );
    localStorage.removeItem(LANGUAGE_STORAGE_KEY);
    service().initialize();
    expect(service().showSuggestion()).toBe(true);
  });
});
