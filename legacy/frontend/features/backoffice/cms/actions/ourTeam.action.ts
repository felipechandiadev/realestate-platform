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

export async function getTeamMembers(
  search?: string,
): Promise<ApiResponse<TeamMember[]>> {
  try {
    const session = await getServerSession(authOptions);
    const accessToken = (session as any)?.accessToken;
    if (!accessToken) {
      return {
        success: false,
        error: 'No autorizado',
      };
    }

    const url = new URL(`${env.backendApiUrl}/team-members`);
    if (search) {
      url.searchParams.append('search', search);
    }

    const res = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!res.ok) {
      throw new Error(`API error: ${res.statusText}`);
    }

    const data = await res.json();

    return {
      success: true,
      data: Array.isArray(data) ? data : data.data,
    };
  } catch (error) {
    console.error('Error fetching team members:', error);
    return {
      success: false,
      error: 'Error al obtener miembros del equipo',
    };
  }
}

export async function createTeamMember(
  formData: FormData,
): Promise<ApiResponse<TeamMember>> {
  try {
    const session = await getServerSession(authOptions);
    const accessToken = (session as any)?.accessToken;
    if (!accessToken) {
      return {
        success: false,
        error: 'No autorizado',
      };
    }

    const res = await fetch(`${env.backendApiUrl}/team-members`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: formData,
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || 'Error al crear miembro');
    }

    const data = await res.json();

    revalidatePath('/backOffice/cms/ourTeam');

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error('Error creating team member:', error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Error al crear miembro',
    };
  }
}

export async function updateTeamMember(
  id: string,
  formData: FormData,
): Promise<ApiResponse<TeamMember>> {
  try {
    const session = await getServerSession(authOptions);
    const accessToken = (session as any)?.accessToken;
    if (!accessToken) {
      return {
        success: false,
        error: 'No autorizado',
      };
    }

    const res = await fetch(`${env.backendApiUrl}/team-members/${id}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: formData,
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || 'Error al actualizar miembro');
    }

    const data = await res.json();

    revalidatePath('/backOffice/cms/ourTeam');

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error('Error updating team member:', error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Error al actualizar miembro',
    };
  }
}

export async function deleteTeamMember(
  id: string,
): Promise<ApiResponse<void>> {
  try {
    const session = await getServerSession(authOptions);
    const accessToken = (session as any)?.accessToken;
    if (!accessToken) {
      return {
        success: false,
        error: 'No autorizado',
      };
    }

    const res = await fetch(`${env.backendApiUrl}/team-members/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || 'Error al eliminar miembro');
    }

    revalidatePath('/backOffice/cms/ourTeam');

    return {
      success: true,
    };
  } catch (error) {
    console.error('Error deleting team member:', error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Error al eliminar miembro',
    };
  }
}
