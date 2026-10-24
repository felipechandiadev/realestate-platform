'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { env } from '@/lib/env';
import { revalidatePath } from 'next/cache';

export interface TeamMember {
  id: string;
  name: string;
  position: string;
  bio?: string;
  mail?: string;
  phone?: string;
  multimediaUrl?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export async function getPublicTeamMembers(
  search?: string,
): Promise<ApiResponse<TeamMember[]>> {
  try {
    const url = new URL(`${env.backendApiUrl}/team-members`);
    if (search) {
      url.searchParams.append('search', search);
    }

    const res = await fetch(url.toString());

    if (!res.ok) {
      throw new Error(`API error: ${res.statusText}`);
    }

    const data = await res.json();

    return {
      success: true,
      data: Array.isArray(data) ? data : data.data,
    };
  } catch (error) {
    console.error('Error fetching public team members:', error);
    return {
      success: false,
      error: 'Error al obtener miembros del equipo',
    };
  }
}
