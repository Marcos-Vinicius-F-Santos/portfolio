import { DOCUMENT } from '@angular/common';
import { inject, Injectable, InjectionToken, signal } from '@angular/core';
import { classifyBrowserLanguage, PortfolioLanguage } from './portfolio-language';
import { PortfolioLanguageStorage } from './portfolio-language-storage';

export const LANGUAGE_STORAGE = new InjectionToken<PortfolioLanguageStorage>(
  'Portfolio language storage',
  {
    providedIn: 'root',
    factory: () => {
      const document = inject(DOCUMENT);
      return new PortfolioLanguageStorage(() => document.defaultView?.localStorage ?? null);
    },
  },
);

export const BROWSER_LANGUAGE = new InjectionToken<() => unknown>('Browser primary language', {
  providedIn: 'root',
  factory: () => {
    const document = inject(DOCUMENT);
    return () => document.defaultView?.navigator.language;
  },
});

@Injectable({ providedIn: 'root' })
export class PortfolioLanguageService {
  private readonly storage = inject(LANGUAGE_STORAGE);
  private readonly browserLanguage = inject(BROWSER_LANGUAGE);
  private readonly selected = signal<PortfolioLanguage>('pt-BR');
  private readonly suggested = signal(false);
  readonly language = this.selected.asReadonly();
  readonly showSuggestion = this.suggested.asReadonly();
  private initialized = false;
  private declined = false;

  initialize(): void {
    if (this.initialized) return;
    this.initialized = true;
    const saved = this.storage.read();
    if (saved) {
      this.declined = saved.declined;
      this.selected.set(saved.language);
      return;
    }
    try {
      const primary = classifyBrowserLanguage(this.browserLanguage());
      this.suggested.set(primary !== null && primary !== 'pt-BR');
    } catch {
      this.suggested.set(false);
    }
  }

  acceptSuggestion(): void {
    this.choose('en');
  }

  declineSuggestion(): void {
    this.declined = true;
    this.choose('pt-BR');
  }

  choose(language: PortfolioLanguage): void {
    this.selected.set(language);
    this.suggested.set(false);
    this.storage.write({ language, declined: this.declined });
  }
}
