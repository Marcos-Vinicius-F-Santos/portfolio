import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { signal } from '@angular/core';
import { ProjectDetailComponent } from './project-detail.component';
import { PortfolioContentService } from '../../services/portfolio-content.service';
import { PortfolioLanguageService, BROWSER_LANGUAGE } from '../../services/portfolio-language.service';
import { PortfolioProject } from '../../services/portfolio-content.models';

const project: PortfolioProject = {
  id: 'demo',
  type: 'personal',
  locale: 'pt-BR',
  displayOrder: 0,
  name: 'Demo',
  description: 'Description',
  problemContext: 'Context',
  solution: 'Solution',
  role: 'Developer',
  technicalDecisions: ['Ports'],
  technologies: ['React 18'],
  results: ['Working API'],
  learnings: ['Testing'],
  links: [{ label: 'Code', url: 'https://example.com' }],
  images: [
    {
      id: 'image',
      projectId: 'demo',
      storagePath: 'demo.png',
      originalName: 'demo.png',
      mimeType: 'image/png',
      sizeBytes: 100,
      displayOrder: 0,
      publicUrl: 'https://example.com/demo.png',
    },
  ],
};

describe('ProjectDetail routes', () => {
  let service: {
    listProjects: ReturnType<typeof vi.fn>;
    lastError: ReturnType<typeof signal<Error | null>>;
    isAvailable: ReturnType<typeof signal<boolean>>;
  };

  beforeEach(() => {
    localStorage.clear();
    service = {
      listProjects: vi.fn(async (locale: string) => [
        { ...project, name: locale === 'en' ? 'English Demo' : 'Demo' },
      ]),
      lastError: signal<Error | null>(null),
      isAvailable: signal(true),
    };
    TestBed.configureTestingModule({
      providers: [
        provideRouter([{ path: 'projetos/:id', component: ProjectDetailComponent }]),
        { provide: PortfolioContentService, useValue: service },
        { provide: BROWSER_LANGUAGE, useValue: () => 'pt-BR' },
      ],
    });
  });

  it('loads a direct project route, full details, images and language changes', async () => {
    const secondImage = {
      ...project.images[0]!,
      id: 'image-2',
      originalName: 'second.png',
      displayOrder: 1,
      publicUrl: 'https://example.com/second.png',
    };
    service.listProjects.mockImplementation(async (locale: string) => [
      {
        ...project,
        images: [project.images[0]!, secondImage],
        name: locale === 'en' ? 'English Demo' : 'Demo',
      },
    ]);
    const harness = await RouterTestingHarness.create('/projetos/demo');
    await TestBed.inject(PortfolioLanguageService);
    await harness.fixture.whenStable();
    harness.detectChanges();
    const element = harness.routeNativeElement!;
    expect(element.textContent).toContain('Solution');
    expect(element.textContent).toContain('Developer');
    expect(element.textContent).toContain('Working API');
    expect([...element.querySelectorAll('.gallery img')].map((image) => image.getAttribute('src'))).toEqual([
      'https://example.com/demo.png',
      'https://example.com/second.png',
    ]);
    expect(element.querySelector('.gallery img')?.getAttribute('alt')).toBe('Demo — demo.png');
    expect(element.querySelector('.gallery img')?.getAttribute('loading')).toBe('lazy');
    expect([...element.querySelectorAll('.gallery a')].map((link) => link.getAttribute('href'))).toEqual([
      'https://example.com/demo.png',
      'https://example.com/second.png',
    ]);
    expect(element.querySelector('nav a')?.getAttribute('href')).toBe('/#projetos');
    const select = element.querySelector('select')!;
    select.value = 'en';
    select.dispatchEvent(new Event('change'));
    await harness.fixture.whenStable();
    harness.detectChanges();
    expect(element.textContent).toContain('English Demo');
    expect(element.textContent).toContain('Back to projects');
  });

  it('keeps the detail gallery accessible when an image fails', async () => {
    service.listProjects.mockResolvedValue([{ ...project, images: [project.images[0]!] }]);
    const harness = await RouterTestingHarness.create('/projetos/demo');
    await harness.fixture.whenStable();
    harness.detectChanges();
    const image = harness.routeNativeElement!.querySelector('.gallery img')!;
    image.dispatchEvent(new Event('error'));
    harness.detectChanges();
    expect(harness.routeNativeElement!.querySelector('.gallery img')).toBeNull();
    expect(harness.routeNativeElement!.querySelector('.gallery')?.textContent).toContain(
      'Imagem indisponível',
    );
  });

  it('handles unknown IDs and hides galleries when there are no images', async () => {
    service.listProjects.mockResolvedValue([{ ...project, images: [] }]);
    const harness = await RouterTestingHarness.create('/projetos/demo');
    await harness.fixture.whenStable();
    harness.detectChanges();
    expect(harness.routeNativeElement?.querySelector('.gallery')).toBeNull();
    await harness.navigateByUrl('/projetos/missing', ProjectDetailComponent);
    await harness.fixture.whenStable();
    harness.detectChanges();
    expect(harness.routeNativeElement?.textContent).toContain('Projeto não encontrado');
  });

  it('shows a loading failure instead of reporting an unknown project', async () => {
    service.listProjects.mockRejectedValue(new Error('offline'));
    const harness = await RouterTestingHarness.create('/projetos/demo');
    await harness.fixture.whenStable();
    harness.detectChanges();
    expect(harness.routeNativeElement?.textContent).toContain('Não foi possível carregar');
  });
});
