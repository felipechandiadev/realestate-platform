'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import DataGrid, { type DataGridColumn } from '@/shared/components/ui/DataGrid/DataGrid';
import type { ContractDocumentSummary, ContractGridRow } from '@/features/backoffice/contracts/actions/contracts.action';
import { useAlert } from '@/shared/hooks/useAlert';
import IconButton from '@/shared/components/ui/IconButton/IconButton';
import CreateSaleContractForm from './CreateSaleContractForm';
import ContractDetailDialog from '../../ui/ContractDetail/ContractDetailDialog';

type SalesContractsGridProps = {
  rows: ContractGridRow[];
  totalRows?: number;
  title?: string;
};

export default function SalesContractsGrid({ rows, totalRows, title }: SalesContractsGridProps) {
  const alert = useAlert();
  const router = useRouter();
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [selectedContractId, setSelectedContractId] = useState<string | null>(null);

  const handleViewDetails = (contractId: string) => {
    setSelectedContractId(contractId);
    setShowDetailDialog(true);
  };

  const handleContractUpdate = () => {
    // Refresh the page to reload the contracts grid with updated data
    router.refresh();
  };

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

  const documentStatusLabels: Record<string, string> = {
    PENDING: 'Pendiente',
    UPLOADED: 'Subido',
    RECEIVED: 'Recibido',
    APPROVED: 'Aprobado',
    VALIDATED: 'Validado',
    REJECTED: 'Rechazado',
  };

  const documentStatusColors: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    UPLOADED: 'bg-green-100 text-green-800',
    RECEIVED: 'bg-green-100 text-green-800',
    APPROVED: 'bg-green-100 text-green-800',
    VALIDATED: 'bg-green-100 text-green-800',
    REJECTED: 'bg-red-100 text-red-800',
  };

  const getDocumentStatusLabel = (status?: string | null) => {
    if (!status) {
      return 'Sin estado';
    }

    const key = status.toUpperCase();
    if (documentStatusLabels[key]) {
      return documentStatusLabels[key];
    }

    const normalized = status.replace(/_/g, ' ').toLowerCase();
    return normalized.charAt(0).toUpperCase() + normalized.slice(1);
  };

  const getDocumentStatusColor = (status?: string | null) => {
    if (!status) {
      return 'bg-white text-muted-foreground border border-border';
    }

    const key = status.toUpperCase();
    return documentStatusColors[key] || 'bg-white text-muted-foreground border border-border';
  };

  const formatClpAmount = (amount: number) => {
    return `$${amount.toLocaleString('es-CL', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })}`;
  };

  const formatDateTime = (value?: string | null) => {
    if (!value) {
      return '—';
    }

    const date = new Date(value);
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

  const formatCurrency = (amount: number, currency: string, ufValue?: number) => {
    if (currency === 'UF' && ufValue) {
      const clpAmount = amount * ufValue;
      return `UF ${amount.toLocaleString('es-CL')} (${formatClpAmount(clpAmount)})`;
    }
    return formatClpAmount(amount);
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
      field: 'amount',
      headerName: 'Monto Venta',
      type: 'number',
      flex: 1,
      minWidth: 150,
      sortable: true,
      renderCell: ({ row }) => (
        <div className="text-right">
          <div className="font-medium">{formatCurrency(row.amount, row.currency, row.ufValue)}</div>
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
        <div className="flex flex-col items-start">
          <span className="font-medium text-green-600">
            {formatClpAmount(row.commissionAmount)}
          </span>
          <span className="text-xs text-muted-foreground">
            {row.commissionPercent}%
          </span>
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
      field: 'documents',
      headerName: 'Documentos',
      flex: 1.4,
      minWidth: 220,
      sortable: false,
      filterable: false,
      renderCell: ({ row }) => {
        const documents: ContractDocumentSummary[] = Array.isArray(row.documents)
          ? row.documents
          : [];

        if (documents.length === 0) {
          return <span className="text-xs text-muted-foreground">Sin documentos</span>;
        }

        const limitedDocuments = documents.slice(0, 3);
        const remainingCount = documents.length - limitedDocuments.length;

        return (
          <div className="flex flex-col gap-1 w-full">
            {limitedDocuments.map((document) => (
              <div
                key={document.id}
                className="flex flex-wrap items-center gap-2 text-xs text-foreground"
              >
                <span className="truncate max-w-[160px]" title={document.name}>
                  {document.name}
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${getDocumentStatusColor(
                    document.status,
                  )}`}
                >
                  {getDocumentStatusLabel(document.status)}
                </span>
                {document.required ? (
                  <span className="text-[10px] uppercase tracking-wide text-primary font-semibold">
                    Req.
                  </span>
                ) : null}
              </div>
            ))}

            {remainingCount > 0 && (
              <span className="text-[11px] text-muted-foreground">
                +{remainingCount} documento{remainingCount === 1 ? '' : 's'} adicionales
              </span>
            )}
          </div>
        );
      },
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
      headerName: 'Acciones',
      flex: 0.5,
      minWidth: 100,
      sortable: false,
      filterable: false,
      actionComponent: ({ row }) => (
        <div className="flex items-center gap-2">
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
        title={title || 'Contratos de Compraventa'}
        columns={columns}
        rows={rows}
        totalRows={totalRows ?? rows.length}
        height="80vh"
        createForm={<CreateSaleContractForm onClose={() => {}} onSuccess={handleContractUpdate} />}
        createFormTitle="Crear Nuevo Contrato Compraventa"
        onExportExcel={handleExportExcel}
      />

      {/* Contract Detail Dialog */}
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