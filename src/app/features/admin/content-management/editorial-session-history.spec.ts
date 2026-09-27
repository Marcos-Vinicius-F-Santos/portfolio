import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { EditorialAutosaveQueue } from './editorial-autosave-queue';
import { EditorialSessionHistory } from './editorial-session-history';

describe('EditorialSessionHistory', () => {
  const enqueue = vi.fn();
  let history: EditorialSessionHistory;
  const forward = {
    type: 'set_translation',
    entityId: 'x',
    locale: 'pt-BR',
    field: 'text',
    value: 'new',
  } as const;
  const inverse = { ...forward, value: 'old' } as const;
  beforeEach(() => {
    enqueue.mockReset().mockResolvedValue({ operationId: 'op', revision: 2, repeated: false });
    TestBed.configureTestingModule({
      providers: [{ provide: EditorialAutosaveQueue, useValue: { enqueue } }],
    });
    history = TestBed.inject(EditorialSessionHistory);
  });
  it('desfaz e refaz pela fila usando comandos inversos', async () => {
    history.record({ target: 'x.text', forward, inverse });
    await history.undo('undo');
    expect(enqueue).toHaveBeenLastCalledWith({
      operationId: 'undo',
      target: 'x.text',
      command: inverse,
    });
    expect(history.canRedo()).toBe(true);
    await history.redo('redo');
    expect(enqueue).toHaveBeenLastCalledWith({
      operationId: 'redo',
      target: 'x.text',
      command: forward,
    });
    expect(history.canUndo()).toBe(true);
  });
  it('mantém a entrada disponível quando a reversão conflita', async () => {
    history.record({ target: 'x.text', forward, inverse });
    enqueue.mockRejectedValueOnce({ code: '40001' });
    await expect(history.undo('undo')).rejects.toBeTruthy();
    expect(history.canUndo()).toBe(true);
    expect(history.canRedo()).toBe(false);
  });
  it('restaura uma árvore removida na ordem dos comandos inversos', async () => {
    const restore = [
      {
        type: 'add_entity',
        entityId: 'parent',
        kind: 'project',
        position: 0,
        data: { type: 'personal' },
        translations: {},
      },
      {
        type: 'add_entity',
        entityId: 'child',
        kind: 'listItem',
        parentId: 'parent',
        position: 0,
        data: { collection: 'results' },
        translations: {},
      },
    ] as const;
    history.record({
      target: 'parent.remove',
      forward: { type: 'remove_entity', entityId: 'parent' },
      inverse: restore,
    });
    await history.undo('undo-tree');
    expect(enqueue.mock.calls.map(([change]) => change.command)).toEqual(restore);
    expect(history.canRedo()).toBe(true);
  });
});
