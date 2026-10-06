import { Component, input } from '@angular/core';

@Component({
  selector: 'app-admin-page-header',
  templateUrl: './admin-page-header.html',
  styleUrl: './admin-page-header.scss',
})
export class AdminPageHeader {
  readonly eyebrow = input('Área administrativa');
  readonly title = input.required<string>();
  readonly description = input.required<string>();
}
