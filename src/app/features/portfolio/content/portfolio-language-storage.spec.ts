import { LANGUAGE_STORAGE_KEY, PortfolioLanguageStorage } from './portfolio-language-storage';

describe('language cache (FR-006/007)', () => {
  beforeEach(() => localStorage.clear());

  it('persists only its own record and restores it in a new instance', () => {
    localStorage.setItem('unrelated', 'keep');
    const storage = new PortfolioLanguageStorage(() => localStorage);
    storage.write({ language: 'en', declined: true });
    expect(new PortfolioLanguageStorage(() => localStorage).read()).toEqual({
      language: 'en',
      declined: true,
    });
    expect(localStorage.getItem('unrelated')).toBe('keep');
  });

  it.each([
    '{',
    'null',
    '[]',
    '{"language":"es","declined":false}',
    '{"language":"en"}',
    '{"language":"en","declined":"true"}',
  ])('ignores invalid record %s', (raw) => {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, raw);
    expect(new PortfolioLanguageStorage(() => localStorage).read()).toBeNull();
  });

  it('does not keep a deleted record (AC-012)', () => {
    const storage = new PortfolioLanguageStorage(() => localStorage);
    storage.write({ language: 'pt-BR', declined: true });
    localStorage.removeItem(LANGUAGE_STORAGE_KEY);
    expect(storage.read()).toBeNull();
  });

  it('retains choices in memory when storage access throws', () => {
    const storage = new PortfolioLanguageStorage(() => {
      throw new Error('blocked');
    });
    expect(storage.read()).toBeNull();
    expect(() => storage.write({ language: 'en', declined: true })).not.toThrow();
    expect(storage.read()).toEqual({ language: 'en', declined: true });
  });

  it('retains choices without a browser storage provider', () => {
    const storage = new PortfolioLanguageStorage(() => null);
    storage.write({ language: 'en', declined: false });
    expect(storage.read()?.language).toBe('en');
  });
});
