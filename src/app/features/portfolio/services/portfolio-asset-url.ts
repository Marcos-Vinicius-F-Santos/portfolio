const ROOT_ASSETS_PREFIX = '/assets/';

/**
 * Resolves repository assets relative to Angular's configured base href.
 *
 * GitHub Pages serves this application below `/portfolio/`, so a root-relative
 * `/assets/...` URL skips the base path and requests a file that does not
 * exist. Returning `assets/...` lets the browser resolve the path through the
 * `<base href>` in both local development and the published site.
 */
export function resolvePortfolioAssetUrl(value: string | null | undefined): string | undefined {
  const normalized = value?.trim();
  if (!normalized) return undefined;
  if (!normalized.startsWith(ROOT_ASSETS_PREFIX)) return normalized;
  return normalized.slice(1);
}
