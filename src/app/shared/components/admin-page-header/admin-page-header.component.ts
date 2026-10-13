import { Component, input } from '@angular/core';

@Component({
  selector: 'app-admin-page-header',
  templateUrl: './admin-page-header.component.html',
  styleUrl: './admin-page-header.component.css',
})
export class AdminPageHeaderComponent {
  readonly eyebrow = input('Área administrativa');
  readonly title = input.required<string>();
  readonly description = input.required<string>();
}

export { AdminPageHeaderComponent as AdminPageHeader };
