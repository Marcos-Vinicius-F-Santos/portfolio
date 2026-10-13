import { TestBed } from '@angular/core/testing';
import { describe, expect, it, vi } from 'vitest';
import { ContactPanelComponent } from './contact-panel.component';
import type { ContactPanelCopy, ContactPanelDestinations } from './contact-panel.models';

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

const testDestinations: ContactPanelDestinations = {
  whatsappNumber: '5511999999999',
  email: 'destinatario@exemplo.com',
};

function fill(fixture: any, selector: string, value: string): void {
  const element = fixture.nativeElement.querySelector(selector) as HTMLInputElement | HTMLTextAreaElement;
  element.value = value;
  element.dispatchEvent(new Event('input'));
  fixture.detectChanges();
}

describe('ContactPanelComponent', () => {
  it('renders its localized contract and empty initial state', async () => {
    await TestBed.configureTestingModule({ imports: [ContactPanelComponent] }).compileComponents();
    const fixture = TestBed.createComponent(ContactPanelComponent);
    fixture.componentRef.setInput('copy', copy);
    fixture.componentRef.setInput('destinations', testDestinations);
    await fixture.whenStable();
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelector('[data-testid="contact-panel"]')).toBeTruthy();
    expect(element.querySelector('h3')?.textContent).toContain('Fale comigo');
    expect(element.querySelector('#contact-panel-name')).toBeTruthy();
    expect(element.querySelector('#contact-panel-email')).toBeTruthy();
    expect(element.querySelector('#contact-panel-message')).toBeTruthy();
    expect(element.querySelector('[data-testid="contact-panel-whatsapp"]')?.textContent).toContain(
      'WhatsApp',
    );
    expect(element.querySelector('[data-testid="contact-panel-email"]')?.textContent).toContain(
      'e-mail',
    );
    expect(fixture.componentInstance.value()).toEqual({ name: '', email: '', message: '' });
  });

  it('keeps field values in its local state', async () => {
    await TestBed.configureTestingModule({ imports: [ContactPanelComponent] }).compileComponents();
    const fixture = TestBed.createComponent(ContactPanelComponent);
    fixture.componentRef.setInput('copy', copy);
    fixture.componentRef.setInput('destinations', testDestinations);
    await fixture.whenStable();
    fixture.detectChanges();

    const name = fixture.nativeElement.querySelector('#contact-panel-name') as HTMLInputElement;
    name.value = 'Visitante';
    name.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(fixture.componentInstance.value()).toEqual({ name: 'Visitante', email: '', message: '' });
  });

  it('prevents opening a channel and shows localized errors for invalid values', async () => {
    await TestBed.configureTestingModule({ imports: [ContactPanelComponent] }).compileComponents();
    const fixture = TestBed.createComponent(ContactPanelComponent);
    fixture.componentRef.setInput('copy', copy);
    fixture.componentRef.setInput('destinations', testDestinations);
    await fixture.whenStable();
    fixture.detectChanges();
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);

    (fixture.nativeElement.querySelector('[data-testid="contact-panel-whatsapp"]') as HTMLButtonElement).click();
    fixture.detectChanges();

    expect(openSpy).not.toHaveBeenCalled();
    expect(fixture.nativeElement.querySelector('#contact-panel-name-error')?.textContent).toContain(
      'Informe seu nome.',
    );
    expect(fixture.nativeElement.querySelector('#contact-panel-email-error')?.textContent).toContain(
      'Informe seu e-mail.',
    );
    expect(fixture.nativeElement.querySelector('#contact-panel-message-error')?.textContent).toContain(
      'Escreva uma mensagem.',
    );
    openSpy.mockRestore();
  });

  it('opens the WhatsApp destination in a new tab for valid values', async () => {
    await TestBed.configureTestingModule({ imports: [ContactPanelComponent] }).compileComponents();
    const fixture = TestBed.createComponent(ContactPanelComponent);
    fixture.componentRef.setInput('copy', copy);
    fixture.componentRef.setInput('destinations', testDestinations);
    await fixture.whenStable();
    fixture.detectChanges();
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);
    fill(fixture, '#contact-panel-name', 'Visitante Teste');
    fill(fixture, '#contact-panel-email', 'visitante@example.com');
    fill(fixture, '#contact-panel-message', 'Olá, gostaria de conversar.');

    (fixture.nativeElement.querySelector('[data-testid="contact-panel-whatsapp"]') as HTMLButtonElement).click();

    expect(openSpy).toHaveBeenCalledWith(
      expect.stringContaining('https://wa.me/5511999999999?text='),
      '_blank',
      'noopener,noreferrer',
    );
    const url = String(openSpy.mock.calls[0]?.[0]);
    expect(decodeURIComponent(url.split('text=')[1] ?? '')).toContain('Nome: Visitante Teste');
    expect(decodeURIComponent(url.split('text=')[1] ?? '')).toContain('Olá, gostaria de conversar.');
    openSpy.mockRestore();
  });

  it('opens the email destination with the subject and body in a new tab', async () => {
    await TestBed.configureTestingModule({ imports: [ContactPanelComponent] }).compileComponents();
    const fixture = TestBed.createComponent(ContactPanelComponent);
    fixture.componentRef.setInput('copy', copy);
    fixture.componentRef.setInput('destinations', testDestinations);
    await fixture.whenStable();
    fixture.detectChanges();
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);
    fill(fixture, '#contact-panel-name', 'Visitante Teste');
    fill(fixture, '#contact-panel-email', 'visitante@example.com');
    fill(fixture, '#contact-panel-message', 'Mensagem de teste.');

    (fixture.nativeElement.querySelector('[data-testid="contact-panel-email"]') as HTMLButtonElement).click();

    const url = String(openSpy.mock.calls[0]?.[0]);
    expect(url.startsWith('mailto:destinatario@exemplo.com?')).toBe(true);
    const params = new URLSearchParams(url.split('?')[1]);
    expect(params.get('subject')).toBe('Contato pelo portfólio');
    expect(params.get('body')).toContain('E-mail: visitante@example.com');
    expect(params.get('body')).toContain('Mensagem de teste.');
    expect(openSpy).toHaveBeenCalledWith(url, '_blank', 'noopener,noreferrer');
    openSpy.mockRestore();
  });
});
