import { describe, expect, it } from 'vitest';
import { resolvePortfolioAssetUrl } from './portfolio-asset-url';

describe('resolvePortfolioAssetUrl', () => {
  it('makes repository assets relative to the configured application base', () => {
    expect(resolvePortfolioAssetUrl('/assets/skills/java.png')).toBe('assets/skills/java.png');
  });

  it('preserves external and already-relative URLs', () => {
    expect(resolvePortfolioAssetUrl('https://cdn.example.com/icon.svg')).toBe(
      'https://cdn.example.com/icon.svg',
    );
    expect(resolvePortfolioAssetUrl('assets/skills/java.png')).toBe('assets/skills/java.png');
  });

  it('returns undefined for an empty value', () => {
    expect(resolvePortfolioAssetUrl('  ')).toBeUndefined();
    expect(resolvePortfolioAssetUrl(undefined)).toBeUndefined();
  });
});
