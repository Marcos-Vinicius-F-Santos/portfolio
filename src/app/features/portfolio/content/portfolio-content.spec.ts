import { ORIGINAL_COPY, selectPortfolioCopy } from './portfolio-content';
import { ENGLISH_COPY } from './portfolio-translations';

describe('portfolio content fallback (FR-009)', () => {
  it('uses original Portuguese without consulting translations', () => {
    const source = vi.fn(() => ENGLISH_COPY);
    expect(selectPortfolioCopy('pt-BR', source)).toEqual(ORIGINAL_COPY);
    expect(source).not.toHaveBeenCalled();
  });
  it('selects the complete English catalogue', () => {
    expect(selectPortfolioCopy('en', () => ENGLISH_COPY)).toEqual(ENGLISH_COPY);
  });
  it('falls back only for missing or empty fields (AC-008)', () => {
    const copy = selectPortfolioCopy('en', () => ({ aboutTitle: 'About me', intro: '' }));
    expect(copy.aboutTitle).toBe('About me');
    expect(copy.intro).toBe(ORIGINAL_COPY.intro);
    expect(copy.experienceBody).toBe(ORIGINAL_COPY.experienceBody);
  });
  it('keeps the original when the source fails (AC-009)', () => {
    expect(
      selectPortfolioCopy('en', () => {
        throw new Error('source failed');
      }),
    ).toEqual(ORIGINAL_COPY);
  });
  it('isolates a failed field without discarding other translations', () => {
    expect(
      selectPortfolioCopy('en', () => ({
        ...ENGLISH_COPY,
        get aboutTitle(): string {
          throw new Error('field failed');
        },
      })),
    ).toEqual({ ...ENGLISH_COPY, aboutTitle: ORIGINAL_COPY.aboutTitle });
  });
});
