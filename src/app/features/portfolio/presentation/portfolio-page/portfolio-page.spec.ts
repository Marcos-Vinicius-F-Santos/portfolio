import { TestBed } from '@angular/core/testing';
import { PortfolioPage } from './portfolio-page';

describe('PortfolioPage', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PortfolioPage],
    }).compileComponents();
  });

  it('renders the three page sections and their navigation targets', async () => {
    const fixture = TestBed.createComponent(PortfolioPage);
    await fixture.whenStable();
    const element = fixture.nativeElement as HTMLElement;

    expect(element.querySelector('#sobre-mim')).toBeTruthy();
    expect(element.querySelector('#experiencias')).toBeTruthy();
    expect(element.querySelector('#stack-tecnica')).toBeTruthy();
    expect(element.querySelectorAll('nav a')).toHaveLength(3);
  });

  it('scrolls to an existing section from its navigation link', async () => {
    const fixture = TestBed.createComponent(PortfolioPage);
    await fixture.whenStable();
    const element = fixture.nativeElement as HTMLElement;
    const section = element.querySelector('#sobre-mim') as HTMLElement;
    const scrollIntoView = vi.fn<(arg?: boolean | ScrollIntoViewOptions) => void>();
    Object.defineProperty(section, 'scrollIntoView', {
      configurable: true,
      value: scrollIntoView,
    });

    (element.querySelector('a[href="#sobre-mim"]') as HTMLAnchorElement).click();

    expect(section.scrollIntoView).toHaveBeenCalledWith({
      behavior: 'smooth',
      block: 'start',
    });
  });

  it('keeps the page usable when a navigation target is missing', async () => {
    const fixture = TestBed.createComponent(PortfolioPage);
    await fixture.whenStable();
    const element = fixture.nativeElement as HTMLElement;
    const link = element.querySelector('a[href="#sobre-mim"]') as HTMLAnchorElement;
    link.href = '#alvo-inexistente';

    expect(() => link.click()).not.toThrow();
    expect(element.querySelector('[data-testid="portfolio-page"]')).toBeTruthy();
  });
});
