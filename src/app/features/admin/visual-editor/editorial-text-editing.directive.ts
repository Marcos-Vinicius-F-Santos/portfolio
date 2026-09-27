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

type EditorialTarget = HTMLElement & {
  dataset: DOMStringMap & {
    editorialEntity?: string;
    editorialField?: string;
    editorialLocale?: string;
  };
};

@Directive({
  selector: '[appEditorialTextEditing]',
})
export class EditorialTextEditingDirective implements AfterViewInit, OnDestroy {
  readonly enabled = input(true, {
    alias: 'appEditorialTextEditing',
    transform: booleanAttribute,
  });
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly autosave = inject(EditorialAutosaveQueue);
  private readonly content = inject(EditorialDraftContentService);
  private activeInput: HTMLTextAreaElement | null = null;
  private activeTarget: EditorialTarget | null = null;
  private activeTabs: HTMLElement | null = null;
  private activeLocale = '';
  private readonly sessionValues = new Map<string, string>();
  private cancelled = false;
  private observer: MutationObserver | null = null;
  private readonly modeEffect = effect(() => {
    if (this.enabled()) this.prepareTargets();
    else this.clearTargets();
  });
  private readonly failureEffect = effect(() => {
    if (this.autosave.failure()) return;
    this.host
      .querySelectorAll<EditorialTarget>('.editorial-text-target--error')
      .forEach((target) => {
        target.classList.remove('editorial-text-target--error');
        target.removeAttribute('aria-invalid');
        target.removeAttribute('title');
      });
  });

  ngAfterViewInit(): void {
    this.prepareTargets();
    const Observer = this.host.ownerDocument.defaultView?.MutationObserver;
    if (Observer) {
      this.observer = new Observer(() => this.prepareTargets());
      this.observer.observe(this.host, { childList: true, subtree: true });
    }
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
    this.activeInput?.remove();
    this.activeTabs?.remove();
    this.modeEffect.destroy();
    this.failureEffect.destroy();
  }

  @HostListener('click', ['$event'])
  protected handleClick(event: MouseEvent): void {
    if (!this.enabled()) return;
    const target = this.editorialTarget(event.target);
    if (!target || this.belongsToInteractiveControl(target)) return;
    event.preventDefault();
    this.activate(target);
  }

  @HostListener('keydown', ['$event'])
  protected handleKeydown(event: KeyboardEvent): void {
    if (!this.enabled()) return;
    if (event.key !== 'Enter' && event.key !== 'F2') return;
    const target = this.editorialTarget(event.target);
    if (!target || this.belongsToInteractiveControl(target)) return;
    event.preventDefault();
    this.activate(target);
  }

  private prepareTargets(): void {
    this.host
      .querySelectorAll<EditorialTarget>(
        '[data-editorial-entity][data-editorial-field][data-editorial-locale]',
      )
      .forEach((target) => {
        if (this.belongsToInteractiveControl(target)) return;
        target.tabIndex = 0;
        target.setAttribute('role', 'button');
        target.setAttribute('aria-label', this.editLabel(target));
        target.classList.add('editorial-text-target');
      });
  }

  private clearTargets(): void {
    if (this.activeInput && this.activeTarget) {
      this.cancelled = true;
      this.removeInput(this.activeInput, this.activeTarget);
    }
    this.host
      .querySelectorAll<EditorialTarget>(
        '[data-editorial-entity][data-editorial-field][data-editorial-locale]',
      )
      .forEach((target) => {
        target.removeAttribute('tabindex');
        target.removeAttribute('role');
        target.removeAttribute('aria-label');
        target.classList.remove('editorial-text-target');
      });
  }

