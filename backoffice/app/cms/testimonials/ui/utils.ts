import { env } from '@/lib/env';

/**
 * Normaliza URLs de multimedia a rutas absolutas
 */
export function normalizeMediaUrl(url?: string | null): string | undefined {
  if (!url) return undefined;

  const cleaned = url.replace('/../', '/');

  try {
    new URL(cleaned);
    return cleaned;
  } catch {
    // No es URL absoluta
  }

  if (cleaned.startsWith('/')) {
    return `${env.backendApiUrl}${cleaned}`;
  }

  return `${env.backendApiUrl}/${cleaned}`;
}