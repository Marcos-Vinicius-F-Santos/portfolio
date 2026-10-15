import { Component, computed, input, signal } from '@angular/core';
import {
  createEmailUrl,
  createWhatsAppUrl,
  validateContactPanelValue,
} from './contact-channel-url';
import { sendContactEmail } from './contact-email-sender';
import {
  DEFAULT_CONTACT_PANEL_DESTINATIONS,
  type ContactPanelChannel,
  type ContactPanelCopy,
  type ContactPanelDestinations,
  type ContactPanelErrors,
  type ContactPanelSubmitStatus,
  type ContactPanelValue,
} from './contact-panel.models';

@Component({
  selector: 'app-contact-panel',
  templateUrl: './contact-panel.component.html',
  styleUrl: './contact-panel.component.css',
})
export class ContactPanelComponent {
  readonly copy = input.required<ContactPanelCopy>();
  readonly destinations = input<ContactPanelDestinations>(DEFAULT_CONTACT_PANEL_DESTINATIONS);
  readonly emailSender = input<typeof sendContactEmail>(sendContactEmail);

  readonly value = signal<ContactPanelValue>({ name: '', email: '', message: '' });
  readonly errors = signal<ContactPanelErrors>({});
  readonly submitStatus = signal<ContactPanelSubmitStatus>('idle');
  readonly isSubmitting = computed(() => this.submitStatus() === 'sending');

  protected setField(field: keyof ContactPanelValue, val: string): void {
    if (this.submitStatus() !== 'idle') {
      this.submitStatus.set('idle');
    }
    this.value.update((current) => ({ ...current, [field]: val }));
    this.errors.update((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
  }

  protected async openChannel(channel: ContactPanelChannel): Promise<void> {
    if (this.isSubmitting()) return;

    const val = this.value();
    const errors = validateContactPanelValue(val, this.copy());
    this.errors.set(errors);
    if (Object.keys(errors).length > 0) return;

    const destinations = this.destinations();

    if (channel === 'whatsapp') {
      const url = createWhatsAppUrl(destinations.whatsappNumber, val);
      window.open(url, '_blank', 'noopener,noreferrer');
      return;
    }

    // Direct Web3Forms submission if key is configured
    const accessKey = destinations.web3FormsAccessKey?.trim();
    if (accessKey) {
      this.submitStatus.set('sending');
      const sender = this.emailSender();
      const result = await sender({
        accessKey,
        name: val.name,
        email: val.email,
        message: val.message,
        subject: this.copy().contactEmailSubject,
      });

      if (result.success) {
        this.submitStatus.set('success');
        this.value.set({ name: '', email: '', message: '' });
        this.errors.set({});
      } else {
        this.submitStatus.set('error');
      }
      return;
    }

    // Fallback to native mailto if no Web3Forms key is set
    const mailtoUrl = createEmailUrl(destinations.email, this.copy().contactEmailSubject, val);
    window.open(mailtoUrl, '_blank', 'noopener,noreferrer');
  }
}

export { ContactPanelComponent as ContactPanel };
