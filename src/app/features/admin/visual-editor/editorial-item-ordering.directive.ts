import {
  AfterViewInit,
  Directive,
  ElementRef,
  OnDestroy,
  booleanAttribute,
  effect,
  inject,
  input,
} from '@angular/core';

import { EditorialAutosaveQueue } from '../content-management/editorial-autosave-queue';
import type { EditorialSnapshotEntity } from '../../portfolio/content/editorial-snapshot.models';
import { EditorialDraftContentService } from './editorial-draft-content.service';

@Directive({ selector: '[appEditorialItemOrdering]' })
export class EditorialItemOrderingDirective implements AfterViewInit, OnDestroy {
  readonly enabled = input(true, {
    alias: 'appEditorialItemOrdering',
    transform: booleanAttribute,
  });
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly autosave = inject(EditorialAutosaveQueue);
  private readonly content = inject(EditorialDraftContentService);
  private observer: MutationObserver | null = null;
  private dragged = '';
  private readonly mode = effect(() => (this.enabled() ? this.prepare() : this.clear()));

  ngAfterViewInit(): void {
    this.prepare();
    const Observer = this.host.ownerDocument.defaultView?.MutationObserver;
    if (Observer) {
      this.observer = new Observer(() => this.prepare());
      this.observer.observe(this.host, { childList: true, subtree: true });
    }
  }
  ngOnDestroy(): void {
    this.observer?.disconnect();
    this.mode.destroy();
  }

  private prepare(): void {
    if (!this.enabled()) return;
    this.collections().forEach((collection) =>
      this.items(collection).forEach((item) => {
        const id = item.dataset['editorialItemId'];
        if (!id || item.querySelector(':scope > .editorial-item-controls')) return;
        item.draggable = true;
        item.addEventListener('dragstart', () => (this.dragged = id));
        item.addEventListener('dragover', (event) => event.preventDefault());
        item.addEventListener('drop', (event) => {
          event.preventDefault();
          if (this.dragged && this.dragged !== id) this.moveBefore(collection, this.dragged, id);
        });
        const controls = this.host.ownerDocument.createElement('div');
        controls.className = 'editorial-item-controls';
        controls.setAttribute('aria-label', 'Ordenar item');
        controls.append(
          this.button('Mover acima', () => this.move(collection, id, -1)),
          this.button('Mover abaixo', () => this.move(collection, id, 1)),
        );
        item.prepend(controls);
      }),
    );
  }
  private collections(): HTMLElement[] {
    return [...this.host.querySelectorAll<HTMLElement>('[data-editorial-collection-kind]')];
  }
  private items(collection: HTMLElement): HTMLElement[] {
    return [...collection.querySelectorAll<HTMLElement>('[data-editorial-item-id]')].filter(
      (item) => item.closest('[data-editorial-collection-kind]') === collection,
    );
  }
  private button(label: string, action: () => void): HTMLButtonElement {
    const button = this.host.ownerDocument.createElement('button');
    button.type = 'button';
    button.textContent = label;
    button.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      action();
    });
    return button;
  }
  private move(collection: HTMLElement, id: string, delta: number): void {
    const ids = this.items(collection).map((item) => item.dataset['editorialItemId']!);
    const from = ids.indexOf(id);
    const to = Math.max(0, Math.min(ids.length - 1, from + delta));
    if (from < 0 || from === to) return;
    ids.splice(from, 1);
    ids.splice(to, 0, id);
    this.persist(collection, ids);
  }
  private moveBefore(collection: HTMLElement, id: string, before: string): void {
    const ids = this.items(collection).map((item) => item.dataset['editorialItemId']!);
    const from = ids.indexOf(id);
    if (from < 0 || !ids.includes(before)) return;
    ids.splice(from, 1);
    ids.splice(ids.indexOf(before), 0, id);
    this.persist(collection, ids);
  }
  private persist(collection: HTMLElement, visibleIds: string[]): void {
    const kind = collection.dataset['editorialCollectionKind'] as EditorialSnapshotEntity['kind'];
    const parentId = collection.dataset['editorialParentId'] || undefined;
    const entityIds = this.content.reorderCollection(kind, parentId, visibleIds);
    void this.autosave
      .enqueue({
        operationId: crypto.randomUUID(),
        target: `${kind}.${parentId ?? 'root'}.order`,
        command: { type: 'reorder_collection', kind, parentId, entityIds },
      })
      .catch(() => undefined);
  }
  private clear(): void {
    this.host.querySelectorAll('.editorial-item-controls').forEach((control) => control.remove());
    this.host
      .querySelectorAll<HTMLElement>('[data-editorial-item-id]')
      .forEach((item) => item.removeAttribute('draggable'));
  }
}
