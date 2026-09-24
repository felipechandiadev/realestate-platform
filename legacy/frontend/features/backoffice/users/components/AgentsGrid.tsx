'use client';

import { useCallback, useMemo, useState } from 'react';
import DataGrid from '@/shared/components/ui/DataGrid/DataGrid';
import Dialog from '@/shared/components/ui/Dialog/Dialog';
import { Button } from '@/shared/components/ui/Button/Button';
import { TextField } from '@/shared/components/ui/TextField';
import { Badge } from '@/shared/components/ui/Badge/Badge';
import {
  useUsers,
  useDeleteUser,
} from '@/features/backoffice/users/hooks';
import type { User } from '@/features/backoffice/users/types';

interface AgentGridItem {
  id: string;
  email: string;
  name: string;

  role: string;
  status: string;
  createdAt: string;
}

interface AgentsGridProps {
  onEdit?: (user: User) => void;
  onRefresh?: () => void;
}

/**
 * Agents Grid Component
 *
 * Displays a paginated, sortable grid of agent users
 * Supports searching, filtering, edit and delete actions
 * Shows phone and brokerage information
 *
 * @param {AgentsGridProps} props - Component props
 * @returns {React.ReactNode} Grid component
 */
export function AgentsGrid({ onEdit, onRefresh }: AgentsGridProps) {
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Fetch users (filtered by agent role)
  const {
    data: usersResponse,
    isLoading,
    error,
    refetch,
  } = useUsers({
    page,
    limit,
    search: searchTerm,
    role: 'AGENT',
  });

  // Delete mutation
  const { mutate: deleteUser, isPending: isDeleting } = useDeleteUser();

  const users = usersResponse?.items || [];
  const totalRecords = usersResponse?.total || 0;
  const totalPages = Math.ceil(totalRecords / limit);

  // Map to grid format
  const gridItems: AgentGridItem[] = useMemo(
    () =>
      users.map((user) => ({
        id: user.id,
        email: user.email,
        name: `${user.firstName} ${user.lastName}`,
        role: getRoleLabel(user.role),
        status: user.status,
        createdAt: new Date(user.createdAt).toLocaleDateString('es-MX'),
      })),
    [users]
  );

  // Handle delete confirmation
  const handleConfirmDelete = useCallback(() => {
    if (!selectedUserId) return;

    deleteUser(selectedUserId);
    setOpenDeleteDialog(false);
    setSelectedUserId(null);
    refetch();
    onRefresh?.();
  }, [selectedUserId, deleteUser, refetch, onRefresh]);

  // Handle delete click
  const handleDeleteClick = useCallback((item: AgentGridItem) => {
    setSelectedUserId(item.id);
    setOpenDeleteDialog(true);
  }, []);

  // Handle edit click
  const handleEditClick = useCallback(
    (item: AgentGridItem) => {
      const user = users.find((u) => u.id === item.id) as any;
      if (user) {
        onEdit?.(user);
      }
    },
    [users, onEdit]
  );

  // Handle search
  const handleSearch = useCallback((value: string) => {
    setSearchTerm(value);
    setPage(1);
  }, []);

  // Handle page change
  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  return (
    <>
      <div className="space-y-4">
        {/* Search */}
        <div className="flex gap-4">
          <TextField
            placeholder="Buscar agentes..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="flex-1"
          />
        </div>

        {/* Grid */}
        <DataGrid
          columns={[
            {
              field: 'email',
              headerName: 'Email',
              width: 250,
              sortable: true,
            },
            {
              field: 'name',
              headerName: 'Nombre',
              width: 200,
              sortable: true,
            },
            {
              field: 'status',
              headerName: 'Estado',
              width: 150,
              sortable: true,
              renderCell: (item) => (
                <Badge variant={getStatusVariant(item.status)}>
                  {getStatusLabel(item.status)}
                </Badge>
              ),
            },
            {
              field: 'createdAt',
              headerName: 'Fecha Creación',
              width: 150,
              sortable: true,
            },
            {
              field: 'actions',
              headerName: 'Acciones',
              width: 200,
              renderCell: (item) => (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditClick(item)}
                  >
                    Editar
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteClick(item)}
                    disabled={isDeleting}
                  >
                    Eliminar
                  </Button>
                </div>
              ),
            },
          ]}
          rows={gridItems}
          loading={isLoading}
          limit={limit}
          totalRows={totalRecords}
          pagination={{
            page,
            pageSize: limit,
            rowCount: totalRecords,
            onPaginationModelChange: (model) => handlePageChange(model.page),
          }}
        />
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDeleteDialog}
        onOpenChange={setOpenDeleteDialog}
        title="Confirmar Eliminación"
        description="¿Está seguro que desea eliminar este agente? Esta acción no se puede deshacer."
      >
        <div className="flex gap-3 justify-end">
          <Button
            variant="outline"
            onClick={() => setOpenDeleteDialog(false)}
            disabled={isDeleting}
          >
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirmDelete}
            disabled={isDeleting}
          >
            {isDeleting ? 'Eliminando...' : 'Eliminar'}
          </Button>
        </div>
      </Dialog>
    </>
  );
}

/**
 * Get role label in Spanish
 */
function getRoleLabel(role: string): string {
  const labels: Record<string, string> = {
    ADMIN: 'Administrador',
    MANAGER: 'Gerente',
    AGENT: 'Agente',
    COMMUNITY: 'Comunidad',
    CUSTOMER: 'Cliente',
  };
  return labels[role] || role;
}

/**
 * Get status label in Spanish
 */
function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    ACTIVE: 'Activo',
    INACTIVE: 'Inactivo',
    SUSPENDED: 'Suspendido',
    PENDING_VERIFICATION: 'Pendiente',
  };
  return labels[status] || status;
}

/**
 * Get status badge variant
 */
function getStatusVariant(status: string): 'success' | 'warning' | 'error' | 'default' {
  const variants: Record<string, 'success' | 'warning' | 'error' | 'default'> = {
    ACTIVE: 'success',
    INACTIVE: 'default',
    SUSPENDED: 'error',
    PENDING_VERIFICATION: 'warning',
  };
  return variants[status] || 'default';
}
