'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import DataGrid, { type DataGridColumn } from '@/shared/components/ui/DataGrid/DataGrid';
import type { CommunityUserGridRow } from '@/features/backoffice/users/actions/users.action';
import { useAlert } from '@/providers/AlertContext';
import DeleteCommunityUserButton from './DeleteCommunityUserButton';

type CommunityUsersDataGridProps = {
  rows: CommunityUserGridRow[];
  totalRows?: number;
  title?: string;
};

// Maps backend field names to expected format
function mapRow(row: any) {
  return {
    id: row.id,
    username: row.username,
    email: row.email,
    firstName: row.firstName || '',
    lastName: row.lastName || '',
    status: row.status,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export default function CommunityUsersDataGrid({ rows, totalRows, title }: CommunityUsersDataGridProps) {
  const alert = useAlert();
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const handleDeleteSuccess = () => {
    setIsDeleting(null);
    router.refresh();
  };

  const columns: DataGridColumn[] = [
    { field: 'username', headerName: 'Usuario', flex: 1.2, minWidth: 150, sortable: true, filterable: true, hide: true },
    { field: 'email', headerName: 'Email', flex: 1.4, minWidth: 200, sortable: true, filterable: true },
    { field: 'firstName', headerName: 'Nombre', flex: 1, minWidth: 130, sortable: true, filterable: true },
    { field: 'lastName', headerName: 'Apellido', flex: 1, minWidth: 130, sortable: true, filterable: true },
    {
      field: 'status',
      headerName: 'Estado',
      width: 120,
      sortable: true,
      filterable: true,
      renderCell: (params: any) => (
        <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
          params.row.status === 'ACTIVE'
            ? 'bg-green-100 text-green-800'
            : 'bg-red-100 text-red-800'
        }`}>
          {params.row.status === 'ACTIVE' ? 'Activo' : 'Inactivo'}
        </span>
      ),
    },
    {
      field: 'createdAt',
      headerName: 'Registrado',
      type: 'date',
      renderType: 'dateString',
      width: 120,
      sortable: true,
      filterable: true,
    },
    {
      field: 'actions',
      headerName: '',
      width: 120,
      sortable: false,
      filterable: false,
      actionComponent: ({ row }) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              alert.showAlert({
                message: `Ver detalles de ${row.username}`,
                type: 'info',
                duration: 3000,
              });
              // TODO: Implement view/edit user detail page
            }}
            className="text-primary hover:text-primary-dark"
            title="Ver detalles"
          >
            <span className="material-symbols-outlined text-lg">more_horiz</span>
          </button>
          <DeleteCommunityUserButton
            userId={row.id}
            username={row.username}
            onSuccess={handleDeleteSuccess}
            icon="delete"
            buttonText=""
            variant="text"
          />
        </div>
      ),
    },
  ];

  // Map rows before passing to DataGrid
  const mappedRows = rows.map(mapRow);

  return (
    <>
      <DataGrid
        title={title || 'Usuarios de la Comunidad'}
        columns={columns}
        rows={mappedRows}
        totalRows={totalRows ?? mappedRows.length}
        height="70vh"
        data-test-id="community-users-grid"
        limit={25}
      />
    </>
  );
}

