import {
  AfterViewInit,
  Directive,
  ElementRef,
  HostListener,
  OnDestroy,
  booleanAttribute,
  effect,
  inject,
  input,
} from '@angular/core';
import { EditorialAutosaveQueue } from '../content-management/editorial-autosave-queue';
import { EditorialDraftContentService } from './editorial-draft-content.service';

@Directive({ selector: '[appEditorialStructuredEditing]' })
export class EditorialStructuredEditingDirective implements AfterViewInit, OnDestroy {
  readonly enabled = input(true, {
    alias: 'appEditorialStructuredEditing',
    transform: booleanAttribute,
  });
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly autosave = inject(EditorialAutosaveQueue);
  private readonly content = inject(EditorialDraftContentService);
  private observer: MutationObserver | null = null;
  private readonly modeEffect = effect(() => (this.enabled() ? this.prepare() : this.clear()));

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
    this.modeEffect.destroy();
  }
  private prepare(): void {
    if (!this.enabled()) return;
    this.host.querySelectorAll<HTMLElement>('[data-editorial-control]').forEach((target) => {
      target.tabIndex = 0;
      target.setAttribute('aria-label', 'F2 para editar dados estruturados');
    });
  }
  private clear(): void {
    this.host.querySelectorAll<HTMLElement>('[data-editorial-control]').forEach((target) => {
      target.removeAttribute('tabindex');
      target.removeAttribute('aria-label');
    });
    this.host
      .querySelectorAll('.editorial-structured-control')
      .forEach((control) => control.remove());
  }

  @HostListener('keydown', ['$event']) onKeydown(event: KeyboardEvent): void {
    if (!this.enabled() || event.key !== 'F2') return;
    const target = (event.target as Element)?.closest<HTMLElement>('[data-editorial-control]');
    if (target && this.host.contains(target)) {
      event.preventDefault();
      this.edit(target);
    }
  }

  private edit(target: HTMLElement): void {
    const entityId = target.dataset['editorialEntity'];
    const control = target.dataset['editorialControl'];
    if (!entityId || !control) return;
    if (control === 'url')
      this.editSingle(
        target,
        'url',
        target.dataset['editorialField'] ?? 'href',
        target.dataset['editorialValue'] ?? '',
      );
    if (control === 'project-type')
      this.editSingle(target, 'select', 'type', target.dataset['editorialValue'] ?? 'personal', [
        'professional',
        'personal',
      ]);
    if (control === 'date-range') this.editDates(target, entityId);
    if (control === 'technologies') this.editTechnologies(target, entityId);
  }

  private editSingle(
    target: HTMLElement,
    type: string,
    field: string,
    value: string,
    options: string[] = [],
  ): void {
    const editor =
      type === 'select' ? document.createElement('select') : document.createElement('input');
    if (editor instanceof HTMLInputElement) editor.type = type;
    options.forEach((value) => {
      const option = document.createElement('option');
      option.value = option.textContent = value;
      editor.append(option);
    });
    editor.value = value;
    this.mount(target, editor, () => this.saveField(target, field, editor.value));
  }
  private editDates(target: HTMLElement, entityId: string): void {
    const wrap = document.createElement('span');
    const start = document.createElement('input');
    const end = document.createElement('input');
    start.type = end.type = 'date';
    start.value = target.dataset['editorialStartDate'] ?? '';
    end.value = target.dataset['editorialEndDate'] ?? '';
    wrap.append(start, end);
    this.mount(target, wrap, async () => {
      await this.save(entityId, {
        type: 'set_field',
        entityId,
        field: 'startDate',
        value: start.value,
      });
      await this.save(entityId, {
        type: 'set_field',
        entityId,
        field: 'endDate',
        value: end.value || null,
      });
    });
  }
  private editTechnologies(target: HTMLElement, entityId: string): void {
    const select = document.createElement('select');
    select.multiple = true;
    const selected = new Set((target.dataset['editorialValue'] ?? '').split(',').filter(Boolean));
    Object.entries(this.content.draft()?.technologies ?? {}).forEach(([id, item]) => {
      const option = document.createElement('option');
      option.value = id;
      option.textContent = item.label;
      option.selected = selected.has(id);
      select.append(option);
    });
    this.mount(target, select, () =>
      this.save(entityId, {
        type: 'set_technologies',
        entityId,
        technologyIds: Array.from(select.selectedOptions).map((option) => option.value),
      }),
    );
  }
  private mount(target: HTMLElement, editor: HTMLElement, save: () => void | Promise<void>): void {
    const box = document.createElement('span');
    box.className = 'editorial-structured-control';
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = 'Salvar';
    box.append(editor, button);
    target.insertAdjacentElement('afterend', box);
    button.onclick = async () => {
      await save();
      box.remove();
      target.focus();
    };
    editor.focus();
  }
  private saveField(target: HTMLElement, field: string, value: string): Promise<void> {
    if (field === 'href' && !/^(https:\/\/|mailto:|tel:)/.test(value)) {
      target.setAttribute('aria-invalid', 'true');
      return Promise.resolve();
    }
    return this.save(target.dataset['editorialEntity']!, {
      type: 'set_field',
      entityId: target.dataset['editorialEntity']!,
      field,
      value,
    });
  }
  private async save(
    target: string,
    command: Parameters<EditorialAutosaveQueue['enqueue']>[0]['command'],
  ): Promise<void> {
    await this.autosave.enqueue({ operationId: crypto.randomUUID(), target, command });
  }
}
