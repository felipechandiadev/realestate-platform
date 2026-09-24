import Select from '@/shared/components/ui/Select/Select';

interface AgentOption {
  id: string;
  displayName?: string;
  firstName?: string;
  lastName?: string;
}

interface ContractGeneralSectionProps {
  contract: any;
  agents: AgentOption[];
  updating: boolean;
  loadingAgents: boolean;
  onStatusChange: (status: string) => void;
  onAgentChange: (agentId: string) => void;
  statusLocked?: boolean;
}

const statusOptions = [
  { id: 'IN_PROCESS', label: 'En Proceso' },
  { id: 'CLOSED', label: 'Cerrado' },
  { id: 'FAILED', label: 'Fallido' },
];

export default function ContractGeneralSection({
  contract,
  agents,
  updating,
  loadingAgents,
  onStatusChange,
  onAgentChange,
  statusLocked = false,
}: ContractGeneralSectionProps) {
  return (
    <div className="space-y-4 max-w-4xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Código
          </label>
          <p className="text-base font-mono font-medium text-foreground">{contract.code}</p>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Estado del Contrato
          </label>
          <Select
            options={statusOptions}
            value={contract.status}
            onChange={(id) => id && onStatusChange(id as string)}
            disabled={updating || statusLocked}
            allowClear={false}
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Tipo de Operación
          </label>
          <p className="text-base text-foreground">{contract.operation}</p>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Agente Asignado
          </label>
          <Select
            options={agents.map((agent) => ({
              id: agent.id,
              label: agent.displayName || `${agent.firstName ?? ''} ${agent.lastName ?? ''}`.trim(),
            }))}
            value={contract.user?.id || null}
            onChange={(id) => id && onAgentChange(id as string)}
            placeholder="Seleccionar agente..."
            disabled={updating || loadingAgents}
            allowClear={false}
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Fecha de Creación
          </label>
          <p className="text-base text-foreground">
            {new Date(contract.createdAt).toLocaleDateString('es-CL')}
          </p>
        </div>

        {contract.endDate && (
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Fecha de Finalización
            </label>
            <p className="text-base text-foreground">
              {new Date(contract.endDate).toLocaleDateString('es-CL')}
            </p>
          </div>
        )}
      </div>

      {contract.description && (
        <div className="space-y-1 col-span-2">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Descripción
          </label>
          <p className="text-base text-foreground whitespace-pre-wrap">{contract.description}</p>
        </div>
      )}
    </div>
  );
}
