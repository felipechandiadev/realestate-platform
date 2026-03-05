'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAlert } from '@/providers/AlertContext';
import { TextField } from '@/shared/components/ui/TextField/TextField';
import IconButton from '@/shared/components/ui/IconButton/IconButton';
import AgentCard from './AgentCard';
import CreateAgentFormDialog from './CreateAgentFormDialog';
import UpdateAgentDialog from './UpdateAgentDialog';
import DeleteAgentDialog from './DeleteAgentDialog';
import type { AgentType } from './types';

interface AgentsContentProps {
  initialAgents: AgentType[];
  initialSearch?: string;
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
  initialSearch = '' 
}: AgentsContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const alert = useAlert();

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
            <span className="material-symbols-outlined text-6xl mb-4 block">
              groups
            </span>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
            {filteredAgents.map((agent) => (
              <AgentCard
                key={agent.id}
                agent={agent}
                onEdit={handleEditAgent}
                onDelete={handleDeleteAgent}
              />
            ))}
          </div>
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
