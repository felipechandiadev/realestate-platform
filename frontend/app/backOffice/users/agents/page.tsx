/**
 * Agents Management Page
 * 
 * Propósito:
 * - Gestionar equipo de agentes inmobiliarios
 * - Visualizar perfil de agentes (nombre, email, teléfono, comisiones)
 * - Búsqueda y filtrado de agentes
 * - Estadísticas de desempeño por agente
 * - Acciones: crear, editar, desactivar agentes
 * 
 * Funcionalidad:
 * - Server component: recibe searchParams (search)
 * - Fetcha listado de agentes desde listAgents action
 * - Renderiza AgentList con datos y búsqueda
 * - Validación de respuesta y manejo de errores
 * 
 * Audiencia: Administradores, Gerentes de ventas, Directores
 */

import { listAgents } from '@/features/backoffice/users/actions/agents.action'
import AgentList from './ui/AgentList'
import type { AgentType, AgentStatus } from './ui/types'

type AgentsPageSearchParams = {
  search?: string | string[]
}

export default async function AgentsPage({
  searchParams,
}: {
  searchParams?: Promise<AgentsPageSearchParams>
}) {
  const params = searchParams ? await searchParams : undefined

  const search = typeof params?.search === 'string' ? params.search : Array.isArray(params?.search) ? (params?.search[0] || '') : ''
  const response = await listAgents({ search })

  if (!response.success || !response.data) {
    return <div>Error al cargar la lista de agentes.</div>
  }

  const agents = response.data.data.map((agent) => {
    const validStatuses: AgentStatus[] = ['ACTIVE', 'INACTIVE', 'VACATION', 'LEAVE']
    const status: AgentStatus = validStatuses.includes(agent.status as AgentStatus)
      ? (agent.status as AgentStatus)
      : 'INACTIVE'

    return {
      id: agent.id,
      username: agent.username,
      email: agent.email,
      status,
      role: 'AGENT' as const,
      permissions: agent.permissions || [],
      personalInfo: {
        firstName: agent.personalInfo?.firstName || '',
        lastName: agent.personalInfo?.lastName || '',
        phone: agent.personalInfo?.phone || '',
        avatarUrl: agent.personalInfo?.avatarUrl || null,
      },
      createdAt: agent.createdAt || new Date().toISOString(),
      updatedAt: agent.updatedAt || new Date().toISOString(),
      deletedAt: agent.deletedAt || null,
      lastLogin: agent.lastLogin || new Date().toISOString(),
    }
  })

  return (
    <div className="p-4">
      <AgentList initialAgents={agents} />
    </div>
  )
}
