import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { EditorialAutosaveQueue } from '../content-management/editorial-autosave-queue';
import { EditorialDraftContentService } from './editorial-draft-content.service';
import { EditorialSectionOrderingDirective } from './editorial-section-ordering.directive';

@Component({
  imports: [EditorialSectionOrderingDirective],
  template: `<main appEditorialSectionOrdering>
    <header data-editorial-section-id="presentation-section">Apresentação</header>
    <section data-editorial-section-id="about-section">Sobre</section>
    <section data-editorial-section-id="skills-section">Skills</section>
  </main>`,
})
class Host {}
describe('EditorialSectionOrderingDirective', () => {
  const enqueue = vi.fn();
  const order = signal(['presentation-section', 'about-section', 'skills-section']);
  let fixture: ComponentFixture<Host>;
  beforeEach(() => {
    enqueue.mockReset().mockResolvedValue({ revision: 2 });
    order.set(['presentation-section', 'about-section', 'skills-section']);
    TestBed.configureTestingModule({
      imports: [Host],
      providers: [
        { provide: EditorialAutosaveQueue, useValue: { enqueue } },
        {
          provide: EditorialDraftContentService,
          useValue: {
            editorialSectionOrder: order,
            reorderSections: (ids: string[]) => order.set(ids),
          },
        },
      ],
    });
    fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
  });
  it('mantém apresentação fixa e move por controles acessíveis', () => {
    expect(fixture.nativeElement.querySelector('header button')).toBeNull();
    const about = fixture.nativeElement.querySelector(
      '[data-editorial-section-id="about-section"]',
    ) as HTMLElement;
    const down = Array.from(about.querySelectorAll('button')).find(
      (button) => button.textContent === 'Mover abaixo',
    ) as HTMLButtonElement;
    down.click();
    expect(order()).toEqual(['presentation-section', 'skills-section', 'about-section']);
    expect(enqueue.mock.calls[0][0].command).toEqual({
      type: 'set_section_order',
      sectionIds: ['presentation-section', 'skills-section', 'about-section'],
    });
  });
  it('oferece a mesma mudança por arraste', () => {
    const about = fixture.nativeElement.querySelector(
      '[data-editorial-section-id="about-section"]',
    ) as HTMLElement;
    const skills = fixture.nativeElement.querySelector(
      '[data-editorial-section-id="skills-section"]',
    ) as HTMLElement;
    skills.dispatchEvent(new Event('dragstart', { bubbles: true }));
    about.dispatchEvent(new Event('drop', { bubbles: true, cancelable: true }));
    expect(order()).toEqual(['presentation-section', 'skills-section', 'about-section']);
  });
});
