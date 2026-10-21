'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { env } from '@/lib/env';
import { refreshAccessToken } from '@/features/shared/auth/actions/auth.action';

export type BrowserPushSubscription = {
  endpoint: string;
  keys: { p256dh: string; auth: string };
};

export async function getPushPublicKey(): Promise<string | null> {
  try {
    const response = await fetch(`${env.backendApiUrl}/notifications/push/public-key`, { cache: 'no-store' });
    if (!response.ok) return null;
    const payload = (await response.json()) as { publicKey?: string | null };
    return payload.publicKey ?? null;
  } catch {
    return null;
  }
}

async function postSubscription(path: string, method: 'POST' | 'DELETE', subscription: BrowserPushSubscription) {
  const session = await getServerSession(authOptions) as ({ accessToken?: string } | null);
  if (!session?.accessToken) return { success: false as const, error: 'No hay una sesión activa.' };

  const send = (token: string) => fetch(`${env.backendApiUrl}${path}`, {
    method,
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(subscription),
    cache: 'no-store',
  });

  try {
    let response = await send(session.accessToken);
    if (response.status === 401) {
      const refreshed = await refreshAccessToken();
      if (!refreshed.success || !refreshed.data?.access_token) {
        return { success: false as const, error: 'La sesión expiró.' };
      }
      response = await send(refreshed.data.access_token);
    }
    if (!response.ok) {
      const payload = await response.json().catch(() => null);
      return { success: false as const, error: payload?.message || `HTTP ${response.status}` };
    }
    return { success: true as const };
  } catch {
    return { success: false as const, error: 'No se pudo conectar con el servicio de notificaciones.' };
  }
}

export async function saveBrowserPushSubscription(subscription: BrowserPushSubscription) {
  return postSubscription('/notifications/push/subscriptions', 'POST', subscription);
}

export async function removeBrowserPushSubscription(subscription: BrowserPushSubscription) {
  return postSubscription('/notifications/push/subscriptions', 'DELETE', subscription);
}
