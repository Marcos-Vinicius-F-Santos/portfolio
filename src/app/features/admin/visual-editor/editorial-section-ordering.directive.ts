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
import { EditorialDraftContentService } from './editorial-draft-content.service';

@Directive({ selector: '[appEditorialSectionOrdering]' })
export class EditorialSectionOrderingDirective implements AfterViewInit, OnDestroy {
  readonly enabled = input(true, {
    alias: 'appEditorialSectionOrdering',
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
    this.host.querySelectorAll<HTMLElement>('[data-editorial-section-id]').forEach((section) => {
      const id = section.dataset['editorialSectionId'];
      if (
        !id ||
        id === 'presentation-section' ||
        section.querySelector(':scope > .editorial-section-controls')
      )
        return;
      section.draggable = true;
      section.addEventListener('dragstart', () => (this.dragged = id));
      section.addEventListener('dragover', (event) => event.preventDefault());
      section.addEventListener('drop', (event) => {
        event.preventDefault();
        if (this.dragged && this.dragged !== id) this.moveBefore(this.dragged, id);
      });
      const controls = this.host.ownerDocument.createElement('div');
      controls.className = 'editorial-section-controls';
      controls.setAttribute('aria-label', 'Ordenar seção');
      controls.append(
        this.button('Mover acima', () => this.move(id, -1)),
        this.button('Mover abaixo', () => this.move(id, 1)),
      );
      section.prepend(controls);
    });
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
  private move(id: string, delta: number): void {
    const ids = [...this.content.editorialSectionOrder()];
    const from = ids.indexOf(id);
    const to = Math.max(1, Math.min(ids.length - 1, from + delta));
    if (from < 1 || from === to) return;
    ids.splice(from, 1);
    ids.splice(to, 0, id);
    this.persist(ids);
  }
  private moveBefore(id: string, before: string): void {
    const ids = [...this.content.editorialSectionOrder()];
    const from = ids.indexOf(id);
    let to = ids.indexOf(before);
    if (from < 1 || to < 1) return;
    ids.splice(from, 1);
    to = ids.indexOf(before);
    ids.splice(to, 0, id);
    this.persist(ids);
  }
  private persist(ids: string[]): void {
    this.content.reorderSections(ids);
    void this.autosave
      .enqueue({
        operationId: crypto.randomUUID(),
        target: 'sections.order',
        command: { type: 'set_section_order', sectionIds: ids },
      })
      .catch(() => undefined);
  }
  private clear(): void {
    this.host
      .querySelectorAll('.editorial-section-controls')
      .forEach((control) => control.remove());
    this.host
      .querySelectorAll<HTMLElement>('[data-editorial-section-id]')
      .forEach((section) => section.removeAttribute('draggable'));
  }
}
