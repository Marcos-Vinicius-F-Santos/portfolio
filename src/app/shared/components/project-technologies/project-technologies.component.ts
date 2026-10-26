import { Component, input, signal } from '@angular/core';
import { resolvePortfolioAssetUrl } from '../../../features/portfolio/services/portfolio-asset-url';
import { technologyIcon } from '../../../features/portfolio/services/technology-icons';

@Component({
  selector: 'app-project-technologies',
  templateUrl: './project-technologies.component.html',
  styleUrl: './project-technologies.component.css',
})
export class ProjectTechnologiesComponent {
  readonly technologies = input.required<string[]>();
  protected readonly failed = signal<string[]>([]);

  protected hide(url: string): void {
    this.failed.update((items) => [...items, url]);
  }

  protected icon(name: string): string | undefined {
    return resolvePortfolioAssetUrl(technologyIcon(name));
  }
}
