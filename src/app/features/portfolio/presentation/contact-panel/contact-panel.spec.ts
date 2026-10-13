import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { ContactPanel } from './contact-panel';
import type { ContactPanelCopy } from './contact-panel.models';

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

describe('ContactPanel', () => {
  it('renders its localized contract and empty initial state', async () => {
    await TestBed.configureTestingModule({ imports: [ContactPanel] }).compileComponents();
    const fixture = TestBed.createComponent(ContactPanel);
    fixture.componentRef.setInput('copy', copy);
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
    await TestBed.configureTestingModule({ imports: [ContactPanel] }).compileComponents();
    const fixture = TestBed.createComponent(ContactPanel);
    fixture.componentRef.setInput('copy', copy);
    await fixture.whenStable();
    fixture.detectChanges();

    const name = fixture.nativeElement.querySelector('#contact-panel-name') as HTMLInputElement;
    name.value = 'Marcos';
    name.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(fixture.componentInstance.value()).toEqual({ name: 'Marcos', email: '', message: '' });
  });

  it('prevents opening a channel and shows localized errors for invalid values', async () => {
    await TestBed.configureTestingModule({ imports: [ContactPanel] }).compileComponents();
    const fixture = TestBed.createComponent(ContactPanel);
    fixture.componentRef.setInput('copy', copy);
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
    await TestBed.configureTestingModule({ imports: [ContactPanel] }).compileComponents();
    const fixture = TestBed.createComponent(ContactPanel);
    fixture.componentRef.setInput('copy', copy);
    await fixture.whenStable();
    fixture.detectChanges();
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);
    fill(fixture, '#contact-panel-name', 'Marcos Santos');
    fill(fixture, '#contact-panel-email', 'marcos@example.com');
    fill(fixture, '#contact-panel-message', 'Olá, gostaria de conversar.');

    (fixture.nativeElement.querySelector('[data-testid="contact-panel-whatsapp"]') as HTMLButtonElement).click();

    expect(openSpy).toHaveBeenCalledWith(
      expect.stringContaining('https://wa.me/5537998292763?text='),
      '_blank',
      'noopener,noreferrer',
    );
    const url = String(openSpy.mock.calls[0]?.[0]);
    expect(decodeURIComponent(url.split('text=')[1] ?? '')).toContain('Nome: Marcos Santos');
    expect(decodeURIComponent(url.split('text=')[1] ?? '')).toContain('Olá, gostaria de conversar.');
    openSpy.mockRestore();
  });

  it('opens the email destination with the subject and body in a new tab', async () => {
    await TestBed.configureTestingModule({ imports: [ContactPanel] }).compileComponents();
    const fixture = TestBed.createComponent(ContactPanel);
    fixture.componentRef.setInput('copy', copy);
    await fixture.whenStable();
    fixture.detectChanges();
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);
    fill(fixture, '#contact-panel-name', 'Marcos Santos');
    fill(fixture, '#contact-panel-email', 'marcos@example.com');
    fill(fixture, '#contact-panel-message', 'Hello from the portfolio.');

    (fixture.nativeElement.querySelector('[data-testid="contact-panel-email"]') as HTMLButtonElement).click();

    const url = String(openSpy.mock.calls[0]?.[0]);
    expect(url.startsWith('mailto:marcossantosjdev@gmail.com?')).toBe(true);
    const params = new URLSearchParams(url.split('?')[1]);
    expect(params.get('subject')).toBe('Contato pelo portfólio');
    expect(params.get('body')).toContain('E-mail: marcos@example.com');
    expect(params.get('body')).toContain('Hello from the portfolio.');
    expect(openSpy).toHaveBeenCalledWith(url, '_blank', 'noopener,noreferrer');
    openSpy.mockRestore();
  });
});

function fill(fixture: ReturnType<typeof TestBed.createComponent<ContactPanel>>, selector: string, value: string): void {
  const field = fixture.nativeElement.querySelector(selector) as HTMLInputElement | HTMLTextAreaElement;
  field.value = value;
  field.dispatchEvent(new Event('input'));
  fixture.detectChanges();
}
