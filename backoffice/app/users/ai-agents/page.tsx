/**
 * Agentes de IA (solo ADMIN): crear y revocar las keys con que Grok, Claude u otros
 * agentes se conectan al servidor MCP para gestionar propiedades.
 */
import { getMcpUrl, listAgentKeys } from '@/features/agent-keys/actions/agent-keys.action';
import { AgentKeysContent } from '@/features/agent-keys/components/AgentKeysContent';

export const dynamic = 'force-dynamic';

export default async function AiAgentsPage() {
  const [response, mcpUrl] = await Promise.all([listAgentKeys(), getMcpUrl()]);

  if (!response.success) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p className="text-lg font-medium mb-2 text-foreground">No se pudieron cargar los agentes de IA</p>
        <p className="text-sm">{response.error}</p>
      </div>
    );
  }

  return <AgentKeysContent initialKeys={response.data} mcpUrl={mcpUrl} />;
}
