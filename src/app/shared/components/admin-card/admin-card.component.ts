import { Component, input } from '@angular/core';

export type AdminCardVariant = 'default' | 'image' | 'dashed';

@Component({
  selector: 'app-admin-card',
  templateUrl: './admin-card.component.html',
  styleUrl: './admin-card.component.css',
})
export class AdminCardComponent {
  readonly variant = input<AdminCardVariant>('default');
}

export { AdminCardComponent as AdminCard };
