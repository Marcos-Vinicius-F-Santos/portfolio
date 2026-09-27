import { validateEditorialUpload } from './editorial-media.models';

describe('editorial media contract (T-006)', () => {
  it('accepts raster images within the approved limit', () => {
    expect(validateEditorialUpload('project_image', 'image/png', 1_048_576)).toBe(true);
    expect(validateEditorialUpload('skill_icon', 'image/jpeg', 1)).toBe(true);
  });

  it('rejects oversized, empty and mismatched files', () => {
    expect(validateEditorialUpload('project_image', 'image/png', 1_048_577)).toBe(false);
    expect(validateEditorialUpload('curriculum', 'application/pdf', 0)).toBe(false);
    expect(validateEditorialUpload('curriculum', 'image/png', 100)).toBe(false);
  });

  it('allows SVG only for skill icons after ADR-009 validation', () => {
    expect(validateEditorialUpload('skill_icon', 'image/svg+xml', 100)).toBe(true);
    expect(validateEditorialUpload('project_image', 'image/svg+xml', 100)).toBe(false);
  });
});
