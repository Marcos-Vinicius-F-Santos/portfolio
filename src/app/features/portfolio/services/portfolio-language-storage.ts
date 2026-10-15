import type { LanguagePreference } from './portfolio-language';

export const LANGUAGE_STORAGE_KEY = 'portfolio.language.v1';

export class PortfolioLanguageStorage {
  private memory: LanguagePreference | null = null;

  constructor(private readonly storage: () => Pick<Storage, 'getItem' | 'setItem'> | null) {}

  read(): LanguagePreference | null {
    try {
      const storage = this.storage();
      if (!storage) return this.memory;
      const raw = storage.getItem(LANGUAGE_STORAGE_KEY);
      if (raw === null) return (this.memory = null);
      const value: unknown = JSON.parse(raw);
      if (typeof value !== 'object' || value === null) return (this.memory = null);
      const candidate = value as Partial<LanguagePreference>;
      this.memory =
        (candidate.language === 'pt-BR' || candidate.language === 'en') &&
        typeof candidate.declined === 'boolean'
          ? { language: candidate.language, declined: candidate.declined }
          : null;
      return this.memory;
    } catch (error) {
      if (error instanceof SyntaxError) this.memory = null;
      return this.memory;
    }
  }

  write(preference: LanguagePreference): void {
    this.memory = { ...preference };
    try {
      this.storage()?.setItem(LANGUAGE_STORAGE_KEY, JSON.stringify(preference));
    } catch {
      // Keep the current page usable when storage is blocked or full.
    }
  }
}
