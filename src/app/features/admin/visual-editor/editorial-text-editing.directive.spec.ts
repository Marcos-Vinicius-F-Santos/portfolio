import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { EditorialAutosaveQueue } from '../content-management/editorial-autosave-queue';
import { EditorialTextEditingDirective } from './editorial-text-editing.directive';
import { EditorialDraftContentService } from './editorial-draft-content.service';

@Component({
  imports: [EditorialTextEditingDirective],
  template: `
    <main appEditorialTextEditing>
      <p
        data-editorial-entity="project-1"
        data-editorial-field="description"
        data-editorial-locale="pt-BR"
      >
        Resumo
      </p>
      <p
        data-editorial-entity="project-1"
        data-editorial-field="description"
        data-editorial-locale="pt-BR"
      >
        Detalhe
      </p>
      <a href="#destino"
        ><span
          data-editorial-entity="contact-1"
          data-editorial-field="label"
          data-editorial-locale="pt-BR"
          >Abrir contato</span
        ></a
      >
    </main>
  `,
})
class HostComponent {}

describe('EditorialTextEditingDirective', () => {
  const enqueue = vi.fn();
  let fixture: ComponentFixture<HostComponent>;

  beforeEach(() => {
    enqueue.mockReset();
    enqueue.mockResolvedValue({ operationId: 'operation', revision: 2, repeated: false });
    TestBed.configureTestingModule({
      imports: [HostComponent],
      providers: [
        { provide: EditorialAutosaveQueue, useValue: { enqueue, failure: () => null } },
        {
          provide: EditorialDraftContentService,
          useValue: {
            draft: () => ({
              locales: [
                { code: 'pt-BR', label: 'Português' },
                { code: 'en', label: 'English' },
              ],
              translations: {
                'pt-BR': { 'project-1': { description: 'Resumo' } },
                en: { 'project-1': { description: 'Summary' } },
              },
            }),
          },
        },
      ],
    });
    fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
  });

  it('ativa por teclado e cancela com Escape sem salvar', () => {
    const target = fixture.nativeElement.querySelector('p') as HTMLElement;
    expect(target.tabIndex).toBe(0);
    expect(target.getAttribute('role')).toBe('button');

    target.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    const input = fixture.nativeElement.querySelector('textarea') as HTMLTextAreaElement;
    input.value = 'Não salvar';
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));

    expect(fixture.nativeElement.querySelector('textarea')).toBeNull();
    expect(target.textContent?.trim()).toBe('Resumo');
    expect(enqueue).not.toHaveBeenCalled();
    expect(document.activeElement).toBe(target);
  });

  it('salva ao sair por Tab e usa a mesma entidade nas superfícies compartilhadas', async () => {
    const targets = fixture.nativeElement.querySelectorAll('p') as NodeListOf<HTMLElement>;

    for (const [index, target] of Array.from(targets).entries()) {
      target.click();
      const input = fixture.nativeElement.querySelector('textarea') as HTMLTextAreaElement;
      input.value = index === 0 ? 'Novo resumo' : 'Novo detalhe';
      input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }));
      input.blur();
      await Promise.resolve();
    }

    expect(enqueue).toHaveBeenCalledTimes(2);
    expect(enqueue.mock.calls.map(([change]) => change.command.entityId)).toEqual([
      'project-1',
      'project-1',
    ]);
    expect(enqueue.mock.calls[0][0].command).toMatchObject({
      type: 'set_translation',
      locale: 'pt-BR',
      field: 'description',
      value: 'Novo resumo',
    });
  });

  it('salva o campo anterior ao clicar fora em outro campo', () => {
    const targets = fixture.nativeElement.querySelectorAll('p') as NodeListOf<HTMLElement>;
    targets[0].click();
    const input = fixture.nativeElement.querySelector('textarea') as HTMLTextAreaElement;
    input.value = 'Alterado';

    targets[1].click();

    expect(enqueue).toHaveBeenCalledTimes(1);
    expect(targets[0].textContent).toBe('Alterado');
    expect(fixture.nativeElement.querySelector('textarea')?.value).toBe('Alterado');
  });

  it('mantém traduções independentes ao alternar as abas', async () => {
    const target = fixture.nativeElement.querySelector('p') as HTMLElement;
    target.click();
    const input = fixture.nativeElement.querySelector('textarea') as HTMLTextAreaElement;
    input.value = 'Resumo pendente';
    const english = Array.from(
      fixture.nativeElement.querySelectorAll('[role="tab"]') as NodeListOf<HTMLButtonElement>,
    ).find((tab) => tab.dataset['locale'] === 'en')!;
    english.click();
    expect(input.value).toBe('Summary');
    input.value = 'New summary';
    input.blur();
    await Promise.resolve();
    expect(enqueue.mock.calls.map(([change]) => change.command.locale)).toEqual(['pt-BR', 'en']);
    expect(enqueue.mock.calls.map(([change]) => change.command.value)).toEqual([
      'Resumo pendente',
      'New summary',
    ]);
  });

  it('mantém links navegáveis fora da ação de editar', () => {
    const link = fixture.nativeElement.querySelector('a') as HTMLAnchorElement;
    const click = new MouseEvent('click', { bubbles: true, cancelable: true });
    link.querySelector('span')?.dispatchEvent(click);

    expect(click.defaultPrevented).toBe(false);
    expect(fixture.nativeElement.querySelector('textarea')).toBeNull();
  });

  it('preserva o valor local e identifica o campo quando o autosave falha', async () => {
    enqueue.mockRejectedValueOnce({ status: 0 });
    const target = fixture.nativeElement.querySelector('p') as HTMLElement;
    target.click();
    const input = fixture.nativeElement.querySelector('textarea') as HTMLTextAreaElement;
    input.value = 'Valor local';
    input.blur();
    await Promise.resolve();
    await Promise.resolve();

    expect(target.textContent).toBe('Valor local');
    expect(target.getAttribute('aria-invalid')).toBe('true');
    expect(target.title).toContain('description');
  });
});
