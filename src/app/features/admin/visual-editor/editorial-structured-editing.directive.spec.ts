import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { EditorialAutosaveQueue } from '../content-management/editorial-autosave-queue';
import { EditorialDraftContentService } from './editorial-draft-content.service';
import { EditorialStructuredEditingDirective } from './editorial-structured-editing.directive';

@Component({
  imports: [EditorialStructuredEditingDirective],
  template: `<main appEditorialStructuredEditing>
    <a
      href="https://example.com"
      data-editorial-control="url"
      data-editorial-entity="github"
      data-editorial-field="href"
      data-editorial-value="https://example.com"
      >GitHub</a
    >
    <div
      data-editorial-control="project-type"
      data-editorial-entity="project-1"
      data-editorial-value="personal"
    >
      Projeto
    </div>
    <div
      data-editorial-control="technologies"
      data-editorial-entity="project-1"
      data-editorial-value="java"
    >
      Tecnologias
    </div>
  </main>`,
})
class Host {}

describe('EditorialStructuredEditingDirective', () => {
  const enqueue = vi.fn();
  let fixture: ComponentFixture<Host>;
  beforeEach(() => {
    enqueue.mockReset();
    enqueue.mockResolvedValue({ operationId: 'x', revision: 2, repeated: false });
    TestBed.configureTestingModule({
      imports: [Host],
      providers: [
        { provide: EditorialAutosaveQueue, useValue: { enqueue } },
        {
          provide: EditorialDraftContentService,
          useValue: {
            draft: () => ({
              technologies: {
                java: { label: 'Java', aliases: [] },
                react: { label: 'React', aliases: [] },
              },
            }),
          },
        },
      ],
    });
    fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
  });
  const f2 = (element: HTMLElement) =>
    element.dispatchEvent(new KeyboardEvent('keydown', { key: 'F2', bubbles: true }));

  it('preserva a navegação normal do link e bloqueia URL executável', async () => {
    const link = fixture.nativeElement.querySelector('a') as HTMLAnchorElement;
    const click = new MouseEvent('click', { bubbles: true, cancelable: true });
    link.dispatchEvent(click);
    expect(click.defaultPrevented).toBe(false);
    f2(link);
    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    input.value = 'javascript:alert(1)';
    (
      fixture.nativeElement.querySelector(
        '.editorial-structured-control button',
      ) as HTMLButtonElement
    ).click();
    await Promise.resolve();
    expect(enqueue).not.toHaveBeenCalled();
    expect(link.getAttribute('aria-invalid')).toBe('true');
  });
  it('salva opção fechada para tipo do projeto', async () => {
    const target = fixture.nativeElement.querySelector(
      '[data-editorial-control="project-type"]',
    ) as HTMLElement;
    f2(target);
    const select = fixture.nativeElement.querySelector('select') as HTMLSelectElement;
    select.value = 'professional';
    (fixture.nativeElement.querySelector('button') as HTMLButtonElement).click();
    await Promise.resolve();
    expect(enqueue.mock.calls[0][0].command).toMatchObject({
      type: 'set_field',
      entityId: 'project-1',
      field: 'type',
      value: 'professional',
    });
  });
  it('associa tecnologias pelos IDs estáveis do catálogo', async () => {
    const target = fixture.nativeElement.querySelector(
      '[data-editorial-control="technologies"]',
    ) as HTMLElement;
    f2(target);
    const select = fixture.nativeElement.querySelector('select') as HTMLSelectElement;
    Array.from(select.options).forEach((option) => (option.selected = true));
    (fixture.nativeElement.querySelector('button') as HTMLButtonElement).click();
    await Promise.resolve();
    expect(enqueue.mock.calls[0][0].command).toEqual({
      type: 'set_technologies',
      entityId: 'project-1',
      technologyIds: ['java', 'react'],
    });
  });
});
