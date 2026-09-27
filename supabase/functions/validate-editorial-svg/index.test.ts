import { assert, assertEquals } from 'https://deno.land/std@0.224.0/assert/mod.ts';
import { sanitizeForTest } from './testable.ts';

Deno.test('accepts a minimal static SVG', () => {
  const result = sanitizeForTest('<svg viewBox="0 0 10 10"><path d="M0 0h10v10z"/></svg>');
  assert(result !== null);
  assert(result.includes('<svg'));
});

for (const [name, payload] of [
  ['script', '<svg><script>alert(1)</script></svg>'],
  ['foreignObject', '<svg><foreignObject><div>x</div></foreignObject></svg>'],
  ['external-url', '<svg><image href="https://evil.test/x"/></svg>'],
  ['javascript-url', '<svg><a href="javascript:alert(1)"></a></svg>'],
  ['event-handler', '<svg onload="alert(1)"></svg>'],
] as const) {
  Deno.test(`rejects ${name}`, () => assertEquals(sanitizeForTest(payload), null));
}
