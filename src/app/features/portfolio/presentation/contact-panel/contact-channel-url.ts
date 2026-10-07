import type {
  ContactPanelCopy,
  ContactPanelErrors,
  ContactPanelValue,
} from './contact-panel.models';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateContactPanelValue(
  value: ContactPanelValue,
  copy: ContactPanelCopy,
): ContactPanelErrors {
  const errors: ContactPanelErrors = {};

  if (!value.name.trim()) {
    errors.name = copy.contactNameRequiredMessage;
  }

  if (!value.email.trim()) {
    errors.email = copy.contactEmailRequiredMessage;
  } else if (!EMAIL_PATTERN.test(value.email.trim())) {
    errors.email = copy.contactEmailInvalidMessage;
  }

  if (!value.message.trim()) {
    errors.message = copy.contactMessageRequiredMessage;
  }

  return errors;
}

export function formatContactMessage(value: ContactPanelValue): string {
  return [
    `Nome: ${value.name.trim()}`,
    `E-mail: ${value.email.trim()}`,
    '',
    value.message.trim(),
  ].join('\n');
}

export function createWhatsAppUrl(
  whatsappNumber: string,
  value: ContactPanelValue,
): string {
  const normalizedNumber = whatsappNumber.replace(/\D/g, '');
  return `https://wa.me/${normalizedNumber}?text=${encodeURIComponent(formatContactMessage(value))}`;
}

export function createEmailUrl(
  email: string,
  subject: string,
  value: ContactPanelValue,
): string {
  const params = new URLSearchParams({
    subject: subject.trim(),
    body: formatContactMessage(value),
  });
  return `mailto:${email.trim()}?${params.toString()}`;
}
