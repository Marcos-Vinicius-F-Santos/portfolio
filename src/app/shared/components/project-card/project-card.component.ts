import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import type { PortfolioLocale, PortfolioProject } from '../../../features/portfolio/services/portfolio-content.models';
import { getUiLabels } from '../../../features/portfolio/services/portfolio-ui-labels';
import { ProjectTechnologiesComponent } from '../project-technologies/project-technologies.component';

@Component({
  selector: 'app-project-card',
  standalone: true,
  imports: [ProjectTechnologiesComponent],
  templateUrl: './project-card.component.html',
  styleUrl: './project-card.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectCardComponent {
  readonly project = input.required<PortfolioProject>();
  readonly editorialMode = input<boolean>(false);
  readonly locale = input<PortfolioLocale>('pt-BR');

  protected readonly failedImages = signal<Record<string, boolean>>({});

  protected readonly coverImage = computed(() => {
    const images = this.project().images;
    if (!images || images.length === 0) return null;
    const sorted = [...images].sort((a, b) => a.displayOrder - b.displayOrder);
    return sorted.find((img) => !this.failedImages()[img.id]) ?? null;
  });

  protected readonly externalUrl = computed(() => {
    const links = this.project().links;
    if (!links || links.length === 0) return null;
    return links[0]?.url || null;
  });

  protected readonly detailsUrl = computed(() => {
    const base = this.editorialMode() ? '/admin/editor/projetos/' : '/projetos/';
    return base + this.project().id;
  });

  protected readonly projectInitials = computed(() => {
    const name = this.project().name?.trim();
    if (!name) return 'PR';
    const words = name.split(/\s+/).filter(Boolean);
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  });

  protected readonly ui = computed(() => getUiLabels(this.locale()));

  protected onImageError(imageId: string): void {
    this.failedImages.update((prev) => ({ ...prev, [imageId]: true }));
  }
}

