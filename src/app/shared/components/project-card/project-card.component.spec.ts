import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { ProjectCardComponent } from './project-card.component';
import type { PortfolioProject } from '../../../features/portfolio/services/portfolio-content.models';

function mockProject(overrides: Partial<PortfolioProject> = {}): PortfolioProject {
  return {
    id: 'proj-test-1',
    displayOrder: 0,
    type: 'personal',
    locale: 'pt-BR',
    name: 'Projeto Exemplo',
    description: 'Descrição de teste do projeto exemplo com três linhas de detalhe.',
    problemContext: 'Contexto do problema de teste.',
    solution: 'Solução arquitetada de teste.',
    role: 'Engenheiro de Software',
    technicalDecisions: ['Decisão 1'],
    technologies: ['TypeScript', 'Angular'],
    results: ['Resultado 1'],
    learnings: ['Aprendizado 1'],
    links: [{ label: 'GitHub', url: 'https://github.com/exemplo/projeto' }],
    images: [],
    ...overrides,
  };
}

describe('ProjectCardComponent', () => {
  async function renderCard(project: PortfolioProject, editorialMode = false) {
    const fixture = TestBed.createComponent(ProjectCardComponent);
    fixture.componentRef.setInput('project', project);
    fixture.componentRef.setInput('editorialMode', editorialMode);
    fixture.componentRef.setInput('locale', 'pt-BR');
    fixture.detectChanges();
    await fixture.whenStable();
    return { fixture, element: fixture.nativeElement as HTMLElement };
  }

  it('renders project title, description and technologies', async () => {
    const project = mockProject();
    const { element } = await renderCard(project);

    expect(element.querySelector('.project-card__title')?.textContent).toContain('Projeto Exemplo');
    expect(element.querySelector('.project-card__description')?.textContent).toContain(
      'Descrição de teste',
    );
    expect(element.querySelector('app-project-technologies')).toBeTruthy();
  });

  it('renders SVG placeholder when project has no images', async () => {
    const project = mockProject({ images: [] });
    const { element } = await renderCard(project);

    expect(element.querySelector('[data-testid="project-cover"]')).toBeNull();
    const placeholder = element.querySelector('[data-testid="project-cover-placeholder"]');
    expect(placeholder).toBeTruthy();
    expect(placeholder?.textContent).toContain('PE'); // Initials of "Projeto Exemplo"
  });

  it('renders cover image when available, and falls back to placeholder on error', async () => {
    const project = mockProject({
      images: [
        {
          id: 'img-1',
          projectId: 'proj-test-1',
          storagePath: 'cover.jpg',
          originalName: 'cover.jpg',
          mimeType: 'image/jpeg',
          sizeBytes: 1000,
          displayOrder: 0,
          publicUrl: 'https://exemplo.com/cover.jpg',
        },
      ],
    });

    const { fixture, element } = await renderCard(project);

    const img = element.querySelector<HTMLImageElement>('[data-testid="project-cover"]');
    expect(img).toBeTruthy();
    expect(img?.src).toBe('https://exemplo.com/cover.jpg');

    // Simulate image load error
    img?.dispatchEvent(new Event('error'));
    fixture.detectChanges();
    await fixture.whenStable();

    expect(element.querySelector('[data-testid="project-cover"]')).toBeNull();
    expect(element.querySelector('[data-testid="project-cover-placeholder"]')).toBeTruthy();
  });

  it('renders demo badge linking to external URL when link is present', async () => {
    const project = mockProject({
      links: [{ label: 'Demo', url: 'https://exemplo.com/demo' }],
    });
    const { element } = await renderCard(project);

    const demoBadge = element.querySelector<HTMLAnchorElement>('[data-testid="project-demo-link"]');
    expect(demoBadge).toBeTruthy();
    expect(demoBadge?.href).toBe('https://exemplo.com/demo');
    expect(demoBadge?.target).toBe('_blank');
  });

  it('navigates to public details URL by default and admin editor URL in editorial mode', async () => {
    const project = mockProject({ id: 'proj-xyz' });
    const { element: publicEl } = await renderCard(project, false);
    const linkPublic = publicEl.querySelector<HTMLAnchorElement>('.project-card__details-btn');
    expect(linkPublic?.href).toContain('/projetos/proj-xyz');

    const { element: adminEl } = await renderCard(project, true);
    const linkAdmin = adminEl.querySelector<HTMLAnchorElement>('.project-card__details-btn');
    expect(linkAdmin?.href).toContain('/admin/editor/projetos/proj-xyz');
  });

  it('renders public visibility badge when project visibility is public', async () => {
    const project = mockProject({ visibility: 'public' });
    const { element } = await renderCard(project);

    const badge = element.querySelector('[data-testid="project-visibility-public"]');
    expect(badge).toBeTruthy();
    expect(badge?.textContent).toContain('Público');
  });

  it('renders private visibility badge when project visibility is private', async () => {
    const project = mockProject({ visibility: 'private', links: [] });
    const { element } = await renderCard(project);

    const badge = element.querySelector('[data-testid="project-visibility-private"]');
    expect(badge).toBeTruthy();
    expect(badge?.textContent).toContain('Privado');
  });

  it('renders English visibility badge when locale is en', async () => {
    const project = mockProject({ visibility: 'private' });
    const fixture = TestBed.createComponent(ProjectCardComponent);
    fixture.componentRef.setInput('project', project);
    fixture.componentRef.setInput('editorialMode', false);
    fixture.componentRef.setInput('locale', 'en');
    fixture.detectChanges();
    await fixture.whenStable();

    const badge = (fixture.nativeElement as HTMLElement).querySelector(
      '[data-testid="project-visibility-private"]',
    );
    expect(badge?.textContent).toContain('Private');
  });
});

