'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/shared/components/ui/Button/Button';
import { AdministratorsGrid } from './AdministratorsGrid';
import { AdminUserDialog } from './AdminUserDialog';
import type { User } from '@/features/backoffice/users/types';

/**
 * Administrators Content Component
 *
 * Main container component for administrators management
 * Combines AdministratorsGrid and AdminUserDialog
 * Handles state coordination between create/edit and grid
 *
 * @returns {React.ReactNode} Content component
 */
export function AdministratorsContent() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  /**
   * Handle create click
   */
  const handleCreateClick = useCallback(() => {
    setSelectedUser(null);
    setDialogOpen(true);
  }, []);

  /**
   * Handle edit click
   */
  const handleEditClick = useCallback((user: User) => {
    setSelectedUser(user);
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
            Gestión de Administradores
          </h1>
          <p className="text-gray-600 mt-1">
            Administre usuarios con permisos de administración
          </p>
        </div>
        <Button onClick={handleCreateClick}>
          Crear Administrador
        </Button>
      </div>

      {/* Grid */}
      <AdministratorsGrid
        key={refreshKey}
        onEdit={handleEditClick}
        onRefresh={handleRefresh}
      />

      {/* Dialog */}
      <AdminUserDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        user={selectedUser}
        onSuccess={handleDialogSuccess}
      />
    </div>
  );
}
