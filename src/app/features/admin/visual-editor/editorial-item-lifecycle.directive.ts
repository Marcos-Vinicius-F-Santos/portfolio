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
import type { EditorialDraftCommand } from '../content-management/editorial-draft.models';
import { EditorialSessionHistory } from '../content-management/editorial-session-history';
import type { EditorialEntityKind } from '../../portfolio/content/editorial-snapshot.models';
import { EditorialDraftContentService } from './editorial-draft-content.service';

type AddCommand = Extract<EditorialDraftCommand, { type: 'add_entity' }>;

@Directive({ selector: '[appEditorialItemLifecycle]' })
export class EditorialItemLifecycleDirective implements AfterViewInit, OnDestroy {
  readonly enabled = input(true, {
    alias: 'appEditorialItemLifecycle',
    transform: booleanAttribute,
  });
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly autosave = inject(EditorialAutosaveQueue);
  private readonly history = inject(EditorialSessionHistory);
  private readonly content = inject(EditorialDraftContentService);
  private observer: MutationObserver | null = null;
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
      this.host
      .querySelectorAll<HTMLElement>('[data-editorial-collection-kind]')
      .forEach((collection) => {
        const kind = collection.dataset['editorialCollectionKind'] as EditorialEntityKind;
        if (kind === 'skill') {
          if (!collection.querySelector(':scope > .editorial-skill-picker'))
            collection.append(this.skillPicker(collection));
        } else if (!collection.querySelector(':scope > .editorial-add-item')) {
          const add = this.button('Adicionar item', 'editorial-add-item', () => this.add(collection));
          collection.append(add);
        }
      });
    this.host.querySelectorAll<HTMLElement>('[data-editorial-item-id]').forEach((item) => {
      if (item.querySelector(':scope > .editorial-remove-item')) return;
      const remove = this.button('Remover item', 'editorial-remove-item', () => this.remove(item));
      item.prepend(remove);
    });
  }

  private button(label: string, className: string, action: () => void): HTMLButtonElement {
    const button = this.host.ownerDocument.createElement('button');
    button.type = 'button';
    button.className = className;
    button.textContent = label;
    button.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      action();
    });
    return button;
  }

  private add(collection: HTMLElement): void {
    const kind = collection.dataset['editorialCollectionKind'] as EditorialEntityKind;
    const parentId = collection.dataset['editorialParentId'] || undefined;
    const command = this.newEntity(kind, parentId, collection);
    this.persistAdd(command);
  }

  private addSkill(collection: HTMLElement, technologyId: string): void {
    if (!technologyId) return;
    const parentId = collection.dataset['editorialParentId'] || undefined;
    const alreadySelected = Object.values(this.content.draft?.()?.entities ?? {}).some(
      (entity) =>
        entity.kind === 'skill' &&
        entity.parentId === parentId &&
        entity.data['technologyId'] === technologyId,
    );
    if (alreadySelected) return;
    const command = this.newEntity('skill', parentId, collection, technologyId);
    this.persistAdd(command);
  }

  private persistAdd(command: AddCommand): void {
    this.content.addEntity(command);
    const inverse = { type: 'remove_entity', entityId: command.entityId } as const;
    this.history.record({ target: `${command.entityId}.create`, forward: command, inverse });
    void this.autosave
      .enqueue({
        operationId: crypto.randomUUID(),
        target: `${command.entityId}.create`,
        command,
      })
      .catch(() => undefined);
  }

  private skillPicker(collection: HTMLElement): HTMLElement {
    const wrapper = this.host.ownerDocument.createElement('div');
    wrapper.className = 'editorial-skill-picker';
    const select = this.host.ownerDocument.createElement('select');
    select.setAttribute('aria-label', 'Selecionar habilidade do catálogo');
    const technologies = Object.entries(this.content.draft?.()?.technologies ?? {}).sort((a, b) =>
      a[1].label.localeCompare(b[1].label),
    );
    for (const [id, technology] of technologies) {
      const option = this.host.ownerDocument.createElement('option');
      option.value = id;
      option.textContent = technology.label;
      select.append(option);
    }
    const add = this.button('Adicionar habilidade', 'editorial-add-skill', () =>
      this.addSkill(collection, select.value),
    );
    if (!technologies.length) {
      add.disabled = true;
      const hint = this.host.ownerDocument.createElement('a');
      hint.href = '/admin/media';
      hint.textContent = 'Criar habilidade no Gerenciador de mídias';
      wrapper.append(hint);
    }
    wrapper.append(select, add);
    return wrapper;
  }

  private remove(item: HTMLElement): void {
    const entityId = item.dataset['editorialItemId'];
    if (!entityId) return;
    const dependentCount = this.content.dependencyCount(entityId);
    const detail = dependentCount ? ` e ${dependentCount} item(ns) dependente(s)` : '';
    if (!confirm(`Remover este item${detail} do rascunho?`)) return;
    const { restore } = this.content.removeEntity(entityId);
    const forward = { type: 'remove_entity', entityId } as const;
    this.history.record({ target: `${entityId}.remove`, forward, inverse: restore });
    void this.autosave
      .enqueue({
        operationId: crypto.randomUUID(),
        target: `${entityId}.remove`,
        command: forward,
      })
      .catch(() => undefined);
  }

  private newEntity(
    kind: EditorialEntityKind,
    parentId: string | undefined,
    collection: HTMLElement,
    technologyId?: string,
  ): AddCommand {
    const data: Record<string, string | boolean | null> = {};
    if (kind === 'experience') Object.assign(data, { startDate: '', endDate: null });
    if (kind === 'project') data['type'] = collection.dataset['editorialNewType'] ?? 'personal';
    if (kind === 'academic')
      Object.assign(data, { startDate: null, endDate: null, isCurrent: false });
    if (kind === 'skill' && technologyId) {
      data['technologyId'] = technologyId;
      const iconMediaId = this.content.draft?.()?.technologies[technologyId]?.iconMediaId;
      if (iconMediaId) data['iconMediaId'] = iconMediaId;
    }
    if (kind === 'contact') Object.assign(data, { symbol: 'github', href: '' });
    if (kind === 'listItem') data['collection'] = collection.dataset['editorialListName'] ?? '';
    const selectedTechnology = technologyId
      ? this.content.draft?.()?.technologies[technologyId]
      : undefined;
    const translations = selectedTechnology
      ? Object.fromEntries(
          (this.content.draft?.()?.locales ?? []).map((locale) => [
            locale.code,
            { name: selectedTechnology.label },
          ]),
        )
      : {};
    return {
      type: 'add_entity',
      entityId: crypto.randomUUID(),
      kind,
      parentId,
      position: this.content.nextPosition(kind, parentId),
      data,
      translations,
    };
  }

  private clear(): void {
    this.host
      .querySelectorAll('.editorial-add-item,.editorial-add-skill,.editorial-skill-picker,.editorial-remove-item')
      .forEach((control) => control.remove());
  }
}
