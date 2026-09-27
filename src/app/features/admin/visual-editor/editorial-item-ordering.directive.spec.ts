import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';

import { EditorialAutosaveQueue } from '../content-management/editorial-autosave-queue';
import { EditorialDraftContentService } from './editorial-draft-content.service';
import { EditorialItemOrderingDirective } from './editorial-item-ordering.directive';

@Component({
  imports: [EditorialItemOrderingDirective],
  template: `<main appEditorialItemOrdering>
    <div data-editorial-collection-kind="project">
      <article data-editorial-item-id="professional-1">Um</article>
      <article data-editorial-item-id="professional-2">Dois</article>
    </div>
  </main>`,
})
class Host {}

describe('EditorialItemOrderingDirective', () => {
  const enqueue = vi.fn();
  const reorderCollection = vi.fn();
  let fixture: ComponentFixture<Host>;

  beforeEach(() => {
    enqueue.mockReset().mockResolvedValue({ revision: 2 });
    reorderCollection
      .mockReset()
      .mockImplementation((_kind, _parent, visible: string[]) => [...visible, 'personal-1']);
    TestBed.configureTestingModule({
      imports: [Host],
      providers: [
        { provide: EditorialAutosaveQueue, useValue: { enqueue } },
        { provide: EditorialDraftContentService, useValue: { reorderCollection } },
      ],
    });
    fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
  });

  it('move por controles acessíveis e envia a coleção completa', () => {
    const first = fixture.nativeElement.querySelector(
      '[data-editorial-item-id="professional-1"]',
    ) as HTMLElement;
    const down = [...first.querySelectorAll('button')].find(
      (button) => button.textContent === 'Mover abaixo',
    ) as HTMLButtonElement;
    down.click();

    expect(reorderCollection).toHaveBeenCalledWith('project', undefined, [
      'professional-2',
      'professional-1',
    ]);
    expect(enqueue.mock.calls[0][0].command).toEqual({
      type: 'reorder_collection',
      kind: 'project',
      parentId: undefined,
      entityIds: ['professional-2', 'professional-1', 'personal-1'],
    });
  });

  it('oferece a mesma alteração por arraste', () => {
    const first = fixture.nativeElement.querySelector(
      '[data-editorial-item-id="professional-1"]',
    ) as HTMLElement;
    const second = fixture.nativeElement.querySelector(
      '[data-editorial-item-id="professional-2"]',
    ) as HTMLElement;
    second.dispatchEvent(new Event('dragstart', { bubbles: true }));
    first.dispatchEvent(new Event('drop', { bubbles: true, cancelable: true }));
    expect(reorderCollection).toHaveBeenCalledWith('project', undefined, [
      'professional-2',
      'professional-1',
    ]);
  });
});
