import { describe, expect, it } from 'vitest';

import snapshotArtifact from '../../../../../spec/05-verificacao/edicao-visual-rascunho-publicacao/initial-editorial-snapshot-v1.json';
import { validateEditorialSnapshot } from './editorial-snapshot.validator';

describe('snapshot editorial inicial', () => {
  const snapshot = snapshotArtifact as unknown as Record<string, unknown>;

  it('passa pelo validador v1 usado pelo cliente', () => {
    expect(validateEditorialSnapshot(snapshot)).toEqual({
      valid: true,
      snapshot,
      issues: [],
    });
  });

  it('preserva o corpus inventariado sem criar mídia remota inexistente', () => {
    const entities = snapshot['entities'] as Record<
      string,
      { kind: string; data?: Record<string, unknown> }
    >;
    const translations = snapshot['translations'] as Record<string, Record<string, unknown>>;
    const media = snapshot['media'] as Record<string, { source: string }>;
    const technologies = snapshot['technologies'] as Record<
      string,
      { label: string; aliases: string[] }
    >;

    expect(Object.keys(entities)).toHaveLength(191);
    expect(Object.keys(translations['pt-BR'])).toHaveLength(191);
    expect(Object.keys(translations['en'])).toHaveLength(191);
    expect(entities['3c67f7d3-57a6-4ece-af10-496b8ca33727']?.kind).toBe('project');
    expect(entities['d9580705-9f05-407a-a367-1c729da2e63a']?.kind).toBe('project');
    expect(Object.values(media)).toHaveLength(18);
    expect(Object.keys(technologies)).toHaveLength(41);
    expect(technologies['java'].aliases).toContain('Java 21');
    expect(technologies['react'].aliases).toContain('React 18');
    expect(entities['3c67f7d3-57a6-4ece-af10-496b8ca33727'].data?.['technologyIds']).toContain(
      'java',
    );
    expect(Object.values(media).every(({ source }) => source === 'bundled')).toBe(true);
    expect(Object.values(entities).some(({ kind }) => kind === 'projectImage')).toBe(false);
    expect(Object.values(entities).some(({ kind }) => kind === 'curriculum')).toBe(false);
  });
});
