import { Component, input, signal } from '@angular/core';
import {
  createEmailUrl,
  createWhatsAppUrl,
  validateContactPanelValue,
} from './contact-channel-url';
import {
  DEFAULT_CONTACT_PANEL_DESTINATIONS,
  type ContactPanelChannel,
  type ContactPanelCopy,
  type ContactPanelDestinations,
  type ContactPanelErrors,
  type ContactPanelValue,
} from './contact-panel.models';

@Component({
  selector: 'app-contact-panel',
  templateUrl: './contact-panel.html',
  styleUrl: './contact-panel.scss',
})
export class ContactPanel {
  readonly copy = input.required<ContactPanelCopy>();
  readonly destinations = input<ContactPanelDestinations>(DEFAULT_CONTACT_PANEL_DESTINATIONS);
  readonly value = signal<ContactPanelValue>({ name: '', email: '', message: '' });
  readonly errors = signal<ContactPanelErrors>({});

  protected setField(field: keyof ContactPanelValue, value: string): void {
    this.value.update((current) => ({ ...current, [field]: value }));
    this.errors.update((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
  }

  protected openChannel(channel: ContactPanelChannel): void {
    const value = this.value();
    const errors = validateContactPanelValue(value, this.copy());
    this.errors.set(errors);
    if (Object.keys(errors).length > 0) return;

    const destinations = this.destinations();
    const url =
      channel === 'whatsapp'
        ? createWhatsAppUrl(destinations.whatsappNumber, value)
        : createEmailUrl(destinations.email, this.copy().contactEmailSubject, value);

    window.open(url, '_blank', 'noopener,noreferrer');
  }
}
