import { DOCUMENT } from '@angular/common';
import { Component, computed, effect, HostListener, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { PortfolioContentService } from '../../services/portfolio-content.service';
import { PortfolioLanguageService } from '../../services/portfolio-language.service';
import {
  hasPortfolioProjectContent,
  PortfolioProject,
} from '../../services/portfolio-content.models';
import { selectPortfolioCopy } from '../../services/portfolio-content';
import { TRANSLATION_SOURCE } from '../../services/portfolio-translations';
import { ProjectTechnologiesComponent } from '../../../../shared/components/project-technologies/project-technologies.component';
import { SiteFooterComponent } from '../../../../shared/components/site-footer/site-footer.component';
import { getUiLabels } from '../../services/portfolio-ui-labels';
import { extractBrandInitials } from '../portfolio-page/portfolio-page.component';

const GENERIC_TITLES = new Set([
  'desenvolvedor de software',
  'software engineer',
  'software developer',
  'engenheiro de software',
  'engenharia de software',
]);

@Component({
  selector: 'app-project-detail',
  imports: [ProjectTechnologiesComponent, SiteFooterComponent],
  templateUrl: './project-detail.component.html',
  styleUrl: './project-detail.component.css',
})
export class ProjectDetailComponent {
  protected readonly language = inject(PortfolioLanguageService);
  private readonly content = inject(PortfolioContentService);
  private readonly document = inject(DOCUMENT);
  private readonly params = toSignal(inject(ActivatedRoute).paramMap);
  private readonly source = inject(TRANSLATION_SOURCE);
  protected readonly copy = computed(() =>
    selectPortfolioCopy(this.language.language(), this.source),
  );
  protected readonly ui = computed(() => getUiLabels(this.language.language()));
  protected readonly brandMonogram = computed(() => {
    const config =
      typeof globalThis !== 'undefined' ? globalThis.__PORTFOLIO_SUPABASE_CONFIG__ : undefined;
    const defaultInitials = config?.brandInitials?.trim() || 'PF';
    return extractBrandInitials(this.copy().name, defaultInitials);
  });
  protected readonly authorName = computed(() => {
    const config =
      typeof globalThis !== 'undefined' ? globalThis.__PORTFOLIO_SUPABASE_CONFIG__ : undefined;
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
  protected readonly languageMenuOpen = signal(false);
  protected toggleLanguageMenu(event: Event): void {
    event.stopPropagation();
    this.languageMenuOpen.update((open) => !open);
  }
  protected closeAllMenus(): void {
    this.languageMenuOpen.set(false);
  }
  @HostListener('document:click')
  onDocumentClick(): void {
    this.closeAllMenus();
  }
  protected readonly project = signal<PortfolioProject | null>(null);
  protected readonly loading = signal(true);
  protected readonly error = signal(false);
  protected readonly failedImages = signal<string[]>([]);
  protected readonly en = computed(() => this.language.language() === 'en');
  protected readonly lists = computed(() => {
    const p = this.project(),
      c = this.copy();
    return p
      ? [
          {
            field: 'technicalDecisions',
            title: c.projectTechnicalDecisionsLabel,
            values: p.technicalDecisions,
          },
          { field: 'results', title: c.projectResultsLabel, values: p.results },
          { field: 'learnings', title: c.projectLearningsLabel, values: p.learnings },
        ]
      : [];
  });
  constructor() {
    this.language.initialize();
    effect((onCleanup) => {
      const id = this.params()?.get('id'),
        locale = this.language.language();
      this.document.documentElement.lang = locale;
      let active = true;
      onCleanup(() => {
        active = false;
      });
      this.loading.set(true);
      this.error.set(false);
      this.project.set(null);
      this.failedImages.set([]);
      this.content
        .listProjects(locale)
        .then((projects) => {
          if (!active) return;
          this.error.set(Boolean(this.content.lastError()) || !this.content.isAvailable());
          this.project.set(
            projects.find((p) => p.id === id && hasPortfolioProjectContent(p)) ?? null,
          );
          this.loading.set(false);
        })
        .catch(() => {
          if (active) {
            this.error.set(true);
            this.loading.set(false);
          }
        });
    });
  }
  protected choose(value: string): void {
    if (value === 'pt-BR' || value === 'en') this.language.choose(value);
  }
  protected imageFailed(id: string): void {
    this.failedImages.update((ids) => [...ids, id]);
  }
}
