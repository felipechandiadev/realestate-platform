'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/shared/components/ui/Button/Button';
import { AgentsGrid } from './AgentsGrid';
import { AgentDialog } from './AgentDialog';
import type { User } from '@/features/backoffice/users/types';

/**
 * Agents Content Component
 *
 * Main container component for agents management
 * Combines AgentsGrid and AgentDialog
 * Handles state coordination between create/edit and grid
 *
 * @returns {React.ReactNode} Content component
 */
export function AgentsContent() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<User | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  /**
   * Handle create click
   */
  const handleCreateClick = useCallback(() => {
    setSelectedAgent(null);
    setDialogOpen(true);
  }, []);

  /**
   * Handle edit click
   */
  const handleEditClick = useCallback((agent: User) => {
    setSelectedAgent(agent);
    setDialogOpen(true);
  }, []);

  /**
   * Handle dialog success
   */
  const handleDialogSuccess = useCallback(() => {
    setRefreshKey((prev) => prev + 1);
  }, []);

  /**
   * Handle grid refresh
   */
  const handleRefresh = useCallback(() => {
    setRefreshKey((prev) => prev + 1);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Gestión de Agentes
          </h1>
          <p className="text-gray-600 mt-1">
            Administre agentes inmobiliarios del sistema
          </p>
        </div>
        <Button onClick={handleCreateClick}>
          Crear Agente
        </Button>
      </div>

      {/* Grid */}
      <AgentsGrid
        key={refreshKey}
        onEdit={handleEditClick}
        onRefresh={handleRefresh}
      />

      {/* Dialog */}
      <AgentDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        agent={selectedAgent}
        onSuccess={handleDialogSuccess}
      />
    </div>
  );
}
