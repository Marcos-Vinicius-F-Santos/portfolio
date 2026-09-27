import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { EditorialAutosaveQueue } from './editorial-autosave-queue';
import { EditorialCommandService } from './editorial-command.service';
import type { EditorialDraftCommand } from './editorial-draft.models';

const command: EditorialDraftCommand = {
  type: 'set_translation', entityId: 'copy-aboutTitle', locale: 'pt-BR', field: 'text', value: 'Novo',
};
const change = (operationId: string) => ({ operationId, target: 'about.title', command });

describe('EditorialAutosaveQueue', () => {
  const save = vi.fn();
  let queue: EditorialAutosaveQueue;

  beforeEach(() => {
    save.mockReset();
    TestBed.configureTestingModule({ providers: [{ provide: EditorialCommandService, useValue: { save } }] });
    queue = TestBed.inject(EditorialAutosaveQueue);
    queue.initialize(7);
  });

  it('serializa comandos e usa a última revisão confirmada', async () => {
    let release!: () => void;
    save.mockImplementationOnce(() => new Promise((resolve) => { release = () => resolve({ operationId: 'a', revision: 8, repeated: false }); }))
      .mockResolvedValueOnce({ operationId: 'b', revision: 9, repeated: false });
    const first = queue.enqueue(change('a'));
    const second = queue.enqueue(change('b'));
    await Promise.resolve();
    expect(save).toHaveBeenCalledTimes(1);
    release();
    await Promise.all([first, second]);
    expect(save.mock.calls.map((call) => call[0])).toEqual([7, 8]);
    expect(queue.confirmedRevision()).toBe(9);
    expect(queue.status()).toBe('saved');
  });

  it('preserva alvo e comando em conflito e não avança a revisão', async () => {
    save.mockRejectedValueOnce({ code: '40001', message: 'revision conflict' });
    await expect(queue.enqueue(change('conflict'))).rejects.toMatchObject({ code: '40001' });
    expect(queue.status()).toBe('conflict');
    expect(queue.failure()?.target).toBe('about.title');
    expect(queue.failure()?.command).toEqual(command);
    expect(queue.confirmedRevision()).toBe(7);
  });

  it('repete com o mesmo operationId após falha de rede', async () => {
    save.mockRejectedValueOnce({ status: 0 }).mockResolvedValueOnce({ operationId: 'retry', revision: 8, repeated: true });
    await expect(queue.enqueue(change('retry'))).rejects.toBeTruthy();
    await queue.retry();
    expect(save.mock.calls.map((call) => call[1])).toEqual(['retry', 'retry']);
    expect(queue.confirmedRevision()).toBe(8);
  });

  it('não deixa uma confirmação menor rebaixar a revisão', async () => {
    save.mockResolvedValueOnce({ operationId: 'old', revision: 6, repeated: true });
    await queue.enqueue(change('old'));
    expect(queue.confirmedRevision()).toBe(7);
  });
});
