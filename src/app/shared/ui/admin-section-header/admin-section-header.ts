import { Component, input } from '@angular/core';

@Component({
  selector: 'app-admin-section-header',
  templateUrl: './admin-section-header.html',
  styleUrl: './admin-section-header.scss',
})
export class AdminSectionHeader {
  readonly title = input.required<string>();
  readonly description = input('');
}