  private activate(target: EditorialTarget): void {
    if (this.activeTarget === target) return;
    this.commitActiveInput();

    const input = this.host.ownerDocument.createElement('textarea');
    input.className = 'editorial-inline-input';
    this.activeLocale = target.dataset.editorialLocale ?? 'pt-BR';
    input.value = this.valueFor(target, this.activeLocale);
    input.rows = Math.max(1, Math.min(8, input.value.split('\n').length));
    input.setAttribute('aria-label', this.editLabel(target));
    input.setAttribute('data-editorial-inline-input', '');

    target.classList.add('editorial-text-target--editing');
    target.setAttribute('aria-hidden', 'true');
    target.insertAdjacentElement('afterend', input);
    const tabs = this.createLanguageTabs(target, input);
    input.insertAdjacentElement('beforebegin', tabs);
    this.activeTarget = target;
    this.activeInput = input;
    this.activeTabs = tabs;
    this.cancelled = false;

    input.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        this.cancelled = true;
        input.blur();
      }
    });
    input.addEventListener('blur', () => this.finishEditing());
    input.focus();
    input.select();
  }

  private commitActiveInput(): void {
    this.activeInput?.blur();
  }

  private finishEditing(): void {
    const input = this.activeInput;
    const target = this.activeTarget;
    if (!input || !target) return;

    const nextValue = input.value;
    const locale = this.activeLocale;
    const previousValue = this.valueFor(target, locale);
    this.removeInput(input, target);

    if (this.cancelled) {
      target.focus();
      return;
    }
    if (nextValue === previousValue) return;

    if (locale === target.dataset.editorialLocale) target.textContent = nextValue;
    target.classList.remove('editorial-text-target--error');
    target.removeAttribute('aria-invalid');
    const entityId = target.dataset.editorialEntity;
    const field = target.dataset.editorialField ?? 'text';
    if (!entityId || !locale) return;
    this.sessionValues.set(`${entityId}.${locale}.${field}`, nextValue);

    void this.autosave
      .enqueue({
        operationId: crypto.randomUUID(),
        target: `${entityId}.${locale}.${field}`,
        command: { type: 'set_translation', entityId, locale, field, value: nextValue },
      })
      .then(() => {
        target.classList.remove('editorial-text-target--error');
        target.removeAttribute('aria-invalid');
        target.removeAttribute('title');
      })
      .catch(() => {
        target.classList.add('editorial-text-target--error');
        target.setAttribute('aria-invalid', 'true');
        target.setAttribute('title', `Falha ao salvar ${this.editLabel(target).toLowerCase()}`);
      });
  }

  private removeInput(input: HTMLTextAreaElement, target: EditorialTarget): void {
    input.remove();
    this.activeTabs?.remove();
    target.classList.remove('editorial-text-target--editing');
    target.removeAttribute('aria-hidden');
    this.activeInput = null;
    this.activeTarget = null;
    this.activeTabs = null;
    this.activeLocale = '';
  }

  private createLanguageTabs(target: EditorialTarget, input: HTMLTextAreaElement): HTMLElement {
    const tabs = this.host.ownerDocument.createElement('span');
    tabs.className = 'editorial-language-tabs';
    tabs.setAttribute('role', 'tablist');
    for (const locale of this.content.draft()?.locales ?? []) {
      const button = this.host.ownerDocument.createElement('button');
      button.type = 'button';
      button.setAttribute('role', 'tab');
      button.textContent = locale.label;
      button.dataset['locale'] = locale.code;
      const missing = this.valueFor(target, locale.code).trim().length === 0;
      if (missing) button.classList.add('editorial-language-tab--missing');
      button.setAttribute('aria-selected', String(locale.code === this.activeLocale));
      button.addEventListener('mousedown', (event) => event.preventDefault());
      button.addEventListener('click', () => {
        this.persistActiveValue(target, input.value);
        this.activeLocale = locale.code;
        input.value = this.valueFor(target, locale.code);
        input.setAttribute('aria-label', this.editLabel(target, locale.code));
        tabs
          .querySelectorAll('[role="tab"]')
          .forEach((tab) =>
            tab.setAttribute(
              'aria-selected',
              String((tab as HTMLElement).dataset['locale'] === locale.code),
            ),
          );
        input.focus();
      });
      tabs.append(button);
    }
    return tabs;
  }

  private persistActiveValue(target: EditorialTarget, value: string): void {
    const entityId = target.dataset.editorialEntity;
    const field = target.dataset.editorialField ?? 'text';
    if (!entityId || !this.activeLocale) return;
    const key = `${entityId}.${this.activeLocale}.${field}`;
    if (value === this.valueFor(target, this.activeLocale)) return;
    this.sessionValues.set(key, value);
    void this.autosave
      .enqueue({
        operationId: crypto.randomUUID(),
        target: key,
        command: { type: 'set_translation', entityId, locale: this.activeLocale, field, value },
      })
      .catch(() => undefined);
  }

  private valueFor(target: EditorialTarget, locale: string): string {
    const entityId = target.dataset.editorialEntity ?? '';
    const field = target.dataset.editorialField ?? 'text';
    const key = `${entityId}.${locale}.${field}`;
    return (
      this.sessionValues.get(key) ??
      this.content.draft()?.translations[locale]?.[entityId]?.[field] ??
      (locale === target.dataset.editorialLocale ? (target.textContent?.trim() ?? '') : '')
    );
  }

  private editorialTarget(origin: EventTarget | null): EditorialTarget | null {
    if (!origin || typeof (origin as Element).closest !== 'function') return null;
    const target = (origin as Element).closest<EditorialTarget>(
      '[data-editorial-entity][data-editorial-field][data-editorial-locale]',
    );
    return target && this.host.contains(target) ? target : null;
  }

  private belongsToInteractiveControl(target: EditorialTarget): boolean {
    return Boolean(target.closest('a, button, select, input, textarea'));
  }

  private editLabel(target: EditorialTarget, selectedLocale?: string): string {
    const field = target.dataset.editorialField ?? 'text';
    const locale = selectedLocale ?? target.dataset.editorialLocale ?? 'idioma atual';
    return `Editar ${field} em ${locale}`;
  }
}
