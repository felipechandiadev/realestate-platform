import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { env } from '@/lib/env';

/**
 * Fetch comunas filtered by region from the backend.
 * @param region - The region to filter comunas by.
 * @returns A promise resolving to an array of comunas.
 */
export async function getComunasByRegion(region: string): Promise<Array<{ id: string; label: string; stateId?: string }>> {
  try {
    const session = await getServerSession(authOptions);
    const accessToken = session?.accessToken;

    if (!accessToken) {
      throw new Error('No hay una sesión activa para consultar comunas.');
    }

    const response = await fetch(`${env.backendApiUrl}/config/comunas?region=${encodeURIComponent(region)}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || `Error ${response.status} al obtener comunas.`);
    }

    const data = await response.json();
    return data.map((comuna: any) => ({
      id: comuna.id || comuna.name || comuna.value,
      label: comuna.name || comuna.label || comuna.value,
      stateId: comuna.stateId, // Incluir el stateId retornado por el backend
    }));
  } catch (error) {
    console.error('Error fetching comunas by region:', error);
    throw error;
  }
}