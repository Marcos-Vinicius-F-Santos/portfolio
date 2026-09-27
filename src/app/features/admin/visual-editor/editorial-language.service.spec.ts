import { TestBed } from '@angular/core/testing';
import { EditorialLanguageService } from './editorial-language.service';

describe('EditorialLanguageService', () => {
  it('altera somente o idioma do editor sem escrever a preferência pública', () => {
    localStorage.setItem('portfolio-language', 'preferência pública preservada');
    TestBed.configureTestingModule({ providers: [EditorialLanguageService] });
    const service = TestBed.inject(EditorialLanguageService);
    service.choose('en');
    expect(service.language()).toBe('en');
    expect(localStorage.getItem('portfolio-language')).toBe('preferência pública preservada');
  });
});
