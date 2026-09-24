import { TestBed } from '@angular/core/testing';
import type { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_CLIENT } from '../../../core/supabase/supabase-client';
import { PortfolioContentService } from './portfolio-content.service';

describe('PortfolioContentService', () => {
  it('loads the selected translation and keeps the content key', async () => {
    const client = fakeClient({
      portfolio_texts: [{ id: 'text-1', content_key: 'aboutTitle' }],
      portfolio_text_translations: [{ text_id: 'text-1', locale: 'en', value: 'About me' }],
    });
    const service = configure(client);

    await expect(service.loadCopy('en')).resolves.toEqual({ aboutTitle: 'About me' });
    expect(service.lastError()).toBeNull();
  });

  it('maps a project to its related ordered images', async () => {
    const client = fakeClient({
      portfolio_projects: [{ id: 'project-1', display_order: 1 }],
      portfolio_project_translations: [
        {
          project_id: 'project-1',
          locale: 'pt-BR',
          name: 'Projeto',
          description: 'Descrição',
          problem_context: 'Problema',
          solution: 'Solução',
          role: 'Autor',
          technical_decisions: ['Decisão'],
          technologies: ['Angular'],
          results: ['Resultado'],
          learnings: ['Aprendizado'],
          links: [{ label: 'Site', url: 'https://example.com' }],
        },
      ],
      portfolio_project_images: [
        {
          id: 'image-1',
          project_id: 'project-1',
          storage_path: 'project-1/01.png',
          original_name: '01.png',
          mime_type: 'image/png',
          size_bytes: 100,
          display_order: 1,
        },
        {
          id: 'image-2',
          project_id: 'project-1',
          storage_path: 'project-1/02.jpg',
          original_name: '02.jpg',
          mime_type: 'image/jpeg',
          size_bytes: 200,
          display_order: 2,
        },
      ],
    });
    const service = configure(client);

    const [project] = await service.listProjects('pt-BR');

    expect(project.name).toBe('Projeto');
    expect(project.images.map((image) => image.publicUrl)).toEqual([
      'https://storage.test/project-1/01.png',
      'https://storage.test/project-1/02.jpg',
    ]);
  });

  it('maps experiences with the approved name and orders by start date then display order', async () => {
    const client = fakeClient({
      portfolio_experiences: [
        {
          id: 'older',
          start_date: '2023-12-01',
          end_date: '2025-05-01',
          name: 'Digital Corp',
          display_order: 1,
        },
        {
          id: 'newer',
          start_date: '2025-05-01',
          end_date: '2026-03-01',
          name: 'Dairy Corp',
          display_order: 2,
        },
        {
          id: 'tie-first',
          start_date: '2024-01-01',
          end_date: '2024-06-01',
          name: 'Tie First',
          display_order: 2,
        },
        {
          id: 'tie-second',
          start_date: '2024-01-01',
          end_date: '2024-07-01',
          name: 'Tie Second',
          display_order: 1,
        },
      ],
      portfolio_experience_translations: [
        {
          experience_id: 'older',
          locale: 'pt-BR',
          title: 'Desenvolvedor',
          context: 'Digitalização corporativa',
          responsibilities: ['Responsabilidade antiga'],
          technical_decisions: ['Decisão antiga'],
          results: ['Resultado antigo'],
        },
        {
          experience_id: 'newer',
          locale: 'pt-BR',
          title: 'Engenheiro de software',
          context: 'Setor de laticínios',
          responsibilities: ['Responsabilidade nova'],
          technical_decisions: ['Decisão nova'],
          results: ['Resultado novo'],
        },
        {
          experience_id: 'tie-first',
          locale: 'pt-BR',
          title: 'Cargo 1',
          context: 'Contexto 1',
          responsibilities: ['Responsabilidade 1'],
          technical_decisions: ['Decisão 1'],
          results: ['Resultado 1'],
        },
        {
          experience_id: 'tie-second',
          locale: 'pt-BR',
          title: 'Cargo 2',
          context: 'Contexto 2',
          responsibilities: ['Responsabilidade 2'],
          technical_decisions: ['Decisão 2'],
          results: ['Resultado 2'],
        },
      ],
    });
    const service = configure(client);

    const experiences = await service.listExperiences('pt-BR');

    expect(experiences.map((experience) => experience.id)).toEqual([
      'newer',
      'tie-second',
      'tie-first',
      'older',
    ]);
    expect(experiences[0]).toMatchObject({
      name: 'Dairy Corp',
      title: 'Engenheiro de software',
      context: 'Setor de laticínios',
      responsibilities: ['Responsabilidade nova'],
      technicalDecisions: ['Decisão nova'],
      results: ['Resultado novo'],
    });
  });

  it('returns a safe fallback and exposes the error when a query fails', async () => {
    const service = configure(fakeClient({}, new Error('network unavailable')));

    await expect(service.listExperiences('pt-BR')).resolves.toEqual([]);
    expect(service.lastError()?.message).toBe('network unavailable');
  });

  it('returns empty content when public runtime configuration is absent', async () => {
    const service = configure(null);

    await expect(service.loadCopy('pt-BR')).resolves.toEqual({});
    await expect(service.listProjects('pt-BR')).resolves.toEqual([]);
    await expect(service.getCurriculum('pt-BR')).resolves.toBeNull();
  });
});

function configure(client: SupabaseClient | null): PortfolioContentService {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({
    providers: [
      PortfolioContentService,
      { provide: SUPABASE_CLIENT, useValue: client },
    ],
  });
  return TestBed.inject(PortfolioContentService);
}

function fakeClient(
  rows: Record<string, unknown[]>,
  failure: Error | null = null,
): SupabaseClient {
  const client = {
    from(table: string) {
      return query(rows[table] ?? [], failure);
    },
    storage: {
      from() {
        return {
          getPublicUrl(path: string) {
            return { data: { publicUrl: `https://storage.test/${path}` } };
          },
        };
      },
    },
  };
  return client as unknown as SupabaseClient;
}

function query(data: unknown[], error: Error | null) {
  const builder: Record<string, unknown> & { then: Promise<unknown>['then'] } = {
    select: () => builder,
    in: () => builder,
    eq: () => builder,
    order: () => builder,
    maybeSingle: () => builder,
    then: (resolve, reject) => Promise.resolve({ data, error }).then(resolve, reject),
  };
  return builder;
}
