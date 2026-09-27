import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.117.1';
import { sanitizeSvg } from './sanitize.ts';

const MAX_BYTES = 1_048_576;
const ALLOWED_ELEMENTS = new Set([
  'svg',
  'g',
  'path',
  'circle',
  'ellipse',
  'line',
  'polyline',
  'polygon',
  'rect',
]);
const ALLOWED_ATTRIBUTES = new Set([
  'viewBox',
  'width',
  'height',
  'fill',
  'fill-rule',
  'fill-opacity',
  'stroke',
  'stroke-width',
  'stroke-linecap',
  'stroke-linejoin',
  'stroke-opacity',
  'd',
  'cx',
  'cy',
  'r',
  'rx',
  'ry',
  'x',
  'y',
  'x1',
  'x2',
  'y1',
  'y2',
  'points',
  'opacity',
  'transform',
  'preserveAspectRatio',
  'xmlns',
]);

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

type Row = {
  id: string;
  actor_id: string;
  revision: number;
  bucket: string;
  path: string;
  status: string;
  purpose: string;
};

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS });
  }
  if (request.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);
  const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
  if (!token) return json({ error: 'unauthorized' }, 401);

  const payload = (await request.json().catch(() => null)) as {
    media_id?: string;
    expected_revision?: number;
  } | null;
  if (!payload?.media_id || !Number.isSafeInteger(payload.expected_revision)) {
    return json({ error: 'invalid_request' }, 400);
  }
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    { global: { headers: { Authorization: `Bearer ${token}` } } },
  );
  const { data: userData } = await supabase.auth.getUser(token);
  const user = userData.user;
  if (!user) return json({ error: 'unauthorized' }, 401);
  const { data: admin } = await supabase
    .from('portfolio_admins')
    .select('user_id')
    .eq('user_id', user.id)
    .maybeSingle();
  if (!admin) return json({ error: 'forbidden' }, 403);
  const { data: media, error } = (await supabase
    .schema('portfolio_editorial')
    .from('media')
    .select('id,actor_id,revision,bucket,path,status,purpose')
    .eq('id', payload.media_id)
    .maybeSingle()) as { data: Row | null; error: unknown };
  if (
    error ||
    !media ||
    media.actor_id !== user.id ||
    media.revision !== payload.expected_revision ||
    media.status !== 'pending' ||
    media.purpose !== 'skill_icon'
  ) {
    return json({ error: 'media_reservation_unavailable' }, 409);
  }
  const { data: source, error: downloadError } = await supabase.storage
    .from(media.bucket)
    .download(media.path);
  if (downloadError || !source || source.size > MAX_BYTES)
    return json({ error: 'invalid_svg' }, 422);
  const bytes = new Uint8Array(await source.arrayBuffer());
  const xml = new TextDecoder().decode(bytes);
  const sanitized = sanitizeSvg(xml);
  if (!sanitized) return json({ error: 'invalid_svg' }, 422);
  const sanitizedPath = `${media.path.replace(/\/([^/]+)$/, '/sanitized-$1')}`;
  const { error: uploadError } = await supabase.storage
    .from(media.bucket)
    .upload(sanitizedPath, new Blob([sanitized], { type: 'image/svg+xml' }), {
      contentType: 'image/svg+xml',
      upsert: false,
    });
  if (uploadError) return json({ error: 'sanitization_failed' }, 500);
  const checksum = await sha256(new TextEncoder().encode(sanitized));
  const { error: updateError } = await supabase
    .schema('portfolio_editorial')
    .from('media')
    .update({
      path: sanitizedPath,
      mime: 'image/svg+xml',
      bytes: new TextEncoder().encode(sanitized).byteLength,
      checksum,
      status: 'ready',
    })
    .eq('id', media.id);
  if (updateError) return json({ error: 'sanitization_failed' }, 500);
  return json({ media_id: media.id, status: 'ready', path: sanitizedPath, checksum });
});

async function sha256(bytes: Uint8Array): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(digest)].map((value) => value.toString(16).padStart(2, '0')).join('');
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, 'content-type': 'application/json' },
  });
}
