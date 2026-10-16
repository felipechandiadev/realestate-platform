'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { env } from '@/lib/env';
import { refreshAccessToken } from '@/features/shared/auth/actions/auth.action';

const EXCEL_PATHS = {
  'properties-sale': '/properties/grid-sale/excel',
  'properties-rent': '/properties/grid-rent/excel',
  contracts: '/contracts/excel',
  persons: '/people/excel',
  documents: '/document/excel',
  administrators: '/users/admins/excel',
  agents: '/users/agents/excel',
  community: '/users/grid/community/excel',
} as const;

export type GridExcelTarget = keyof typeof EXCEL_PATHS;

const ALLOWED_QUERY_KEYS = [
  'sort',
  'sortField',
  'search',
  'filters',
  'filtration',
  'pagination',
  'status',
  'operation',
] as const;

export async function exportGridExcel(
  target: GridExcelTarget,
  params: Record<string, string | undefined> = {},
  fallbackFilename = 'export.xlsx',
): Promise<{ filename: string; base64: string } | { success: false; error: string }> {
  const session = await getServerSession(authOptions);
  const accessToken = session?.accessToken;
  if (!accessToken) {
    return { success: false, error: 'No hay una sesión activa.' };
  }

  const url = new URL(`${env.backendApiUrl}${EXCEL_PATHS[target]}`);
  for (const key of ALLOWED_QUERY_KEYS) {
    const value = params[key];
    if (typeof value === 'string' && value !== '') {
      url.searchParams.set(key, value);
    }
  }
  if (!url.searchParams.has('pagination')) {
    url.searchParams.set('pagination', 'false');
  }

  const load = async (token: string) =>
    fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      },
      cache: 'no-store',
    });

  let response = await load(accessToken);
  if (response.status === 401) {
    const refresh = await refreshAccessToken();
    if (refresh.success && refresh.data?.access_token) {
      response = await load(refresh.data.access_token);
    } else {
      return { success: false, error: 'No autorizado' };
    }
  }

  if (!response.ok) {
    return { success: false, error: `HTTP ${response.status}` };
  }

  const buffer = await response.arrayBuffer();
  const base64 = Buffer.from(buffer).toString('base64');
  const contentDisposition = response.headers.get('content-disposition') || fallbackFilename;
  const filenameMatch = contentDisposition.match(/filename="?([^";]+)"?/);
  const filename = filenameMatch ? filenameMatch[1] : fallbackFilename;
  return { filename, base64 };
}
