import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { env } from '@/lib/env';

export type AgentScope = 'properties:read' | 'properties:write' | 'properties:publish';

export interface AgentKeyDto {
  id: string;
  name: string;
  keyPrefix: string;
  scopes: AgentScope[];
  expiresAt: string | null;
  lastUsedAt: string | null;
  revokedAt: string | null;
  createdAt: string;
}

async function authHeaders(): Promise<HeadersInit> {
  const session = await getServerSession(authOptions);
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const token = (session as any)?.accessToken;
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

async function errorMessage(res: Response, fallback: string): Promise<string> {
  try {
    const body = await res.json();
    const m = body?.message;
    return Array.isArray(m) ? m.join(', ') : typeof m === 'string' ? m : fallback;
  } catch {
    return fallback;
  }
}

/** Único borde HTTP hacia core para las keys de agentes de IA (solo ADMIN). */
export const AgentKeysRequest = {
  async list(): Promise<AgentKeyDto[]> {
    const res = await fetch(`${env.backendApiUrl}/agent-keys`, { headers: await authHeaders(), cache: 'no-store' });
    if (!res.ok) throw new Error(await errorMessage(res, `No se pudo cargar (${res.status})`));
    return res.json();
  },

  async create(input: { name: string; scopes: AgentScope[]; expiresAt?: string }): Promise<AgentKeyDto & { token: string }> {
    const res = await fetch(`${env.backendApiUrl}/agent-keys`, {
      method: 'POST',
      headers: await authHeaders(),
      body: JSON.stringify(input),
      cache: 'no-store',
    });
    if (!res.ok) throw new Error(await errorMessage(res, `No se pudo crear (${res.status})`));
    return res.json();
  },

  async revoke(id: string): Promise<AgentKeyDto> {
    const res = await fetch(`${env.backendApiUrl}/agent-keys/${encodeURIComponent(id)}/revoke`, {
      method: 'POST',
      headers: await authHeaders(),
      body: '{}',
      cache: 'no-store',
    });
    if (!res.ok) throw new Error(await errorMessage(res, `No se pudo revocar (${res.status})`));
    return res.json();
  },
};
