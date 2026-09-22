import { DOCUMENT } from '@angular/common';
import { Component, inject } from '@angular/core';

@Component({
  selector: 'app-portfolio-page',
  templateUrl: './portfolio-page.html',
  styleUrl: './portfolio-page.scss',
})
export class PortfolioPage {
  protected readonly navigationItems = [
    { label: 'Sobre mim', targetId: 'sobre-mim' },
    { label: 'Experiências', targetId: 'experiencias' },
    { label: 'Stack técnica', targetId: 'stack-tecnica' },
  ] as const;

  private readonly document = inject(DOCUMENT);

  protected navigateToSection(event: Event, targetId: string): void {
    event.preventDefault();

    const target = this.document.getElementById(targetId);
    target?.scrollIntoView?.({ behavior: 'smooth', block: 'start' });
  }
}
