'use client';

import React, { useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { DataGrid, type DataGridColumn } from '@realestate/ui';
import type { CommunityUserGridRow } from '@/features/users/actions/users.action';
import DeleteCommunityUserButton from './DeleteCommunityUserButton';
import CommunityUserMoreButton from './CommunityUserMoreButton';

type CommunityUsersDataGridProps = {
  rows: CommunityUserGridRow[];
  totalRows?: number;
  title?: string;
};

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

function CommunityUsersDataGridInner({
  rows,
  totalRows,
  title,
}: CommunityUsersDataGridProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const handleDeleteSuccess = () => {
    setIsDeleting(null);
    router.refresh();
  };

  const columns: DataGridColumn[] = [
    {
      field: 'username',
      headerName: 'Usuario',
      flex: 1.2,
      minWidth: 150,
      sortable: true,
      filterable: true,
      hide: true,
    },
    {
      field: 'email',
      headerName: 'Email',
      flex: 1.4,
      minWidth: 200,
      sortable: true,
      filterable: true,
    },
    {
      field: 'firstName',
      headerName: 'Nombre',
      flex: 1,
      minWidth: 130,
      sortable: true,
      filterable: true,
    },
    {
      field: 'lastName',
      headerName: 'Apellido',
      flex: 1,
      minWidth: 130,
      sortable: true,
      filterable: true,
    },
    {
      field: 'status',
      headerName: 'Estado',
      width: 120,
      sortable: true,
      filterable: true,
      renderCell: (params: any) => (
        <span
          className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
            params.row.status === 'ACTIVE'
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
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
        <div className="flex h-full flex-shrink-0 items-center justify-center gap-1">
          <CommunityUserMoreButton user={{ id: row.id }} />
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

  const mappedRows = rows.map(mapRow);

  return (
    <DataGrid
      title={title || 'Usuarios de la Comunidad'}
      columns={columns}
      rows={mappedRows}
      totalRows={totalRows ?? mappedRows.length}
      fillViewport
      pinActionsColumn
      data-test-id="community-users-grid"
      limit={25}
    />
  );
}

export default function CommunityUsersDataGrid(props: CommunityUsersDataGridProps) {
  return (
    <Suspense fallback={<div className="p-4 text-sm text-muted-foreground">Cargando…</div>}>
      <CommunityUsersDataGridInner {...props} />
    </Suspense>
  );
}
