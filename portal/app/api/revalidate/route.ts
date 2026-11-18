import { createHash, timingSafeEqual } from 'node:crypto';
import { revalidateTag } from 'next/cache';
import { NextResponse } from 'next/server';

/**
 * Invalidación de caché a pedido del backoffice.
 *
 * El portal guarda en caché (hasta 5 min) la configuración del CMS: barra superior, footer,
 * identidad, colores y listados. El backoffice es otra aplicación y no puede invalidar esa
 * caché por sí solo, así que tras cada guardado llama a esta ruta con un secreto compartido
 * (`REVALIDATE_SECRET`, el mismo valor en portal y backoffice).
 *
 * Solo acepta etiquetas de la lista permitida; sin secreto configurado queda deshabilitada.
 */
const ALLOWED_TAGS = new Set([
  'portal-header',
  'portal-footer',
  'portal-listings-settings',
  'identity',
  'appearance',
  'public-listings',
  'public-featured',
  'sitemap',
]);

const MAX_TAGS = 10;

function sameSecret(given: string, expected: string): boolean {
  // Se comparan hashes para que la comparación sea de largo fijo y en tiempo constante.
  const a = createHash('sha256').update(given).digest();
  const b = createHash('sha256').update(expected).digest();
  return timingSafeEqual(a, b);
}

export async function POST(request: Request) {
  const secret = process.env.REVALIDATE_SECRET?.trim();
  if (!secret) {
    return NextResponse.json({ error: 'Revalidación no configurada' }, { status: 503 });
  }

  const given = request.headers.get('x-revalidate-secret') ?? '';
  if (!given || !sameSecret(given, secret)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'El cuerpo debe ser JSON' }, { status: 400 });
  }

  const tags = (body as { tags?: unknown })?.tags;
  if (!Array.isArray(tags) || tags.length === 0 || tags.length > MAX_TAGS || !tags.every((t) => typeof t === 'string')) {
    return NextResponse.json({ error: `tags debe ser una lista de 1 a ${MAX_TAGS} textos` }, { status: 400 });
  }

  const unknown = (tags as string[]).filter((t) => !ALLOWED_TAGS.has(t));
  if (unknown.length > 0) {
    return NextResponse.json(
      { error: `Etiquetas no permitidas: ${unknown.join(', ')}`, allowed: [...ALLOWED_TAGS] },
      { status: 400 },
    );
  }

  const unique = [...new Set(tags as string[])];
  // expire: 0 → la siguiente visita espera datos nuevos (no se sirve el valor viejo).
  for (const tag of unique) revalidateTag(tag, { expire: 0 });

  return NextResponse.json({ revalidated: unique });
}
