import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import type { PortfolioLocale } from '../../../features/portfolio/services/portfolio-content.models';
import { getUiLabels } from '../../../features/portfolio/services/portfolio-ui-labels';

@Component({
  selector: 'app-site-footer',
  standalone: true,
  templateUrl: './site-footer.component.html',
  styleUrl: './site-footer.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SiteFooterComponent {
  readonly brandMonogram = input<string>('PF');
  readonly authorName = input<string>('Desenvolvedor de Software');
  readonly locale = input<PortfolioLocale>('pt-BR');

  readonly currentYear = new Date().getFullYear();
  protected readonly ui = computed(() => getUiLabels(this.locale()));
}

