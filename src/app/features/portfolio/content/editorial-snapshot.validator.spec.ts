import { validateEditorialSnapshot } from './editorial-snapshot.validator';

describe('editorial snapshot v1 contract (T-003)', () => {
  it('accepts a complete public v1 corpus', () => {
    expect(validateEditorialSnapshot(validSnapshot())).toEqual(
      expect.objectContaining({ valid: true, issues: [] }),
    );
  });

  it('rejects an unknown format version', () => {
    const snapshot = validSnapshot();
    snapshot['formatVersion'] = 2;

    expect(issueCodes(snapshot)).toContain('unknown_format_version');
  });

  it('rejects private or non-allowlisted data anywhere in the payload', () => {
    const snapshot = validSnapshot();
    snapshot['actorId'] = 'admin-user';
    snapshot['entities']['about'].data.internalNotes = 'private';
    snapshot['media']['about-image'].bucket = 'editorial-private';

    const result = validateEditorialSnapshot(snapshot);
    expect(result.valid).toBe(false);
    if (result.valid) return;
    expect(
      result.issues.filter((issue) => issue.code === 'unknown_field').map((issue) => issue.path),
    ).toEqual(
      expect.arrayContaining([
        '$.actorId',
        '$.entities.about.data.internalNotes',
        '$.media.about-image.bucket',
      ]),
    );
  });

  it('rejects references to missing entities and media', () => {
    const snapshot = validSnapshot();
    snapshot['entities']['about'].parentId = 'missing-parent';
    snapshot['technologies']['typescript'].iconMediaId = 'missing-icon';

    expect(issueCodes(snapshot)).toEqual(expect.arrayContaining(['missing_reference']));
  });

  it('rejects an active locale with incomplete required translations', () => {
    const snapshot = validSnapshot();
    snapshot['locales'].push({ code: 'es', label: 'Español', direction: 'ltr', position: 2 });
    snapshot['translations']['es'] = { about: { title: 'Sobre mí' } };

    const result = validateEditorialSnapshot(snapshot);
    expect(result.valid).toBe(false);
    if (result.valid) return;
    expect(result.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: 'incomplete_locale',
          path: '$.translations.es.about.body',
        }),
      ]),
    );
  });

  it('rejects executable URLs and HTML pasted into simple text fields', () => {
    const snapshot = validSnapshot();
    snapshot['entities']['contact'] = {
      kind: 'contact',
      position: 1,
      data: { symbol: 'site', href: 'javascript:alert(1)' },
    };
    snapshot['translations']['pt-BR']['contact'] = { label: '<script>alert(1)</script>' };
    snapshot['translations']['en']['contact'] = { label: 'Website' };

    expect(issueCodes(snapshot)).toContain('invalid_value');
  });
});

function issueCodes(snapshot: Record<string, any>): string[] {
  const result = validateEditorialSnapshot(snapshot);
  return result.valid ? [] : result.issues.map((issue) => issue.code);
}

function validSnapshot(): Record<string, any> {
  return {
    formatVersion: 1,
    publicationId: 'publication-1',
    createdAt: '2026-09-26T12:00:00.000Z',
    defaultLocale: 'pt-BR',
    locales: [
      { code: 'pt-BR', label: 'Português', direction: 'ltr', position: 0 },
      { code: 'en', label: 'English', direction: 'ltr', position: 1 },
    ],
    sections: [{ id: 'about-section', kind: 'about', position: 0 }],
    entities: {
      about: { kind: 'about', position: 0, data: {} },
    },
    translations: {
      'pt-BR': { about: { title: 'Sobre mim', body: 'Texto em português.' } },
      en: { about: { title: 'About me', body: 'English text.' } },
    },
    technologies: {
      typescript: { label: 'TypeScript', iconMediaId: 'about-image', aliases: ['TS'] },
    },
    media: {
      'about-image': {
        source: 'bundled',
        mime: 'image/png',
        bytes: 128,
        assetPath: '/assets/skills/typescript.png',
      },
    },
  };
}
