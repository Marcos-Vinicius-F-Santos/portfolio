import { Injectable, signal } from '@angular/core';
import type { PortfolioLanguage } from '../../portfolio/content/portfolio-language';

/** Language state scoped to the visual editor; it never writes visitor preferences. */
@Injectable()
export class EditorialLanguageService {
  private readonly selected = signal<PortfolioLanguage>('pt-BR');
  readonly language = this.selected.asReadonly();
  readonly showSuggestion = signal(false).asReadonly();
  initialize(): void {}
  choose(language: PortfolioLanguage): void {
    this.selected.set(language);
  }
  acceptSuggestion(): void {
    this.choose('en');
  }
  declineSuggestion(): void {
    this.choose('pt-BR');
  }
}
