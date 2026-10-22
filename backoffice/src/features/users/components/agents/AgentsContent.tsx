'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAlert } from '@/providers/AlertContext';
import { Users } from 'lucide-react';
import { TextField, DataGrid, type DataGridColumn } from '@realestate/ui';
import { IconButton } from "@realestate/ui";
import { downloadExcelFile, readGridExportParams } from '@/shared/lib/data-grid-export';
import { exportGridExcel } from '@/shared/lib/fetch-grid-excel';
import CreateAgentFormDialog from './CreateAgentFormDialog';
import UpdateAgentDialog from './UpdateAgentDialog';
import DeleteAgentDialog from './DeleteAgentDialog';
import type { AgentType } from './types';
import { useUserManagementPermissions } from '../../hooks/useUserManagementPermissions';

interface AgentsContentProps {
  initialAgents: AgentType[];
  initialSearch?: string;
  totalRows?: number;
}

function agentColumns(
  onEdit: (agent: AgentType) => void,
  onDelete: (agent: AgentType) => void,
  canManageUsers: boolean,
): DataGridColumn[] {
  const columns: DataGridColumn[] = [
    { field: 'email', headerName: 'Email', flex: 1.2, minWidth: 200, sortable: true, filterable: true },
    {
      field: 'name',
      headerName: 'Nombre',
      flex: 1,
      minWidth: 160,
      sortable: true,
      filterable: true,
      renderCell: ({ row }) => {
        const first = row.personalInfo?.firstName || '';
        const last = row.personalInfo?.lastName || '';
        return `${first} ${last}`.trim() || row.username || row.email;
      },
    },
    { field: 'status', headerName: 'Estado', width: 140, sortable: true, filterable: true },
    { field: 'createdAt', headerName: 'Fecha creación', width: 180, sortable: true, filterable: true },
  ];
  // Editar / eliminar otros usuarios: solo ADMIN (core responde 403 al resto).
  if (!canManageUsers) return columns;
  return [
    ...columns,
    {
      field: 'actions',
      headerName: '',
      width: 160,
      sortable: false,
      filterable: false,
      renderCell: ({ row }) => (
        <div className="flex gap-2">
          <button type="button" className="text-sm text-primary" onClick={() => onEdit(row)}>Editar</button>
          <button type="button" className="text-sm text-red-600" onClick={() => onDelete(row)}>Eliminar</button>
        </div>
      ),
    },
  ];
}

/**
 * Agents Content Component
 *
 * Main container for agents management
 * Follows Card Listing Content (CLC Pattern) from Design System
 * 
 * @param initialAgents - Pre-loaded agents from Server Component
 * @param initialSearch - Initial search query from URL
 * @returns {React.ReactNode} Agents management interface
 */
