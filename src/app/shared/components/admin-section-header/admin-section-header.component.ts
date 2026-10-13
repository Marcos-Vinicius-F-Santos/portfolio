import { Component, input } from '@angular/core';

@Component({
  selector: 'app-admin-section-header',
  templateUrl: './admin-section-header.component.html',
  styleUrl: './admin-section-header.component.css',
})
export class AdminSectionHeaderComponent {
  readonly title = input.required<string>();
  readonly description = input('');
}

export { AdminSectionHeaderComponent as AdminSectionHeader };
