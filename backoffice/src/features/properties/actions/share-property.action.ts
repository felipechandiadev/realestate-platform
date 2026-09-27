'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { env } from '@/lib/env';
import { redirect } from 'next/navigation';

function readErrorMessage(payload: { message?: string | string[] } | null, fallback: string): string {
  if (!payload?.message) return fallback;
  return Array.isArray(payload.message) ? payload.message.join('. ') : payload.message;
}

export async function sharePropertyByEmail(
  propertyId: string,
  to: string,
  note?: string,
): Promise<{ success: boolean; error?: string }> {
  const session = await getServerSession(authOptions);
  if (!session?.accessToken) {
    return { success: false, error: 'No hay una sesión activa' };
  }

  const response = await fetch(`${env.backendApiUrl}/properties/${propertyId}/share`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${session.accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      to: to.trim(),
      note: note?.trim() || undefined,
    }),
  });

  if (response.status === 401) {
    redirect('/');
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    return {
      success: false,
      error: readErrorMessage(errorData, 'No se pudo enviar el correo'),
    };
  }

  return { success: true };
}