export function AgentsContent({ 
  initialAgents, 
  initialSearch = '',
  totalRows,
}: AgentsContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { canManageUsers } = useUserManagementPermissions();
  
  // Safely get alert context
  let alert: any = { success: () => {}, error: () => {}, info: () => {}, warning: () => {} };
  try {
    alert = useAlert();
  } catch (error) {
    // Alert context not available yet, use no-op functions
    console.warn('Alert context not available:', error);
  }

  const [search, setSearch] = useState(initialSearch);
  const [agents, setAgents] = useState<AgentType[]>(initialAgents);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<AgentType | null>(null);

  useEffect(() => {
    setSearch(searchParams.get('search') || '');
  }, [searchParams]);

  // Sincronizar con initialAgents cuando cambian (después de refresh)
  useEffect(() => {
    setAgents(initialAgents);
  }, [initialAgents]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = e.target.value;
    setSearch(value);

    const params = new URLSearchParams();
    if (value.trim()) {
      params.set('search', value);
    }

    router.replace(params.toString() ? `?${params.toString()}` : '?');
  };

  const handleAddAgent = () => {
    setIsCreateDialogOpen(true);
  };

  const handleCreateSuccess = () => {
    setIsCreateDialogOpen(false);
    router.refresh();
    alert.success('Agente creado exitosamente');
  };

  const handleCreateCancel = () => {
    setIsCreateDialogOpen(false);
  };

  const handleEditAgent = (agent: AgentType) => {
    setSelectedAgent(agent);
    setIsEditDialogOpen(true);
  };

  const handleEditSuccess = () => {
    setIsEditDialogOpen(false);
    setSelectedAgent(null);
    router.refresh();
    alert.success('Agente actualizado exitosamente');
  };

  const handleEditCancel = () => {
    setIsEditDialogOpen(false);
    setSelectedAgent(null);
  };

  const handleDeleteAgent = (agent: AgentType) => {
    setSelectedAgent(agent);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteSuccess = () => {
    setIsDeleteDialogOpen(false);
    setSelectedAgent(null);
    router.refresh();
    alert.success('Agente eliminado exitosamente');
  };

  const handleDeleteCancel = () => {
    setIsDeleteDialogOpen(false);
    setSelectedAgent(null);
  };

  const getDisplayName = (agent: AgentType): string => {
    const firstName = agent.personalInfo?.firstName?.trim() ?? '';
    const lastName = agent.personalInfo?.lastName?.trim() ?? '';
    const combined = `${firstName} ${lastName}`.trim();

    if (combined) return combined;
    if (agent.username) return agent.username;
    return agent.email;
  };

  const filteredAgents = agents.filter((agent) => {
    const searchLower = search.toLowerCase();
    const displayName = getDisplayName(agent).toLowerCase();
    const username = agent.username.toLowerCase();
    const email = agent.email.toLowerCase();
    const phone = agent.personalInfo?.phone?.toLowerCase() ?? '';

    return (
      displayName.includes(searchLower) ||
      username.includes(searchLower) ||
      email.includes(searchLower) ||
      phone.includes(searchLower)
    );
  });

  return (
    <>
      <div className="space-y-6 w-full">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Agentes</h1>
            <p className="text-muted-foreground mt-1">
              Gestiona el equipo de agentes inmobiliarios
            </p>
          </div>
          <IconButton
            aria-label="Agregar agente"
            variant="text"
            onClick={handleAddAgent}
            icon="add"
            size={'lg'}
          />
        </div>

        {/* Search */}
        <div className="flex-1 min-w-0 max-w-xs sm:max-w-sm">
          <TextField
            label="Buscar agentes"
            value={search}
            onChange={handleSearchChange}
            startIcon="search"
            placeholder="Buscar por nombre, usuario, email o teléfono..."
          />
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="bg-background rounded-lg border border-border shadow-sm overflow-hidden"
              >
                <div className="p-6 space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="h-24 w-24 bg-neutral animate-pulse rounded-full" />
                    <div className="flex-1 space-y-2">
                      <div className="h-5 bg-neutral animate-pulse rounded" />
                      <div className="h-4 bg-neutral animate-pulse rounded w-3/4" />
                      <div className="h-4 bg-neutral animate-pulse rounded w-1/2" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredAgents.length === 0 ? (
          <div className="text-center py-12 text-muted">
            <Users size={64} className="text-muted-foreground mb-4 block" />
            <p className="text-lg font-medium mb-2 text-foreground">
              {search
                ? `No se encontraron agentes para "${search}"`
                : 'No hay agentes para mostrar.'}
            </p>
            {search && (
              <p className="text-sm">
                Intenta con otros términos de búsqueda o crea un nuevo agente.
              </p>
            )}
          </div>
        ) : (
          <DataGrid
            columns={agentColumns(handleEditAgent, handleDeleteAgent, canManageUsers)}
            rows={filteredAgents}
            totalRows={totalRows ?? filteredAgents.length}
            showSearch={false}
            fillViewport
            onExportExcel={async () => {
              const params = readGridExportParams(searchParams);
              const result = await exportGridExcel(
                'agents',
                {
                  sort: params.sort,
                  sortField: params.sortField,
                  search: params.search || search,
                  filters: params.filters,
                  filtration: params.filtration ? 'true' : undefined,
                  pagination: 'false',
                },
                'agentes.xlsx',
              );
              if (!('base64' in result)) {
                alert.showAlert?.({ message: result.error || 'Error al exportar', type: 'error' });
                return;
              }
              await downloadExcelFile(result.filename, result.base64);
              alert.showAlert?.({ message: 'Exportado a Excel', type: 'success', duration: 3000 });
            }}
          />
        )}
      </div>

      {/* Dialogs */}
      <CreateAgentFormDialog
        open={isCreateDialogOpen}
        onClose={handleCreateCancel}
        onSuccess={handleCreateSuccess}
      />

      <UpdateAgentDialog
        open={isEditDialogOpen}
        onClose={handleEditCancel}
        agent={selectedAgent}
        onSuccess={handleEditSuccess}
      />

      <DeleteAgentDialog
        open={isDeleteDialogOpen}
        onClose={handleDeleteCancel}
        agent={selectedAgent}
        onSuccess={handleDeleteSuccess}
      />
    </>
  );
}
