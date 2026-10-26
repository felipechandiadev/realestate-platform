/**
 * Core limita intentos por IP (login, registro, recuperación, formularios
 * públicos). Como estas llamadas salen del servidor de Next.js, core vería
 * siempre la IP del servidor; por eso se reenvía la del visitante en esta
 * cabecera (core solo la acepta si la petición viene de una IP de confianza).
 */
export const CLIENT_IP_HEADER = 'x-client-ip';

type HeaderSource = { get(name: string): string | null | undefined };

/** IP del visitante según las cabeceras que agrega nginx. */
export function clientIpFrom(source: HeaderSource): string | null {
  const forwarded = source.get('x-forwarded-for')?.split(',')[0]?.trim();
  const ip = forwarded || source.get('x-real-ip')?.trim();
  return ip || null;
}
