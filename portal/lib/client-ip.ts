import { headers } from 'next/headers';
import { clientIpFrom, CLIENT_IP_HEADER } from './client-ip-core';

export { clientIpFrom, CLIENT_IP_HEADER };

/** Cabecera para reenviar a core desde una server action o route handler. */
export async function clientIpHeader(): Promise<Record<string, string>> {
  try {
    const ip = clientIpFrom(await headers());
    return ip ? { [CLIENT_IP_HEADER]: ip } : {};
  } catch {
    // Fuera de una petición (build, tareas): no hay visitante que identificar.
    return {};
  }
}
