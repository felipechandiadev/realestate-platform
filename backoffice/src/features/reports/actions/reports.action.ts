'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { env } from '@/lib/env';
import { refreshAccessToken } from '@/features/shared/auth/actions/auth.action';

export type ReportId = 'agents' | 'properties' | 'contracts' | 'geographic';
export type ReportQuery = { startDate?: string; endDate?: string; operationType?: 'SALE' | 'RENT' };
export type ReportResult = {
  reportId: ReportId;
  title: string;
  generatedAt: string;
  params: ReportQuery;
  summary: Record<string, number>;
  columns: Array<{ key: string; label: string; align?: 'left' | 'right' }>;
  rows: Array<Record<string, string | number>>;
  series: Array<{ label: string; points: Array<{ label: string; value: number }> }>;
};

async function authenticatedRequest(path: string, accept = 'application/json') {
  const session = await getServerSession(authOptions);
  const reportSession = session as (typeof session & {
    accessToken?: string;
    user?: { role?: string };
  }) | null;
  const accessToken = reportSession?.accessToken;
  if (!accessToken || reportSession?.user?.role !== 'ADMIN') {
    return { error: 'Acceso restringido a administradores.' } as const;
  }

  const request = (token: string) => fetch(`${env.backendApiUrl}${path}`, {
    headers: { Authorization: `Bearer ${token}`, Accept: accept },
    cache: 'no-store',
  });
  let response = await request(accessToken);
  if (response.status === 401) {
    const refresh = await refreshAccessToken();
    if (!refresh.success || !refresh.data?.access_token) return { error: 'Sesión expirada.' } as const;
    response = await request(refresh.data.access_token);
  }
  if (!response.ok) return { error: `No se pudo obtener el reporte (HTTP ${response.status}).` } as const;
  return { response } as const;
}

function buildPath(reportId: ReportId, query: ReportQuery, suffix = '') {
  const params = new URLSearchParams();
  if (query.startDate) params.set('startDate', query.startDate);
  if (query.endDate) params.set('endDate', query.endDate);
  if (query.operationType) params.set('operationType', query.operationType);
  const search = params.toString();
  return `/analytics/reports/${reportId}${suffix}${search ? `?${search}` : ''}`;
}

export async function getAdminReport(reportId: ReportId, query: ReportQuery) {
  try {
    const result = await authenticatedRequest(buildPath(reportId, query));
    if ('error' in result) return { success: false as const, error: result.error };
    return { success: true as const, data: await result.response.json() as ReportResult };
  } catch (error) {
    console.error('[getAdminReport]', error);
    return { success: false as const, error: 'Error de conexión al cargar el reporte.' };
  }
}

export async function exportAdminReport(reportId: ReportId, query: ReportQuery) {
  try {
    const result = await authenticatedRequest(
      buildPath(reportId, query, '/excel'),
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    if ('error' in result) return { success: false as const, error: result.error };
    const filename = `reporte-${reportId}.xlsx`;
    const base64 = Buffer.from(await result.response.arrayBuffer()).toString('base64');
    return { success: true as const, filename, base64 };
  } catch (error) {
    console.error('[exportAdminReport]', error);
    return { success: false as const, error: 'Error de conexión al exportar el reporte.' };
  }
}