import { Component, input } from '@angular/core';

export type AdminCardVariant = 'default' | 'image' | 'dashed';

@Component({
  selector: 'app-admin-card',
  templateUrl: './admin-card.html',
  styleUrl: './admin-card.scss',
})
export class AdminCard {
  readonly variant = input<AdminCardVariant>('default');
}
