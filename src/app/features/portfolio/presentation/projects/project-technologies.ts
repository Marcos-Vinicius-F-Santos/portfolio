import { Component, input, signal } from '@angular/core';
import { technologyIcon } from '../../content/technology-icons';
@Component({
  selector: 'app-project-technologies',
  template: `<ul>
    @for (technology of technologies(); track $index) {
      <li>
        @if (icon(technology); as url) {
          @if (!failed().includes(url)) {
            <img [src]="url" alt="" loading="lazy" (error)="hide(url)" />
          } @else {
            <span class="symbol" aria-hidden="true">&lt;/&gt;</span>
          }
        } @else {
          <span class="symbol" aria-hidden="true">&lt;/&gt;</span>
        }
        <span>{{ technology }}</span>
      </li>
    }
  </ul>`,
  styles: [
    `
      ul {
        display: flex;
        flex-wrap: wrap;
        gap: 1rem;
        padding: 0;
        margin: 0;
        list-style: none;
      }
      li {
        display: flex;
        align-items: center;
        gap: 0.6rem;
        font-size: 0.95rem;
      }
      img,
      .symbol {
        width: 2rem;
        height: 2rem;
        object-fit: contain;
      }
      .symbol {
        display: grid;
        place-items: center;
        font-family: monospace;
        font-weight: bold;
      }
    `,
  ],
})
export class ProjectTechnologies {
  readonly technologies = input.required<string[]>();
  protected readonly failed = signal<string[]>([]);
  protected hide(url: string): void {
    this.failed.update((items) => [...items, url]);
  }
  protected icon(name: string): string | undefined {
    return technologyIcon(name);
  }
}
