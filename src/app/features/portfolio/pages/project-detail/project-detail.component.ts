import { DOCUMENT } from '@angular/common';
import { Component, computed, effect, inject, signal } from '@angular/core';
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
@Component({
  selector: 'app-project-detail',
  imports: [ProjectTechnologiesComponent],
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
