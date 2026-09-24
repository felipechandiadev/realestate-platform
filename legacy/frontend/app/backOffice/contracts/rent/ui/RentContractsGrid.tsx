'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import DataGrid, { type DataGridColumn } from '@/shared/components/ui/DataGrid/DataGrid';
import type { ContractGridRow } from '@/features/backoffice/contracts/actions/contracts.action';
import { useAlert } from '@/shared/hooks/useAlert';
import IconButton from '@/shared/components/ui/IconButton/IconButton';
import ContractDetailDialog from '../../ui/ContractDetail/ContractDetailDialog';
import CreateRentContractForm from './CreateRentContractForm';

type RentContractsGridProps = {
  rows: ContractGridRow[];
  totalRows?: number;
  title?: string;
};

export default function RentContractsGrid({ rows, totalRows, title }: RentContractsGridProps) {
  const alert = useAlert();
  const router = useRouter();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [selectedContractId, setSelectedContractId] = useState<string | null>(null);

  const normalizeStatusKey = (status: string | null | undefined) =>
    typeof status === 'string' ? status.trim().toUpperCase() : '';

  const getStatusLabel = (status: string) => {
    const key = normalizeStatusKey(status);
    const statusLabels: Record<string, string> = {
      IN_PROCESS: 'En Proceso',
      CLOSED: 'Cerrado',
      FAILED: 'Fallido',
    };

    if (key === 'ON_HOLD') {
      return statusLabels.IN_PROCESS;
    }

    return statusLabels[key] || status || 'Sin estado';
  };

  const getStatusColor = (status: string) => {
    const key = normalizeStatusKey(status);
    const statusColors: Record<string, string> = {
      IN_PROCESS: 'bg-blue-100 text-blue-800',
      CLOSED: 'bg-green-100 text-green-800',
      FAILED: 'bg-red-100 text-red-800',
    };

    if (key === 'ON_HOLD') {
      return statusColors.IN_PROCESS;
    }

    return statusColors[key] || 'bg-blue-100 text-blue-800';
  };

  const formatCurrency = (amount: number, currency: string) => {
    const safeAmount = Number.isFinite(amount) ? amount : 0;

    if (currency === 'UF') {
      return `UF ${safeAmount.toLocaleString('es-CL')}`;
    }

    return `$ ${safeAmount.toLocaleString('es-CL')}`;
  };

  const formatDateTime = (value?: string | Date | null) => {
    if (!value) {
      return '—';
    }

    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) {
      return '—';
    }

    const pad = (input: number) => input.toString().padStart(2, '0');

    const day = pad(date.getDate());
    const month = pad(date.getMonth() + 1);
    const year = date.getFullYear();
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());

    return `${day}-${month}-${year} ${hours}:${minutes}`;
  };

  const handleViewDetails = (contractId: string) => {
    setSelectedContractId(contractId);
    setShowDetailDialog(true);
  };

  const handleContractUpdate = () => {
    router.refresh();
  };

  const columns: DataGridColumn[] = [
    {
      field: 'code',
      headerName: 'Código',
      width: 140,
      sortable: true,
      filterable: true,
      renderCell: ({ row }) => (
        <span className="font-mono text-sm font-medium text-foreground">
          {row.code || row.id.slice(-8).toUpperCase()}
        </span>
      ),
    },
    {
      field: 'status',
      headerName: 'Estado',
      width: 120,
      sortable: true,
      filterable: true,
      renderCell: ({ row }) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(row.status)}`}>
          {getStatusLabel(row.status)}
        </span>
      ),
    },
    {
      field: 'propertyTitle',
      headerName: 'Propiedad',
      flex: 1.5,
      minWidth: 200,
      sortable: true,
      filterable: true,
      renderCell: ({ row }) => (
        <div>
          <div className="font-medium text-foreground">{row.propertyTitle || 'Sin título'}</div>
          <div className="text-sm text-muted-foreground">{row.propertyAddress}</div>
        </div>
      ),
    },
    {
      field: 'clientName',
      headerName: 'Arrendatario',
      flex: 1,
      minWidth: 150,
      sortable: true,
      filterable: true,
      renderCell: ({ row }) => (
        <span>{row.clientName || 'No asignado'}</span>
      ),
    },
    {
      field: 'amount',
      headerName: 'Arriendo Mensual',
      type: 'number',
      flex: 1,
      minWidth: 150,
      sortable: true,
      renderCell: ({ row }) => (
        <div className="text-left">
          <div className="font-medium text-foreground">{formatCurrency(row.amount, row.currency)}</div>
        </div>
      ),
    },
    {
      field: 'commissionAmount',
      headerName: 'Comisión',
      type: 'number',
      flex: 0.8,
      minWidth: 120,
      sortable: true,
      renderCell: ({ row }) => (
        <div className="text-left">
          <div className="font-medium text-green-600">
            {row.currency === 'CLP'
              ? `$ ${row.commissionAmount.toLocaleString('es-CL')}`
              : `${row.currency} ${row.commissionAmount.toLocaleString('es-CL')}`}
          </div>
          <div className="text-xs text-muted-foreground">
            {row.commissionPercent}%
          </div>
        </div>
      ),
    },
    {
      field: 'agentName',
      headerName: 'Agente',
      flex: 0.8,
      minWidth: 120,
      sortable: true,
      filterable: true,
      renderCell: ({ row }) => (
        <span>{row.agentName || 'No asignado'}</span>
      ),
    },
    {
      field: 'endDate',
      headerName: 'Fin Contrato',
      type: 'date',
      renderType: 'dateString',
      flex: 0.8,
      minWidth: 140,
      sortable: true,
      renderCell: ({ row }) => (
        <span>{row.endDate ? new Date(row.endDate).toLocaleDateString('es-CL') : 'Indefinido'}</span>
      ),
    },
    {
      field: 'createdAt',
      headerName: 'Fecha Creación',
      type: 'date',
      renderType: 'dateString',
      flex: 0.8,
      minWidth: 140,
      sortable: true,
      renderCell: ({ row }) => (
        <span className="font-mono text-xs text-muted-foreground">
          {formatDateTime(row.createdAt)}
        </span>
      ),
    },
    {
      field: 'actions',
      headerName: '',
      flex: 1,
      sortable: false,
      filterable: false,
      actionComponent: ({ row }) => (
        <div>
          <IconButton
            icon="more_horiz"
            variant="text"
            onClick={() => handleViewDetails(row.id)}
            title="Ver detalles"
          />
        </div>
      ),
    },
  ];

  const handleExportExcel = async () => {
    alert.showAlert({
      message: 'La exportación a Excel para contratos estará disponible próximamente',
      type: 'info',
      duration: 4000,
    });
  };

  return (
    <>
      <DataGrid
        title={title || 'Contratos de Arriendo'}
        columns={columns}
        rows={rows}
        totalRows={totalRows ?? rows.length}
        height="75vh"
        createForm={<CreateRentContractForm onClose={() => setShowCreateDialog(false)} />}
        createFormTitle="Crear Nuevo Contrato de Arriendo"
        onExportExcel={handleExportExcel}
      />

      <ContractDetailDialog
        open={showDetailDialog}
        onClose={() => {
          setShowDetailDialog(false);
          setSelectedContractId(null);
        }}
        contractId={selectedContractId}
        onUpdate={handleContractUpdate}
        onEdit={(id) => {
          setShowDetailDialog(false);
          alert.showAlert({
            message: `Editar contrato ${id}`,
            type: 'info',
            duration: 3000,
          });
        }}
      />
    </>
  );
}