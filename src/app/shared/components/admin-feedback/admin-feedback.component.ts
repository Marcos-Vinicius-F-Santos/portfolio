import { Component, input } from '@angular/core';

export type AdminFeedbackVariant = 'status' | 'error' | 'success';

@Component({
  selector: 'app-admin-feedback',
  templateUrl: './admin-feedback.component.html',
  styleUrl: './admin-feedback.component.css',
})
export class AdminFeedbackComponent {
  readonly message = input.required<string>();
  readonly variant = input.required<AdminFeedbackVariant>();
  readonly testId = input('');
}

export { AdminFeedbackComponent as AdminFeedback };
