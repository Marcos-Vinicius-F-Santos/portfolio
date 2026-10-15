import { Routes } from '@angular/router';
import { adminAuthGuard } from '../../core/auth/admin-auth.guard';

export const adminRoutes: Routes = [
  {
    path: 'editor',
    canMatch: [adminAuthGuard],
    loadComponent: () =>
      import('./pages/visual-editor/visual-editor.component').then(
        (m) => m.VisualEditorComponent,
      ),
  },
  {
    path: 'media',
    canMatch: [adminAuthGuard],
    loadComponent: () =>
      import('./pages/media-management/media-management.component').then(
        (m) => m.MediaManagementComponent,
      ),
  },
  {
    path: 'editor/projetos/:id',
    canMatch: [adminAuthGuard],
    loadComponent: () =>
      import(
        './pages/editorial-project-detail/editorial-project-detail.component'
      ).then((m) => m.EditorialProjectDetailComponent),
  },
  {
    path: '',
    canMatch: [adminAuthGuard],
    loadComponent: () =>
      import('./pages/admin-workspace/admin-workspace.component').then(
        (m) => m.AdminWorkspaceComponent,
      ),
  },
  {
    path: '',
    loadComponent: () =>
      import('./pages/authentication/admin-authentication.component').then(
        (m) => m.AdminAuthenticationComponent,
      ),
  },
];
