import { assert, assertEquals } from 'https://deno.land/std@0.224.0/assert/mod.ts';
import { sanitizeForTest } from './testable.ts';

function sanitizedPathForTest(path: string): string {
  const separator = path.lastIndexOf('/');
  return `${path.slice(0, separator + 1)}sanitized-${path.slice(separator + 1)}`;
}

Deno.test('accepts a minimal static SVG', () => {
  const result = sanitizeForTest('<svg viewBox="0 0 10 10"><path d="M0 0h10v10z"/></svg>');
  assert(result !== null);
  assert(result.includes('<svg'));
});

Deno.test('accepts an XML declaration and a non-executable comment', () => {
  const result = sanitizeForTest('<?xml version="1.0"?><!-- source metadata --><svg width="800px" height="800px" viewBox="0 -30 150 150" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0 0h10v10z" fill="#F90"/></svg>');
  assert(result !== null);
  assert(!result.includes('<?xml'));
  assert(!result.includes('source metadata'));
});

Deno.test('derives the deterministic sanitized object path', () => {
  assertEquals(
    sanitizedPathForTest('actor-id/media-id.svg'),
    'actor-id/sanitized-media-id.svg',
  );
});

for (const [name, payload] of [
  ['script', '<svg><script>alert(1)</script></svg>'],
  ['foreignObject', '<svg><foreignObject><div>x</div></foreignObject></svg>'],
  ['external-url', '<svg><image href="https://evil.test/x"/></svg>'],
  ['javascript-url', '<svg><a href="javascript:alert(1)"></a></svg>'],
  ['event-handler', '<svg onload="alert(1)"></svg>'],
  ['unsafe-namespace', '<svg xmlns="https://evil.test/svg"><path d="M0 0h10v10z"/></svg>'],
] as const) {
  Deno.test(`rejects ${name}`, () => assertEquals(sanitizeForTest(payload), null));
}
