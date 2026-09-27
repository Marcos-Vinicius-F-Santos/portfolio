import { TestBed } from '@angular/core/testing';

import type { EditorialDraftV1 } from '../content-management/editorial-draft.models';
import { EditorialDraftContentService } from './editorial-draft-content.service';

describe('EditorialDraftContentService ordering', () => {
  it('preserva associações, persiste posição local e não reordena experiências por data', async () => {
    TestBed.configureTestingModule({ providers: [EditorialDraftContentService] });
    const service = TestBed.inject(EditorialDraftContentService);
    service.setDraft({
      formatVersion: 1,
      revision: 1,
      basePublicationId: null,
      defaultLocale: 'pt-BR',
      locales: [
        { code: 'pt-BR', label: 'Português', direction: 'ltr', status: 'active', position: 0 },
      ],
      sections: [],
      entities: {
        older: {
          kind: 'experience',
          parentId: undefined,
          position: 0,
          data: { startDate: '2020-01-01' },
        },
        newer: {
          kind: 'experience',
          parentId: undefined,
          position: 1,
          data: { startDate: '2025-01-01' },
        },
        professional: {
          kind: 'project',
          parentId: undefined,
          position: 0,
          data: { type: 'professional' },
        },
        personalA: {
          kind: 'project',
          parentId: undefined,
          position: 1,
          data: { type: 'personal' },
        },
        personalB: {
          kind: 'project',
          parentId: undefined,
          position: 2,
          data: { type: 'personal' },
        },
      },
      translations: { 'pt-BR': {} },
      technologies: {},
      media: {},
    } as unknown as EditorialDraftV1);

    expect((await service.listExperiences('pt-BR')).map(({ id }) => id)).toEqual([
      'older',
      'newer',
    ]);
    expect(service.reorderCollection('project', undefined, ['personalB', 'personalA'])).toEqual([
      'professional',
      'personalB',
      'personalA',
    ]);
    expect((await service.listProjects('pt-BR')).map(({ id }) => id)).toEqual([
      'professional',
      'personalB',
      'personalA',
    ]);
    expect(service.draft()!.entities['personalB'].data['type']).toBe('personal');
  });

  it('remove apenas do estado privado e produz comandos para restaurar vínculos e traduções', () => {
    TestBed.configureTestingModule({ providers: [EditorialDraftContentService] });
    const service = TestBed.inject(EditorialDraftContentService);
    service.setDraft({
      formatVersion: 1,
      revision: 1,
      basePublicationId: null,
      defaultLocale: 'pt-BR',
      locales: [
        { code: 'pt-BR', label: 'Português', direction: 'ltr', status: 'active', position: 0 },
      ],
      sections: [],
      entities: {
        project: { kind: 'project', position: 0, data: { type: 'personal' } },
        result: {
          kind: 'listItem',
          parentId: 'project',
          position: 0,
          data: { collection: 'results' },
        },
      },
      translations: { 'pt-BR': { project: { name: 'Projeto' }, result: { text: 'Resultado' } } },
      technologies: {},
      media: {},
    } as unknown as EditorialDraftV1);
    const removed = service.removeEntity('project');
    expect(removed.dependentCount).toBe(1);
    expect(service.draft()!.entities['project']).toBeUndefined();
    expect(removed.restore.map((command) => command.type)).toEqual([
      'add_entity',
      'set_translation',
      'add_entity',
      'set_translation',
    ]);
    expect((removed.restore[2] as { parentId?: string }).parentId).toBe('project');
  });
});
