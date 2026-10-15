import { describe, expect, it } from 'vitest';

import { GENERIC_EDITORIAL_SNAPSHOT as snapshotArtifact } from './editorial-snapshot.fixture';
import { validateEditorialSnapshot } from './editorial-snapshot.validator';

describe('snapshot editorial inicial genérico', () => {
  const snapshot = snapshotArtifact as unknown as Record<string, unknown>;

  it('passa pelo validador v1 usado pelo cliente', () => {
    const result = validateEditorialSnapshot(snapshot);
    if (!result.valid) {
      console.error(result.issues);
    }
    expect(result.valid).toBe(true);
  });

  it('contém somente conteúdo neutro e referências públicas de exemplo', () => {
    const raw = JSON.stringify(snapshot);
    expect(raw).not.toMatch(/personal-profile|private-contact|profile-image-from-repository/i);
    expect(raw).toContain('profile-generic');
    expect(raw).toContain('example.com');
  });
});
