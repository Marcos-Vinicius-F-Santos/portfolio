import { DOCUMENT, NgTemplateOutlet } from '@angular/common';
import { afterNextRender, Component, computed, inject, viewChild, ElementRef } from '@angular/core';
import { ORIGINAL_COPY, PortfolioCopy, selectPortfolioCopy } from '../../content/portfolio-content';
import { PortfolioLanguageService } from '../../content/portfolio-language.service';
import { ENGLISH_COPY, TRANSLATION_SOURCE } from '../../content/portfolio-translations';
import { PortfolioContentService } from '../../content/portfolio-content.service';

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
    return Object.keys(remoteCopy).length === 0
      ? localCopy
      : { ...localCopy, ...remoteCopy };
  });
  protected readonly original = ORIGINAL_COPY;
  protected readonly english = ENGLISH_COPY;
  protected readonly navigationItems = [
    { title: 'aboutTitle', body: 'aboutBody', targetId: 'sobre-mim', index: '01' },
    { title: 'experienceTitle', body: 'experienceBody', targetId: 'experiencias', index: '02' },
    { title: 'stackTitle', body: 'stackBody', targetId: 'stack-tecnica', index: '03' },
  ] as const satisfies readonly {
    title: keyof PortfolioCopy;
    body: keyof PortfolioCopy;
    targetId: string;
    index: string;
  }[];
  private readonly document = inject(DOCUMENT);
  private readonly suggestion = viewChild<ElementRef<HTMLDialogElement>>('suggestion');
  private readonly selector = viewChild<ElementRef<HTMLSelectElement>>('selector');

  constructor() {
    afterNextRender(() => {
      this.language.initialize();
      this.document.documentElement.lang = this.language.language();
      void this.content.loadCopy(this.language.language());
      if (this.language.showSuggestion()) this.suggestion()?.nativeElement.showModal?.();
    });
  }

  protected choose(language: string): void {
    if (language !== 'pt-BR' && language !== 'en') return;
    this.language.choose(language);
    this.document.documentElement.lang = this.language.language();
    void this.content.loadCopy(this.language.language());
  }

  protected respond(accept: boolean): void {
    if (accept) this.language.acceptSuggestion();
    else this.language.declineSuggestion();
    this.document.documentElement.lang = this.language.language();
    void this.content.loadCopy(this.language.language());
    this.suggestion()?.nativeElement.close?.();
    this.selector()?.nativeElement.focus({ preventScroll: true });
  }

  protected navigateToSection(event: Event, targetId: string): void {
    event.preventDefault();
    const target = this.document.getElementById(targetId);
    target?.scrollIntoView?.({ behavior: 'smooth', block: 'start' });
  }
}