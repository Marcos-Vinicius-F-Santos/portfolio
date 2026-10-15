import type { PortfolioCopy } from '../../../features/portfolio/services/portfolio-content';

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
  | 'contactSendingLabel'
  | 'contactSuccessTitle'
  | 'contactSuccessBody'
  | 'contactErrorMessage'
>;

export type ContactPanelValue = {
  name: string;
  email: string;
  message: string;
};

export type ContactPanelChannel = 'whatsapp' | 'email';

export type ContactPanelSubmitStatus = 'idle' | 'sending' | 'success' | 'error';

export type ContactPanelErrors = Partial<Record<keyof ContactPanelValue, string>>;

export type ContactPanelDestinations = {
  whatsappNumber: string;
  email: string;
  web3FormsAccessKey?: string;
};

export const DEFAULT_CONTACT_PANEL_DESTINATIONS: ContactPanelDestinations = {
  whatsappNumber: '',
  email: '',
  web3FormsAccessKey: '',
};
