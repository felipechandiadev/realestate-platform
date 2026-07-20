'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { env } from '@/lib/env';

export interface AuditLogEntry {
  id: string;
  userId: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  action: string;
  entityType: string;
  entityId: string | null;
  description: string;
  metadata?: Record<string, unknown> | null;
  oldValues?: Record<string, unknown> | null;
  newValues?: Record<string, unknown> | null;
  success: boolean;
  errorMessage?: string | null;
  source: 'USER' | 'UI_AUTO' | 'SYSTEM' | 'API';
  createdAt: string;
}

/**
 * Get audit logs for a specific contract
 */
export async function getContractAuditLogs(
  contractId: string
): Promise<{
  success: boolean;
  data?: AuditLogEntry[];
  error?: string;
}> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.accessToken) {
      return { success: false, error: 'No autenticado' };
    }

    const response = await fetch(
      `${env.backendApiUrl}/audit/logs/entity/CONTRACT/${contractId}?limit=100`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: errorData.message || `Error al obtener historial: ${response.status}`,
      };
    }

    const logs = await response.json();
    return { success: true, data: logs };
  } catch (error) {
    console.error('Error fetching contract audit logs:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido al obtener historial',
    };
  }
}


