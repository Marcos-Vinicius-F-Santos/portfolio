import type { PortfolioCopy } from '../../content/portfolio-content';

export type ContactPanelCopy = Pick<
  PortfolioCopy,
  | 'contactPanelTitle'
  | 'contactPanelBody'
  | 'contactNameLabel'
  | 'contactNamePlaceholder'
  | 'contactEmailFieldLabel'
  | 'contactEmailPlaceholder'
  | 'contactMessageLabel'
  | 'contactMessagePlaceholder'
  | 'contactWhatsAppActionLabel'
  | 'contactEmailActionLabel'
  | 'contactEmailSubject'
  | 'contactNameRequiredMessage'
  | 'contactEmailRequiredMessage'
  | 'contactEmailInvalidMessage'
  | 'contactMessageRequiredMessage'
>;

export type ContactPanelValue = {
  name: string;
  email: string;
  message: string;
};

export type ContactPanelChannel = 'whatsapp' | 'email';

export type ContactPanelErrors = Partial<Record<keyof ContactPanelValue, string>>;

export type ContactPanelDestinations = {
  whatsappNumber: string;
  email: string;
};

export const DEFAULT_CONTACT_PANEL_DESTINATIONS: ContactPanelDestinations = {
  whatsappNumber: '5537998292763',
  email: 'marcossantosjdev@gmail.com',
};
