import { TestBed } from '@angular/core/testing';
import { SiteFooterComponent } from './site-footer.component';

describe('SiteFooterComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SiteFooterComponent],
    }).compileComponents();
  });

  it('renders dynamic brand monogram, copyright and author name in Portuguese', () => {
    const fixture = TestBed.createComponent(SiteFooterComponent);
    fixture.componentRef.setInput('brandMonogram', 'JV');
    fixture.componentRef.setInput('authorName', 'Usuario Teste');
    fixture.componentRef.setInput('locale', 'pt-BR');
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelector('.brand-logo__initials')?.textContent).toBe('JV');
    expect(element.querySelector('.brand-logo__suffix')?.textContent).toBe('.dev');
    expect(element.querySelector('[data-testid="footer-copyright"]')?.textContent).toContain('Usuario Teste');
    expect(element.querySelector('[data-testid="footer-copyright"]')?.textContent).toContain('Todos os direitos reservados.');
    expect(element.querySelector('[data-testid="footer-credit"]')?.textContent).toContain('Projetado e desenvolvido por Usuario Teste');
  });

  it('renders translated credits and copyright in English', () => {
    const fixture = TestBed.createComponent(SiteFooterComponent);
    fixture.componentRef.setInput('brandMonogram', 'AB');
    fixture.componentRef.setInput('authorName', 'Perfil Teste');
    fixture.componentRef.setInput('locale', 'en');
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelector('.brand-logo__initials')?.textContent).toBe('AB');
    expect(element.querySelector('[data-testid="footer-copyright"]')?.textContent).toContain('Perfil Teste');
    expect(element.querySelector('[data-testid="footer-copyright"]')?.textContent).toContain('All Rights Reserved.');
    expect(element.querySelector('[data-testid="footer-credit"]')?.textContent).toContain('Designed & engineered by Perfil Teste');
  });
});

