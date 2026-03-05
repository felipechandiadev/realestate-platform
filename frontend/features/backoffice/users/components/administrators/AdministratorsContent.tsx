'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAlert } from '@/providers/AlertContext';
import { TextField } from '@/shared/components/ui/TextField/TextField';
import IconButton from '@/shared/components/ui/IconButton/IconButton';
import AdminCard from './AdminCard';
import CreateAdminFormDialog from './CreateAdminFormDialog';
import UpdateAdminDialog from './UpdateAdminDialog';
import DeleteAdminDialog from './DeleteAdminDialog';
import type { AdministratorType } from './types';

interface AdministratorsContentProps {
  initialAdministrators: AdministratorType[];
  initialSearch?: string;
}

/**
 * Administrators Content Component
 *
 * Main container for administrators management
 * Follows Card Listing Content (CLC Pattern) from Design System
 * 
 * @param initialAdministrators - Pre-loaded administrators from Server Component
 * @param initialSearch - Initial search query from URL
 * @returns {React.ReactNode} Administrators management interface
 */
export function AdministratorsContent({ 
  initialAdministrators, 
  initialSearch = '' 
}: AdministratorsContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const alert = useAlert();

  const [search, setSearch] = useState(initialSearch);
  const [administrators, setAdministrators] = useState<AdministratorType[]>(initialAdministrators);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<AdministratorType | null>(null);

  useEffect(() => {
    setSearch(searchParams.get('search') || '');
  }, [searchParams]);

  // Sincronizar con initialAdministrators cuando cambian (después de refresh)
  useEffect(() => {
    setAdministrators(initialAdministrators);
  }, [initialAdministrators]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = e.target.value;
    setSearch(value);

    const params = new URLSearchParams();
    if (value.trim()) {
      params.set('search', value);
    }

    router.replace(params.toString() ? `?${params.toString()}` : '?');
  };

  const handleAddAdmin = () => {
    setIsCreateDialogOpen(true);
  };

  const handleCreateSuccess = () => {
    setIsCreateDialogOpen(false);
    router.refresh();
    alert.success('Administrador creado exitosamente');
  };

  const handleCreateCancel = () => {
    setIsCreateDialogOpen(false);
  };

  const handleEditAdmin = (admin: AdministratorType) => {
    setSelectedAdmin(admin);
    setIsEditDialogOpen(true);
  };

  const handleEditSuccess = () => {
    setIsEditDialogOpen(false);
    setSelectedAdmin(null);
    router.refresh();
    alert.success('Administrador actualizado exitosamente');
  };

  const handleEditCancel = () => {
    setIsEditDialogOpen(false);
    setSelectedAdmin(null);
  };

  const handleDeleteAdmin = (admin: AdministratorType) => {
    setSelectedAdmin(admin);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteSuccess = () => {
    setIsDeleteDialogOpen(false);
    setSelectedAdmin(null);
    router.refresh();
    alert.success('Administrador eliminado exitosamente');
  };

  const handleDeleteCancel = () => {
    setIsDeleteDialogOpen(false);
    setSelectedAdmin(null);
  };

  const getDisplayName = (admin: AdministratorType): string => {
    const firstName = admin.personalInfo?.firstName?.trim() ?? '';
    const lastName = admin.personalInfo?.lastName?.trim() ?? '';
    const combined = `${firstName} ${lastName}`.trim();

    if (combined) return combined;
    if (admin.username) return admin.username;
    return admin.email;
  };

  const filteredAdministrators = administrators.filter((admin) => {
    const searchLower = search.toLowerCase();
    const displayName = getDisplayName(admin).toLowerCase();
    const username = admin.username.toLowerCase();
    const email = admin.email.toLowerCase();

    return (
      displayName.includes(searchLower) ||
      username.includes(searchLower) ||
      email.includes(searchLower)
    );
  });

  return (
    <>
      <div className="space-y-6 w-full">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Administradores</h1>
            <p className="text-muted-foreground mt-1">
              Gestiona los usuarios administradores del sistema
            </p>
          </div>
          <IconButton
            aria-label="Agregar administrador"
            variant="text"
            onClick={handleAddAdmin}
            icon="add"
            size={'lg'}
          />
        </div>

        {/* Search */}
        <div className="flex-1 min-w-0 max-w-xs sm:max-w-sm">
          <TextField
            label="Buscar administradores"
            value={search}
            onChange={handleSearchChange}
            startIcon="search"
            placeholder="Buscar por nombre, usuario o email..."
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
        ) : filteredAdministrators.length === 0 ? (
          <div className="text-center py-12 text-muted">
            <span className="material-symbols-outlined text-6xl mb-4 block">
              admin_panel_settings
            </span>
            <p className="text-lg font-medium mb-2 text-foreground">
              {search
                ? `No se encontraron administradores para "${search}"`
                : 'No hay administradores para mostrar.'}
            </p>
            {search && (
              <p className="text-sm">
                Intenta con otros términos de búsqueda o crea un nuevo administrador.
              </p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
            {filteredAdministrators.map((admin) => (
              <AdminCard
                key={admin.id}
                admin={admin}
                onEdit={handleEditAdmin}
                onDelete={handleDeleteAdmin}
              />
            ))}
          </div>
        )}
      </div>

      {/* Dialogs */}
      <CreateAdminFormDialog
        open={isCreateDialogOpen}
        onClose={handleCreateCancel}
        onSuccess={handleCreateSuccess}
      />

      <UpdateAdminDialog
        open={isEditDialogOpen}
        onClose={handleEditCancel}
        administrator={selectedAdmin}
        onSave={handleEditSuccess}
      />

      <DeleteAdminDialog
        open={isDeleteDialogOpen}
        onClose={handleDeleteCancel}
        administrator={selectedAdmin}
        onSave={handleDeleteSuccess}
      />
    </>
  );
}
