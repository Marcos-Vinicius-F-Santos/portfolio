import { Routes } from '@angular/router';
import { adminAuthGuard } from './core/auth/admin-auth.guard';
import { AdminWorkspaceComponent } from './features/admin/pages/admin-workspace/admin-workspace.component';
import { AdminAuthenticationComponent } from './features/admin/pages/authentication/admin-authentication.component';
import { PortfolioPageComponent } from './features/portfolio/pages/portfolio-page/portfolio-page.component';
import { PortfolioContentService } from './features/portfolio/services/portfolio-content.service';
import { PublishedSnapshotContentService } from './features/portfolio/services/published-snapshot-content.service';

export const routes: Routes = [
  {
    path: 'projetos/:id',
    providers: [{ provide: PortfolioContentService, useClass: PublishedSnapshotContentService }],
    loadComponent: () =>
      import('./features/portfolio/pages/project-detail/project-detail.component').then(
        (m) => m.ProjectDetailComponent,
      ),
  },
  {
    path: '',
    component: PortfolioPageComponent,
    providers: [{ provide: PortfolioContentService, useClass: PublishedSnapshotContentService }],
    pathMatch: 'full',
  },
  {
    path: 'admin/editor',
    canMatch: [adminAuthGuard],
    loadComponent: () =>
      import('./features/admin/pages/visual-editor/visual-editor.component').then(
        (m) => m.VisualEditorComponent,
      ),
  },
  {
    path: 'admin/media',
    canMatch: [adminAuthGuard],
    loadComponent: () =>
      import('./features/admin/pages/media-management/media-management.component').then(
        (m) => m.MediaManagementComponent,
      ),
  },
  {
    path: 'admin/editor/projetos/:id',
    canMatch: [adminAuthGuard],
    loadComponent: () =>
      import(
        './features/admin/pages/editorial-project-detail/editorial-project-detail.component'
      ).then((m) => m.EditorialProjectDetailComponent),
  },
  { path: 'admin', component: AdminWorkspaceComponent, canMatch: [adminAuthGuard] },
  { path: 'admin', component: AdminAuthenticationComponent },
  { path: '**', redirectTo: '' },
];
