const ELEMENTS = new Set(['svg','g','path','circle','ellipse','line','polyline','polygon','rect']);
const ATTRIBUTES = new Set(['viewBox','width','height','fill','fill-rule','fill-opacity','stroke','stroke-width','stroke-linecap','stroke-linejoin','stroke-opacity','d','cx','cy','r','rx','ry','x','y','x1','x2','y1','y2','points','opacity','transform','preserveAspectRatio','xmlns']);
export function sanitizeSvg(input: string): string | null {
  if (!input || /<!doctype|<!entity|<!--|<!\[CDATA|<script|<foreignObject|javascript:|data:|https?:\/\//i.test(input)) return null;
  const stack: string[] = [], output: string[] = [];
  const tokens = input.match(/<[^>]+>/g);
  if (!tokens || tokens.length === 0 || !/^\s*<svg(?:\s|>)/i.test(tokens[0])) return null;
  for (const token of tokens) {
    const close = token.match(/^<\/\s*([A-Za-z][\w:-]*)\s*>$/);
    if (close) { if (stack.pop() !== close[1].toLowerCase()) return null; output.push(token); continue; }
    const open = token.match(/^<\s*([A-Za-z][\w:-]*)([\s\S]*?)(\/?)>$/);
    if (!open) return null;
    const name = open[1].toLowerCase(); if (!ELEMENTS.has(name)) return null;
    const attrs = open[2]; const names = new Set<string>();
    let stripped = '';
    try { stripped = attrs.replace(/([:\w-]+)\s*=\s*("[^"]*"|'[^']*')/g, (_, key: string, value: string) => { const normalized = key; if (!ATTRIBUTES.has(normalized) || names.has(normalized) || /^on/i.test(normalized) || /url\s*\(|expression\s*\(/i.test(value)) throw new Error('invalid attribute'); names.add(normalized); return ''; }); } catch { return null; }
    if (stripped.replace(/\s|\//g, '') !== '') return null;
    output.push(token); if (open[3] !== '/') stack.push(name);
  }
  return stack.length === 0 && output.at(-1)?.toLowerCase() === '</svg>' ? output.join('') : null;
}
