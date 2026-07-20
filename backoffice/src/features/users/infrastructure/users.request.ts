import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { env } from '@/lib/env';

async function authHeaders(): Promise<HeadersInit> {
  const session = await getServerSession(authOptions);
  const headers: HeadersInit = { 'Content-Type': 'application/json' };
  const token = (session as any)?.accessToken;
  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

/**
 * Unique HTTP boundary to core for users (staff).
 * Actions should call this — not fetch directly.
 */
export const UsersRequest = {
  async listAgents(params?: { search?: string; page?: number; limit?: number }) {
    const qs = new URLSearchParams();
    if (params?.search) qs.set('search', params.search);
    if (params?.page) qs.set('page', String(params.page));
    if (params?.limit) qs.set('limit', String(params.limit));
    const url = `${env.backendApiUrl}/users/agents${qs.toString() ? `?${qs}` : ''}`;
    const res = await fetch(url, {
      headers: await authHeaders(),
      cache: 'no-store',
    });
    if (!res.ok) {
      throw new Error(`listAgents failed: ${res.status}`);
    }
    return res.json();
  },

  async listAdminsAgents(params?: {
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const qs = new URLSearchParams();
    if (params?.search) qs.set('search', params.search);
    if (params?.page) qs.set('page', String(params.page));
    if (params?.limit) qs.set('limit', String(params.limit));
    const url = `${env.backendApiUrl}/users/admins-agents${qs.toString() ? `?${qs}` : ''}`;
    const res = await fetch(url, {
      headers: await authHeaders(),
      cache: 'no-store',
    });
    if (!res.ok) {
      throw new Error(`listAdminsAgents failed: ${res.status}`);
    }
    return res.json();
  },
};
