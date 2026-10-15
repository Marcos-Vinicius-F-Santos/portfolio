import { Routes } from '@angular/router';
import { PortfolioContentService } from './services/portfolio-content.service';
import { PublishedSnapshotContentService } from './services/published-snapshot-content.service';

export const portfolioRoutes: Routes = [
  {
    path: '',
    providers: [{ provide: PortfolioContentService, useClass: PublishedSnapshotContentService }],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./pages/portfolio-page/portfolio-page.component').then(
            (m) => m.PortfolioPageComponent,
          ),
        pathMatch: 'full',
      },
      {
        path: 'projetos/:id',
        loadComponent: () =>
          import('./pages/project-detail/project-detail.component').then(
            (m) => m.ProjectDetailComponent,
          ),
      },
    ],
  },
];
