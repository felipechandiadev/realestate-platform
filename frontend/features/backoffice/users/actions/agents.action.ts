'use server'

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { env } from '@/lib/env'
import { revalidatePath } from 'next/cache'

export interface ListAgentsResponse {
  data: any[]
  total: number
  page: number
  limit: number
}

export async function listAgents(params: {
  search?: string
  page?: number
  limit?: number
} = {}): Promise<{
  success: boolean
  data?: ListAgentsResponse
  error?: string
}> {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.accessToken) {
      return { success: false, error: 'No autenticado' }
    }

    const searchParams = new URLSearchParams()
    if (params.search) searchParams.set('search', params.search)
    if (params.page) searchParams.set('page', params.page.toString())
    if (params.limit) searchParams.set('limit', params.limit.toString())

    const url = `${env.backendApiUrl}/users/agents?${searchParams.toString()}`

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => null)
      return {
        success: false,
        error: errorData?.message || `HTTP ${response.status}`,
      }
    }

    const data = await response.json()
    return { success: true, data }
  } catch (error) {
    console.error('Error listing agents:', error)
    return { success: false, error: 'Error al cargar agentes' }
  }
}

export async function createAgent(data: {
  username: string
  email: string
  password: string
  firstName: string
  lastName: string
  phone?: string
  avatarFile?: File
}): Promise<{
  success: boolean
  data?: any
  error?: string
  message?: string
}> {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.accessToken) {
      return { success: false, error: 'No autenticado' }
    }

    let avatarUrl: string | undefined = undefined

    // Subir avatar si existe
    if (data.avatarFile && data.avatarFile.size > 0) {
      const uploadFormData = new FormData()
      uploadFormData.append('file', data.avatarFile)
      uploadFormData.append('path', 'public/users')
      uploadFormData.append('type', 'AGENT_IMG')

      const uploadRes = await fetch(`${env.backendApiUrl}/multimedia/upload`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
        body: uploadFormData,
      })

      if (!uploadRes.ok) {
        return { success: false, error: 'Error al subir avatar' }
      }

      const uploadData = await uploadRes.json()
      avatarUrl = uploadData.url || uploadData.path
    }

    // Crear usuario con role AGENT
    const createData = {
      username: data.username.trim(),
      email: data.email.trim().toLowerCase(),
      password: data.password,
      role: 'AGENT',
      personalInfo: {
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        phone: data.phone?.trim(),
        avatarUrl,
      },
    }

    const response = await fetch(`${env.backendApiUrl}/users`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(createData),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => null)
      const errorMsg = errorData?.message || `Error ${response.status}`

      if (response.status === 409 || errorMsg.includes('unique')) {
        return { success: false, error: 'Username o email ya existe' }
      }

      return { success: false, error: errorMsg }
    }

    const user = await response.json()
    revalidatePath('/backOffice/users/agents', 'page')

    return {
      success: true,
      data: user,
      message: 'Agente creado exitosamente',
    }
  } catch (error) {
    console.error('Error creating agent:', error)
    return { success: false, error: 'Error al crear agente' }
  }
}

export async function updateAgent(
  id: string,
  data: {
    firstName?: string
    lastName?: string
    phone?: string
    email?: string
    status?: string
    avatarFile?: File
  }
): Promise<{
  success: boolean
  data?: any
  error?: string
  message?: string
}> {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.accessToken) {
      return { success: false, error: 'No autenticado' }
    }

    let avatarUrl: string | undefined = undefined

    // Subir avatar si existe
    if (data.avatarFile && data.avatarFile.size > 0) {
      const uploadFormData = new FormData()
      uploadFormData.append('file', data.avatarFile)
      uploadFormData.append('path', 'public/users')
      uploadFormData.append('type', 'AGENT_IMG')

      const uploadRes = await fetch(`${env.backendApiUrl}/multimedia/upload`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
        body: uploadFormData,
      })

      if (!uploadRes.ok) {
        return { success: false, error: 'Error al subir avatar' }
      }

      const uploadData = await uploadRes.json()
      avatarUrl = uploadData.url || uploadData.path
    }

    // Preparar datos a actualizar
    const updateData: any = {}
    // Datos personales
    updateData.personalInfo = {}
    if (data.firstName) updateData.personalInfo.firstName = data.firstName
    if (data.lastName) updateData.personalInfo.lastName = data.lastName
    if (data.phone) updateData.personalInfo.phone = data.phone
    if (avatarUrl) updateData.personalInfo.avatarUrl = avatarUrl
    // Email puede ir fuera de personalInfo si el backend lo espera así
    if (data.email) updateData.email = data.email

    // Actualizar agente
    const response = await fetch(`${env.backendApiUrl}/users/${id}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => null)
      return { success: false, error: errorData?.message || 'Error al actualizar' }
    }

    const user = await response.json()

    // Cambiar estado si es necesario
    if (data.status && data.status !== 'ACTIVE') {
      await fetch(`${env.backendApiUrl}/users/${id}/status`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: data.status }),
      })
    }

    revalidatePath('/backOffice/users/agents', 'page')

    return {
      success: true,
      data: user,
      message: 'Agente actualizado exitosamente',
    }
  } catch (error) {
    console.error('Error updating agent:', error)
    return { success: false, error: 'Error al actualizar agente' }
  }
}

export async function deleteAgent(id: string): Promise<{
  success: boolean
  error?: string
  message?: string
}> {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.accessToken) {
      return { success: false, error: 'No autenticado' }
    }

    const response = await fetch(`${env.backendApiUrl}/users/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => null)
      return { success: false, error: errorData?.message || 'Error al eliminar' }
    }

    revalidatePath('/backOffice/users/agents', 'page')

    return {
      success: true,
      message: 'Agente eliminado exitosamente',
    }
  } catch (error) {
    console.error('Error deleting agent:', error)
    return { success: false, error: 'Error al eliminar agente' }
  }
}

export async function setAgentStatus(id: string, status: 'ACTIVE' | 'INACTIVE' | 'VACATION' | 'LEAVE'): Promise<{
  success: boolean
  error?: string
  message?: string
}> {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.accessToken) {
      return { success: false, error: 'No autenticado' }
    }

    const response = await fetch(`${env.backendApiUrl}/users/${id}/status`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => null)
      return { success: false, error: errorData?.message || 'Error al actualizar estado' }
    }

    revalidatePath('/backOffice/users/agents', 'page')

    return {
      success: true,
      message: 'Estado actualizado exitosamente',
    }
  } catch (error) {
    console.error('Error updating agent status:', error)
    return { success: false, error: 'Error al actualizar estado' }
  }
}
