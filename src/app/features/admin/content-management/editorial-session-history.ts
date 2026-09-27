import { Injectable, inject, signal } from '@angular/core';
import { EditorialAutosaveQueue } from './editorial-autosave-queue';
import type { EditorialCommandReceipt, EditorialDraftCommand } from './editorial-draft.models';

export interface EditorialHistoryEntry {
  target: string;
  forward: EditorialDraftCommand | readonly EditorialDraftCommand[];
  inverse: EditorialDraftCommand | readonly EditorialDraftCommand[];
}

@Injectable({ providedIn: 'root' })
export class EditorialSessionHistory {
  private readonly autosave = inject(EditorialAutosaveQueue);
  private readonly undoState = signal<readonly EditorialHistoryEntry[]>([]);
  private readonly redoState = signal<readonly EditorialHistoryEntry[]>([]);
  readonly canUndo = () => this.undoState().length > 0;
  readonly canRedo = () => this.redoState().length > 0;

  record(entry: EditorialHistoryEntry): void {
    this.undoState.update((items) => [...items, entry]);
    this.redoState.set([]);
  }

  async undo(operationId: string): Promise<EditorialCommandReceipt> {
    const entry = this.undoState().at(-1);
    if (!entry) throw new Error('There is no editorial change to undo');
    const receipt = await this.run(entry.target, entry.inverse, operationId);
    this.undoState.update((items) => items.slice(0, -1));
    this.redoState.update((items) => [...items, entry]);
    return receipt;
  }

  async redo(operationId: string): Promise<EditorialCommandReceipt> {
    const entry = this.redoState().at(-1);
    if (!entry) throw new Error('There is no editorial change to redo');
    const receipt = await this.run(entry.target, entry.forward, operationId);
    this.redoState.update((items) => items.slice(0, -1));
    this.undoState.update((items) => [...items, entry]);
    return receipt;
  }

  clear(): void {
    this.undoState.set([]);
    this.redoState.set([]);
  }

  private async run(
    target: string,
    commands: EditorialDraftCommand | readonly EditorialDraftCommand[],
    operationId: string,
  ): Promise<EditorialCommandReceipt> {
    const sequence = Array.isArray(commands) ? commands : [commands];
    let receipt: EditorialCommandReceipt | undefined;
    for (const [index, command] of sequence.entries()) {
      receipt = await this.autosave.enqueue({
        operationId: index === 0 ? operationId : crypto.randomUUID(),
        target,
        command,
      });
    }
    if (!receipt) throw new Error('Editorial history entry has no commands');
    return receipt;
  }
}
