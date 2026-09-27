import { sanitizeSvg } from './sanitize.ts';
export function sanitizeForTest(input: string): string | null {
  return sanitizeSvg(input);
}
