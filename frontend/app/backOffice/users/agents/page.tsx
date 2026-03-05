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
 * - Renderiza AgentsContent con datos pre-cargados
 * - Suspense boundary automático con loading.tsx
 * 
 * Audiencia: Administradores, Gerentes de ventas, Directores
 */

import { listAgents } from '@/features/backoffice/users/actions/agents.action';
import { AgentsContent, type AgentType, type AgentStatus } from '@/features/backoffice/users/components/agents';

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function AgentsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const search = typeof params.search === 'string' ? params.search : undefined;

  const response = await listAgents({ search });

  if (!response.success || !response.data) {
    return (
      <div className="text-center py-12 text-muted">
        <span className="material-symbols-outlined text-6xl mb-4 block">
          error_outline
        </span>
        <p className="text-lg font-medium mb-2 text-foreground">
          Error al cargar la lista de agentes
        </p>
        <p className="text-sm">
          Por favor, intenta recargar la página.
        </p>
      </div>
    );
  }

  const agents: AgentType[] = response.data.data.map((agent) => {
    const validStatuses: AgentStatus[] = ['ACTIVE', 'INACTIVE', 'VACATION', 'LEAVE'];
    const status: AgentStatus = validStatuses.includes(agent.status as AgentStatus)
      ? (agent.status as AgentStatus)
      : 'INACTIVE';

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
    };
  });

  return <AgentsContent initialAgents={agents} initialSearch={search} />;
}
