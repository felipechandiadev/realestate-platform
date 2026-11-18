'use server'

import { revalidatePath } from 'next/cache'
import { userManagementDenial } from '@/features/users/actions/user-management.guard'
import { env } from '@/lib/env'
import {
  AgentKeysRequest,
  type AgentKeyDto,
  type AgentScope,
} from '../infrastructure/agent-keys.request'

type Result<T> = { success: true; data: T } | { success: false; error: string }

const PATH = '/users/ai-agents'

/** URL del servidor MCP que se le entrega al agente. */
export async function getMcpUrl(): Promise<string> {
  return `${env.backendApiUrl}/mcp`
}

export async function listAgentKeys(): Promise<Result<AgentKeyDto[]>> {
  const denial = await userManagementDenial()
  if (denial) return denial
  try {
    return { success: true, data: await AgentKeysRequest.list() }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Error al cargar los agentes' }
  }
}

export async function createAgentKey(input: {
  name: string
  scopes: AgentScope[]
  expiresAt?: string
}): Promise<Result<AgentKeyDto & { token: string }>> {
  const denial = await userManagementDenial()
  if (denial) return denial
  const name = input.name?.trim()
  if (!name) return { success: false, error: 'Escribe un nombre para el agente' }
  try {
    const data = await AgentKeysRequest.create({ ...input, name })
    revalidatePath(PATH)
    return { success: true, data }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'No se pudo crear el agente' }
  }
}

export async function revokeAgentKey(id: string): Promise<Result<AgentKeyDto>> {
  const denial = await userManagementDenial()
  if (denial) return denial
  try {
    const data = await AgentKeysRequest.revoke(id)
    revalidatePath(PATH)
    return { success: true, data }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'No se pudo revocar la key' }
  }
}
