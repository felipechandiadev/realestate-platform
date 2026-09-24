'use client';

import { useMemo } from 'react';
import DataGrid, { type DataGridColumn } from '@/shared/components/ui/DataGrid/DataGrid';
import IconButton from '@/shared/components/ui/IconButton/IconButton';
import type { DocumentEntity } from '@/features/backoffice/contracts/actions/documents.action';
import type { DocumentType } from '@/features/backoffice/contracts/actions/documentTypes.action';
import { useAlert } from '@/providers/AlertContext';

const statusStyles: Record<string, string> = {
  PENDING: 'bg-amber-100 text-amber-800 border border-amber-200',
  UPLOADED: 'bg-emerald-100 text-emerald-800 border border-emerald-200',
  RECIBIDO: 'bg-blue-100 text-blue-800 border border-blue-200',
  REJECTED: 'bg-rose-100 text-rose-800 border border-rose-200',
};

type DocumentsDataGridProps = {
  rows: DocumentEntity[];
  totalRows?: number;
  documentTypes: DocumentType[];
  errorMessage?: string;
};

export default function DocumentsDataGrid(props: DocumentsDataGridProps) {
  const { rows, totalRows, errorMessage } = props;
  const { showAlert } = useAlert();

  const handleExportExcel = async () => {
    showAlert({
      message: 'La exportación a Excel para documentos estará disponible próximamente',
      type: 'info',
      duration: 4000,
    });
  };

  const columns = useMemo<DataGridColumn[]>(() => [
    {
      field: 'title',
      headerName: 'Título',
      flex: 1.2,
      minWidth: 200,
      sortable: true,
      filterable: true,
    },
    {
      field: 'documentType',
      headerName: 'Tipo',
      width: 200,
      sortable: true,
      filterable: true,
      renderCell: ({ row }) => row.documentType?.name ?? 'Sin tipo',
    },
    {
      field: 'contractOperation',
      headerName: 'Tipo de Contrato',
      width: 160,
      sortable: true,
      filterable: true,
      renderCell: ({ row }) => {
        const operation = row.contract?.operation;
        if (!operation) {
          return '—';
        }

        const key = typeof operation === 'string' ? operation.toUpperCase() : '';
        if (key === 'COMPRAVENTA') {
          return 'Compraventa';
        }
        if (key === 'ARRIENDO') {
          return 'Arriendo';
        }
        return operation;
      },
    },
    {
      field: 'contract',
      headerName: 'Contrato',
      width: 160,
      sortable: true,
      filterable: true,
      renderCell: ({ row }) => row.contract?.code ?? '—',
    },
    {
      field: 'status',
      headerName: 'Estado',
      width: 150,
      sortable: true,
      filterable: true,
      renderCell: ({ row }) => {
        const variant = statusStyles[row.status] ?? 'bg-muted text-foreground border border-border';
        const statusLabel = (() => {
          const key = typeof row.status === 'string' ? row.status.toUpperCase() : '';
          switch (key) {
            case 'PENDING':
              return 'Pendiente';
            case 'UPLOADED':
              return 'Subido';
            case 'RECIBIDO':
              return 'Recibido';
            case 'REJECTED':
              return 'Rechazado';
            default:
              return row.status ?? '—';
          }
        })();

        return (
          <span className={`px-3 py-1 rounded-full text-xs font-semibold inline-flex items-center justify-center ${variant}`}>
            {statusLabel}
          </span>
        );
      },
    },
    {
      field: 'uploadedBy',
      headerName: 'Subido por',
      width: 220,
      sortable: true,
      filterable: true,
      renderCell: ({ row }) => row.uploadedBy?.name ?? row.uploadedBy?.email ?? '—',
    },
    {
      field: 'person',
      headerName: 'Persona asociada',
      flex: 1,
      minWidth: 200,
      sortable: true,
      filterable: true,
      renderCell: ({ row }) => row.person?.name ?? '—',
    },
    {
      field: 'createdAt',
      headerName: 'Creado',
      type: 'date',
      renderType: 'dateString',
      width: 190,
      sortable: true,
      filterable: true,
      renderCell: ({ row }) => {
        if (!row.createdAt) {
          return '—';
        }

        const date = row.createdAt instanceof Date ? row.createdAt : new Date(row.createdAt);
        if (Number.isNaN(date.getTime())) {
          return '—';
        }

        const pad = (value: number) => value.toString().padStart(2, '0');
        const day = pad(date.getDate());
        const month = pad(date.getMonth() + 1);
        const year = date.getFullYear();
        const hours = pad(date.getHours());
        const minutes = pad(date.getMinutes());

        return `${day}-${month}-${year} ${hours}:${minutes}`;
      },
    },
    {
      field: 'actions',
      headerName: '',
      width: 120,
      sortable: false,
      filterable: false,
      actionComponent: ({ row }) => (
        <IconButton
          icon="visibility"
          variant="text"
          title={row.multimedia?.url ? 'Ver documento' : 'Documento sin archivo'}
          onClick={() => {
            if (row.multimedia?.url) {
              window.open(row.multimedia.url, '_blank', 'noopener,noreferrer');
            }
          }}
          disabled={!row.multimedia?.url}
        />
      ),
    },
  ], []);

  return (
    <div className="space-y-4">
      {errorMessage && (
        <div className="rounded-lg border border-rose-300 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {errorMessage}
        </div>
      )}

      <DataGrid
        columns={columns}
        rows={rows}
        totalRows={totalRows ?? rows.length}
        height="80vh"
        onExportExcel={handleExportExcel}
      />
    </div>
  );
}
