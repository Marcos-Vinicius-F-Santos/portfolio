import {
  ORIGINAL_COPY,
  PORTFOLIO_ACADEMIC_ENTRIES,
  PORTFOLIO_CONTACT_LINKS,
  PORTFOLIO_SKILL_CATEGORIES,
  hasPortfolioSectionContent,
  selectPortfolioCopy,
} from './portfolio-content';
import { ENGLISH_COPY } from './portfolio-translations';

describe('portfolio content fallback (FR-005/FR-006)', () => {
  it('uses original Portuguese without consulting translations', () => {
    const source = vi.fn(() => ENGLISH_COPY);
    expect(selectPortfolioCopy('pt-BR', source)).toEqual(ORIGINAL_COPY);
    expect(source).not.toHaveBeenCalled();
  });
  it('selects the complete English catalogue', () => {
    expect(selectPortfolioCopy('en', () => ENGLISH_COPY)).toEqual(ENGLISH_COPY);
  });
  it('falls back only for missing or empty fields', () => {
    const copy = selectPortfolioCopy('en', () => ({ aboutTitle: 'About me', intro: '' }));
    expect(copy.aboutTitle).toBe('About me');
    expect(copy.intro).toBe(ORIGINAL_COPY.intro);
    expect(copy.experienceBody).toBe(ORIGINAL_COPY.experienceBody);
  });
  it('keeps the original when the source fails', () => {
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
  it('identifies available and unavailable feature sections', () => {
    expect(hasPortfolioSectionContent(ORIGINAL_COPY, 'presentation')).toBe(true);
    expect(hasPortfolioSectionContent(ORIGINAL_COPY, 'about')).toBe(true);
    expect(hasPortfolioSectionContent(ORIGINAL_COPY, 'results')).toBe(true);
    expect(hasPortfolioSectionContent({ ...ORIGINAL_COPY, intro: '' }, 'presentation')).toBe(false);
    expect(hasPortfolioSectionContent({ ...ORIGINAL_COPY, aboutBody: '' }, 'about')).toBe(false);

    const withoutResults = {
      ...ORIGINAL_COPY,
      resultsTimeReduction: '',
      resultsStepsReduction: '',
      resultsUsersServed: '',
      resultsProductivityGain: '',
    };
    expect(hasPortfolioSectionContent(withoutResults, 'results')).toBe(false);
    expect(
      hasPortfolioSectionContent(
        { ...withoutResults, resultsUsersServed: 'approved result' },
        'results',
      ),
    ).toBe(true);
  });

  it('falls back independently when a professional result translation is missing', () => {
    const copy = selectPortfolioCopy('en', () => ({
      resultsTimeReduction: '',
      resultsStepsReduction: ENGLISH_COPY.resultsStepsReduction,
    }));
    expect(copy.resultsTimeReduction).toBe(ORIGINAL_COPY.resultsTimeReduction);
    expect(copy.resultsStepsReduction).toBe(ENGLISH_COPY.resultsStepsReduction);
  });

  it('contains the approved skills catalogue and academic entries', () => {
    expect(PORTFOLIO_SKILL_CATEGORIES).toHaveLength(6);
    expect(
      PORTFOLIO_SKILL_CATEGORIES.flatMap((category) => category.skills.map((skill) => skill.name)),
    ).toEqual(
      expect.arrayContaining([
        'Java',
        'JavaScript',
        'TypeScript',
        'Node.js',
        'ABAP',
        'SAP',
        'RFC',
        'BAPI',
        'JCo',
        'REST APIs',
        'SMTP',
        'Mendix',
        'OutSystems',
        'React',
        'HTML',
        'CSS',
        'Docker',
        'Gradle',
        'Maven',
        'Grafana',
        'SQL Server',
        'MySQL',
        'PostgreSQL',
        'MongoDB',
        'Git',
        'GitHub',
        'GitLab',
      ]),
    );
    expect(PORTFOLIO_ACADEMIC_ENTRIES.map((entry) => entry.nameKey)).toEqual([
      'educationDataScience',
      'educationAppliedStatistics',
      'educationGraphicDesign',
    ]);
    expect(
      PORTFOLIO_ACADEMIC_ENTRIES.every((entry) => entry.institution === 'Unopar Anhanguera'),
    ).toBe(true);
    expect(PORTFOLIO_ACADEMIC_ENTRIES[0]).toMatchObject({
      startDate: '2023-07-12',
      endDate: '2024-05-07',
      competencies: expect.arrayContaining(['Python com Spark', 'Machine Learning']),
    });
    expect(PORTFOLIO_ACADEMIC_ENTRIES[1]).toMatchObject({
      startDate: '2023-12-13',
      endDate: '2024-06-12',
      competencies: expect.arrayContaining(['Análise multivariada e modelos de regressão']),
    });
    expect(PORTFOLIO_ACADEMIC_ENTRIES[2]).toMatchObject({
      startDate: '2022-02-01',
      endDate: '2023-06-21',
      competencies: expect.arrayContaining(['Comunicação']),
    });
  });

  it('associates the provided manual icons with their matching skills', () => {
    const skills = new Map(
      PORTFOLIO_SKILL_CATEGORIES.flatMap((category) =>
        category.skills.map((skill) => [skill.name, skill.iconUrl] as const),
      ),
    );

    expect(skills.get('Java')).toBe('/assets/skills/java.png');
    expect(skills.get('REST APIs')).toBe('/assets/skills/rest-apis.png');
    expect(skills.get('GitHub')).toBe('/assets/skills/github.png');
    expect(skills.get('ABAP')).toBeUndefined();
    expect(skills.get('GitLab')).toBeUndefined();
  });

  it('contains the approved contact destinations and bilingual labels', () => {
    expect(PORTFOLIO_CONTACT_LINKS.map((link) => link.href)).toEqual([
      'https://www.linkedin.com/in/marcos-santos-b9b544214/',
      'https://github.com/Marcos-Vinicius-F-Santos',
      'mailto:marcossantosjdev@gmail.com',
      'tel:+5537998292763',
    ]);
    expect(
      PORTFOLIO_CONTACT_LINKS.every((link) => link.iconPath.startsWith('/assets/contact/')),
    ).toBe(true);
    expect(selectPortfolioCopy('en', () => ENGLISH_COPY)).toMatchObject({
      stackTitle: 'Skills',
      educationTitle: 'Academic background',
      contactTitle: 'Contact',
      contactCurriculumDownloadLabel: 'Download resume',
    });
  });
});
