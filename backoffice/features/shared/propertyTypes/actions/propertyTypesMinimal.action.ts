// Action para obtener tipos de propiedad minimalistas
'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { env } from '@/lib/env';

export interface PropertyTypeMinimal {
  id: string;
  name: string;
}

export async function getPropertyTypesMinimal(): Promise<PropertyTypeMinimal[]> {
  const session = await getServerSession(authOptions);

  if (!session?.accessToken) {
    throw new Error('No authenticated');
  }

  const response = await fetch(`${env.backendApiUrl}/property-types/minimal`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${session.accessToken}`,
      'Content-Type': 'application/json',
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch property types: ${response.status}`);
  }

  return response.json();
}