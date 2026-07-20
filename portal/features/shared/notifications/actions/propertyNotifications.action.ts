'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { env } from '@/lib/env';

export async function notifyPropertyInterest({
  propertyId,
  assignedAgentId,
  name,
  email,
  message
}: {
  propertyId: string;
  assignedAgentId?: string;
  interestedUserId?: string;
  name: string;
  email: string;
  message: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    // Obtener sesión para el token de autenticación
    const session = await getServerSession(authOptions);
    const accessToken = session?.accessToken;

    if (!accessToken) {
      return { success: false, error: 'No autenticado' };
    }

    // Llamar al endpoint correcto del backend
    const response = await fetch(`${env.backendApiUrl}/notifications/property-interest`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        propertyId,
        assignedAgentId,
        interestedUserName: name,
        interestedUserEmail: email,
        interestedUserMessage: message,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: errorData.message || `Error ${response.status}: ${response.statusText}`
      };
    }

    const result = await response.json();
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}
