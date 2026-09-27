import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';

import { EditorialAutosaveQueue } from '../content-management/editorial-autosave-queue';
import { EditorialSessionHistory } from '../content-management/editorial-session-history';
import { EditorialDraftContentService } from './editorial-draft-content.service';
import { EditorialItemLifecycleDirective } from './editorial-item-lifecycle.directive';

@Component({
  imports: [EditorialItemLifecycleDirective],
  template: `<main appEditorialItemLifecycle>
    <div data-editorial-collection-kind="project" data-editorial-new-type="personal">
      <article data-editorial-item-id="project-1">Projeto</article>
    </div>
  </main>`,
})
class Host {}

describe('EditorialItemLifecycleDirective', () => {
  const enqueue = vi.fn();
  const record = vi.fn();
  const addEntity = vi.fn();
  const removeEntity = vi.fn();
  let fixture: ComponentFixture<Host>;

  beforeEach(() => {
    enqueue.mockReset().mockResolvedValue({ revision: 2 });
    record.mockReset();
    addEntity.mockReset();
    removeEntity.mockReset().mockReturnValue({ restore: [] });
    vi.stubGlobal(
      'confirm',
      vi.fn(() => true),
    );
    TestBed.configureTestingModule({
      imports: [Host],
      providers: [
        { provide: EditorialAutosaveQueue, useValue: { enqueue } },
        { provide: EditorialSessionHistory, useValue: { record } },
        {
          provide: EditorialDraftContentService,
          useValue: { addEntity, removeEntity, dependencyCount: () => 2, nextPosition: () => 3 },
        },
      ],
    });
    fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
  });

  it('adiciona item com ID estável e associação explícita', () => {
    (fixture.nativeElement.querySelector('.editorial-add-item') as HTMLButtonElement).click();
    const command = addEntity.mock.calls[0][0];
    expect(command).toMatchObject({
      type: 'add_entity',
      kind: 'project',
      position: 3,
      data: { type: 'personal' },
    });
    expect(command.entityId).toMatch(/^[0-9a-f-]{36}$/);
    expect(record.mock.calls[0][0].inverse).toEqual({
      type: 'remove_entity',
      entityId: command.entityId,
    });
  });

  it('explica dependências, confirma e mantém restauração no histórico', () => {
    removeEntity.mockReturnValue({ restore: [{ type: 'add_entity', entityId: 'project-1' }] });
    (fixture.nativeElement.querySelector('.editorial-remove-item') as HTMLButtonElement).click();
    expect(confirm).toHaveBeenCalledWith(
      'Remover este item e 2 item(ns) dependente(s) do rascunho?',
    );
    expect(record.mock.calls[0][0].inverse).toHaveLength(1);
    expect(enqueue.mock.calls[0][0].command).toEqual({
      type: 'remove_entity',
      entityId: 'project-1',
    });
  });
});
