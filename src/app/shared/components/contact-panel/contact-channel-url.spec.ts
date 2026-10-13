import { describe, expect, it } from 'vitest';
import {
  createEmailUrl,
  createWhatsAppUrl,
  formatContactMessage,
  validateContactPanelValue,
} from './contact-channel-url';
import type { ContactPanelCopy, ContactPanelValue } from './contact-panel.models';

const copy: ContactPanelCopy = {
  contactPanelTitle: 'Fale comigo',
  contactPanelBody: 'Envie uma mensagem.',
  contactNameLabel: 'Nome',
  contactNamePlaceholder: 'Seu nome',
  contactEmailFieldLabel: 'E-mail',
  contactEmailPlaceholder: 'seu@email.com',
  contactMessageLabel: 'Mensagem',
  contactMessagePlaceholder: 'Escreva sua mensagem...',
  contactWhatsAppActionLabel: 'Enviar pelo WhatsApp',
  contactEmailActionLabel: 'Enviar por e-mail',
  contactEmailSubject: 'Contato pelo portfólio',
  contactNameRequiredMessage: 'Informe seu nome.',
  contactEmailRequiredMessage: 'Informe seu e-mail.',
  contactEmailInvalidMessage: 'Informe um e-mail válido.',
  contactMessageRequiredMessage: 'Escreva uma mensagem.',
};

const value: ContactPanelValue = {
  name: '  Visitante Teste  ',
  email: ' visitante@example.com ',
  message: 'Olá!\nQuero falar sobre automação & dados.',
};

describe('contact channel URL builders', () => {
  it('rejects blank fields and malformed email with localized errors', () => {
    expect(
      validateContactPanelValue({ name: '  ', email: 'invalid', message: '' }, copy),
    ).toEqual({
      name: 'Informe seu nome.',
      email: 'Informe um e-mail válido.',
      message: 'Escreva uma mensagem.',
    });
  });

  it('formats the visitor values without a fixed default message', () => {
    expect(formatContactMessage(value)).toBe(
      'Nome: Visitante Teste\nE-mail: visitante@example.com\n\nOlá!\nQuero falar sobre automação & dados.',
    );
  });

  it('encodes Unicode, line breaks, and reserved characters in WhatsApp', () => {
    const url = createWhatsAppUrl('+55 (11) 99999-9999', value);
    expect(url.startsWith('https://wa.me/5511999999999?text=')).toBe(true);
    expect(decodeURIComponent(url.split('text=')[1] ?? '')).toBe(formatContactMessage(value));
    expect(url).not.toContain(' & ');
  });

  it('keeps mailto subject and body as separate encoded parameters', () => {
    const url = createEmailUrl(' destinatario@example.com ', '  Oportunidade & conversa  ', value);
    const params = new URLSearchParams(url.split('?')[1]);
    expect(url.startsWith('mailto:destinatario@example.com?')).toBe(true);
    expect(params.get('subject')).toBe('Oportunidade & conversa');
    expect(params.get('body')).toBe(formatContactMessage(value));
  });
});
