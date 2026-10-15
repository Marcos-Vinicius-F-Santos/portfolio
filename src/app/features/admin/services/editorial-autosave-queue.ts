import { Injectable, computed, inject, signal } from '@angular/core';

import { EditorialCommandService } from './editorial-command.service';
import type { EditorialCommandReceipt, EditorialDraftCommand } from './editorial-draft.models';

export type EditorialAutosaveStatus = 'saved' | 'unsaved' | 'saving' | 'failed' | 'conflict';

export interface EditorialPendingChange {
  operationId: string;
  target: string;
  command: EditorialDraftCommand;
}

export interface EditorialAutosaveFailure extends EditorialPendingChange {
  reason: 'conflict' | 'network' | 'unauthorized' | 'unknown';
  error: unknown;
}

@Injectable({ providedIn: 'root' })
export class EditorialAutosaveQueue {
  private readonly commands = inject(EditorialCommandService);
  private readonly confirmedRevisionState = signal(0);
  private readonly queuedCountState = signal(0);
  private readonly activeState = signal(false);
  private readonly failureState = signal<EditorialAutosaveFailure | null>(null);
  private tail: Promise<void> = Promise.resolve();

  readonly confirmedRevision = this.confirmedRevisionState.asReadonly();
  readonly pendingCount = computed(
    () => this.queuedCountState() + (this.activeState() ? 1 : 0),
  );
  readonly failure = this.failureState.asReadonly();
  readonly status = computed<EditorialAutosaveStatus>(() => {
    const failure = this.failureState();
    if (failure?.reason === 'conflict') return 'conflict';
    if (failure) return 'failed';
    if (this.activeState()) return 'saving';
    if (this.queuedCountState() > 0) return 'unsaved';
    return 'saved';
  });

  initialize(revision: number): void {
    if (!Number.isSafeInteger(revision) || revision < 0) throw new Error('Invalid draft revision');
    if (this.pendingCount() > 0) throw new Error('Cannot replace revision while autosave is pending');
    this.confirmedRevisionState.set(revision);
    this.failureState.set(null);
  }

  enqueue(change: EditorialPendingChange): Promise<EditorialCommandReceipt> {
    this.queuedCountState.update((count) => count + 1);
    const result = this.tail.then(() => this.persist(change));
    this.tail = result.then(
      () => undefined,
      () => undefined,
    );
    return result;
  }

  retry(): Promise<EditorialCommandReceipt> {
    const failure = this.failureState();
    if (!failure) return Promise.reject(new Error('There is no failed autosave to retry'));
    this.failureState.set(null);
    return this.enqueue(failure);
  }

  async flush(): Promise<void> {
    await this.tail;
    if (this.failureState()) throw new Error('Autosave has an unresolved failure');
  }

  private async persist(change: EditorialPendingChange): Promise<EditorialCommandReceipt> {
    this.queuedCountState.update((count) => Math.max(0, count - 1));
    this.activeState.set(true);
    try {
      const receipt = await this.commands.save(
        this.confirmedRevisionState(),
        change.operationId,
        change.command,
      );
      this.confirmedRevisionState.update((revision) => Math.max(revision, receipt.revision));
      if (this.failureState()?.operationId === change.operationId) this.failureState.set(null);
      return receipt;
    } catch (error) {
      this.failureState.set({ ...change, reason: classifyFailure(error), error });
      throw error;
    } finally {
      this.activeState.set(false);
    }
  }
}

function classifyFailure(error: unknown): EditorialAutosaveFailure['reason'] {
  if (!error || typeof error !== 'object') return 'unknown';
  const value = error as Record<string, unknown>;
  if (value['code'] === '40001') return 'conflict';
  if (value['code'] === '42501' || value['status'] === 401 || value['status'] === 403)
    return 'unauthorized';
  if (value['status'] === 0 || value['name'] === 'TypeError') return 'network';
  return 'unknown';
}
