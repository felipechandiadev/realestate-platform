'use client';

import { useCallback, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { DataGrid, type DataGridColumn } from '@/shared/components/ui/DataGrid/DataGrid';
import Dialog from '@/shared/components/ui/Dialog/Dialog';
import { Button } from '@/shared/components/ui/Button/Button';
import { TextField } from '@/shared/components/ui/TextField';
import {
  useContractsGrid,
  useDeleteContract,
} from '@/features/backoffice/contracts/hooks';
import type { Contract } from '@/features/backoffice/contracts/types';
import { getStatusInSpanish } from '@/features/backoffice/contracts/utils';

interface ContractGridItem {
  id: string;
  propertyAddress: string;
  propertyId: string;
  partyName: string;
  contractType: string;
  status: string;
  startDate: string;
  endDate: string;
  createdAt: string;
}

interface ContractsGridProps {
  onEdit?: (contract: Contract) => void;
  onRefresh?: () => void;
}

/**
 * Contracts Grid Component
 *
 * Displays a paginated, sortable grid of all contracts
 * Supports searching, filtering, deletion, and inline actions
 *
 * @param {ContractsGridProps} props - Component props
 * @returns {React.ReactNode} Grid component
 */
export function ContractsGrid({ onEdit, onRefresh }: ContractsGridProps) {
  const searchParams = useSearchParams();
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedContractId, setSelectedContractId] = useState<string | null>(
    null
  );
  const [searchTerm, setSearchTerm] = useState('');

  // Pagination from URL
  const page = parseInt(searchParams?.get('page') || '1');
  const limit = parseInt(searchParams?.get('limit') || '10');
  const sortField = searchParams?.get('sortField') || 'createdAt';
  const sort = searchParams?.get('sort') || 'desc';

  // Fetch contracts
  const {
    data: gridResponse,
    isLoading,
    error,
    refetch,
  } = useContractsGrid({
    page,
    limit,
    search: searchTerm,
    sortField: sortField as any,
    sort: sort as 'asc' | 'desc',
    pagination: true,
    filtration: !!searchTerm,
  });

  // Delete mutation
  const { mutate: deleteContract, isPending: isDeleting } = useDeleteContract();

  const contracts = gridResponse?.items || [];

  // Map to grid format
  const gridItems: ContractGridItem[] = useMemo(
    () =>
      contracts.map((contract) => ({
        id: contract.id,
        propertyAddress:
          contract.property?.address ||
          contract.propertyId ||
          'N/A',
        propertyId: contract.propertyId || '',
        partyName: contract.partyName || 'N/A',
        contractType: contract.contractType || 'N/A',
        status: contract.status || 'PENDING',
        startDate: new Date(contract.startDate).toLocaleDateString('es-MX'),
        endDate: contract.endDate
          ? new Date(contract.endDate).toLocaleDateString('es-MX')
          : '-',
        createdAt: new Date(contract.createdAt).toLocaleDateString('es-MX'),
      })),
    [contracts]
  );

  // Handle delete confirmation
  const handleConfirmDelete = useCallback(() => {
    if (!selectedContractId) return;

    deleteContract(selectedContractId, {
      onSuccess: () => {
        setOpenDeleteDialog(false);
        setSelectedContractId(null);
        refetch();
        onRefresh?.();
      },
      onError: (error) => {
        console.error('Error deleting contract:', error);
        setOpenDeleteDialog(false);
        setSelectedContractId(null);
      },
    });
  }, [selectedContractId, deleteContract, refetch, onRefresh]);

  // Handle row action
  const handleRowAction = useCallback(
    (action: string, row: ContractGridItem) => {
      const contract = contracts.find((c) => c.id === row.id) as Contract | undefined;
      if (!contract) return;

      if (action === 'edit') {
        onEdit?.(contract);
      } else if (action === 'delete') {
        setSelectedContractId(row.id);
        setOpenDeleteDialog(true);
      }
    },
    [contracts, onEdit]
  );

  const columns: DataGridColumn[] = [
    {
      field: 'propertyAddress',
      headerName: 'Propiedad',
      width: 200,
    },
    {
      field: 'partyName',
      headerName: 'Contraparte',
      width: 200,
    },
    {
      field: 'contractType',
      headerName: 'Tipo',
      width: 150,
    },
    {
      field: 'status',
      headerName: 'Estado',
      width: 120,
      renderCell: ({ value }) => (
        <span className="inline-block px-2 py-1 rounded bg-blue-100 text-blue-800 text-sm">
          {getStatusInSpanish(String(value))}
        </span>
      ),
    },
    {
      field: 'startDate',
      headerName: 'Inicio',
      width: 120,
    },
    {
      field: 'endDate',
      headerName: 'Fin',
      width: 120,
    },
    {
      field: 'actions',
      headerName: 'Acciones',
      width: 180,
      sortable: false,
      renderCell: ({ row }) => (
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={() => handleRowAction('edit', row as ContractGridItem)}>
            Editar
          </Button>
          <Button variant="danger" size="sm" onClick={() => handleRowAction('delete', row as ContractGridItem)}>
            Eliminar
          </Button>
        </div>
      ),
    },
  ];

  if (error) {
    return (
      <div className="p-6 bg-red-50 rounded-lg border border-red-200">
        <h3 className="text-red-900 font-semibold mb-2">
          Error al cargar contratos
        </h3>
        <p className="text-red-700 mb-4">
          {error instanceof Error ? error.message : 'Error desconocido'}
        </p>
        <Button variant="primary" onClick={() => refetch()}>
          Reintentar
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex gap-2">
        <TextField
          placeholder="Buscar por contraparte, propiedad..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
          }}
          className="flex-1"
        />
        <Button variant="secondary" onClick={() => refetch()}>
          Actualizar
        </Button>
      </div>

      {/* Grid */}
      <div className="bg-white border rounded-lg overflow-hidden">
        <DataGrid
          columns={columns}
          rows={gridItems}
          loading={isLoading}
        />
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDeleteDialog}
        onOpenChange={setOpenDeleteDialog}
        title="Eliminar Contrato"
        description="¿Está seguro de que desea eliminar este contrato? Esta acción no se puede deshacer."
        actions={[
          {
            label: 'Cancelar',
            onClick: () => setOpenDeleteDialog(false),
            variant: 'secondary' as const,
          },
          {
            label: 'Eliminar',
            onClick: handleConfirmDelete,
            variant: 'danger' as const,
            loading: isDeleting,
          },
        ]}
      />
    </div>
  );
}
