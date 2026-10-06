import { Component, input } from '@angular/core';

export type AdminFeedbackVariant = 'status' | 'error' | 'success';

@Component({
  selector: 'app-admin-feedback',
  templateUrl: './admin-feedback.html',
  styleUrl: './admin-feedback.scss',
})
export class AdminFeedback {
  readonly message = input.required<string>();
  readonly variant = input.required<AdminFeedbackVariant>();
  readonly testId = input('');
}
