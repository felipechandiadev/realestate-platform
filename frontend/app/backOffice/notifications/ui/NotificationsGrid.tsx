'use client';
import React, { useState } from 'react';
import DataGrid, { type DataGridColumn } from '@/shared/components/ui/DataGrid/DataGrid';
import MarkAsReadButton from '@/app/backOffice/notifications/ui/MarkAsReadButton';
import DetailNotificationDialog from '@/app/backOffice/notifications/ui/DetailNotificationDialog';
import DeleteNotificationDialog from '@/app/backOffice/notifications/ui/DeleteNotificationDialog';
import IconButton from '@/shared/components/ui/IconButton/IconButton';
import { useAlert } from '@/providers/AlertContext';
import { useSearchParams } from 'next/navigation';
import { exportUserGridNotificationsExcel } from '@/features/backoffice/notifications/actions/notifications.action';

type NotificationRow = {
  id: string;
  message?: string;
  type?: string;
  status?: string;
  senderName?: string;
  senderType?: string;
  isSystem?: boolean;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any;
};

type NotificationsGridProps = {
  rows: NotificationRow[];
  totalRows?: number;
  title?: string;
  userId?: string; // ID del usuario cuyo grid estamos mostrando (necesario para export)
};

export default function NotificationsGrid({ rows, totalRows, title, userId }: NotificationsGridProps) {
  const alert = useAlert();
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedNotificationId, setSelectedNotificationId] = useState<string | null>(null);
  const [selectedNotificationMessage, setSelectedNotificationMessage] = useState<string>('');

  const handleViewDetails = (notificationId: string, message: string) => {
    setSelectedNotificationId(notificationId);
    setSelectedNotificationMessage(message);
    setDetailDialogOpen(true);
  };

  const handleDelete = (notificationId: string, message: string) => {
    setSelectedNotificationId(notificationId);
    setSelectedNotificationMessage(message);
    setDeleteDialogOpen(true);
  };

  const searchParams = useSearchParams();

  const handleRefresh = () => {
    // Refresh the page to reload notifications
    window.location.reload();
  };

  const handleExportExcel = async () => {
    if (!userId) {
      alert.showAlert({ message: 'No hay usuario para exportar.', type: 'warning' });
      return;
    }

    const params: any = {};
    const sp = searchParams;
    const sort = sp.get('sort');
    const sortField = sp.get('sortField');
    const search = sp.get('search');
    const filters = sp.get('filters');
    const filtration = sp.get('filtration');

    if (sort === 'asc' || sort === 'desc') params.sort = sort;
    if (sortField) params.sortField = sortField;
    if (typeof search === 'string') params.search = search;
    if (typeof filters === 'string') params.filters = filters;
    if (filtration) params.filtration = filtration === 'true';
    params.pagination = false;

    try {
      const result = await exportUserGridNotificationsExcel(userId, params);
      if (!result || (result as any).success === false) {
        const err = (result as any).error || 'Error al exportar';
        alert.showAlert({ message: err, type: 'error' });
        return;
      }

      const { filename, base64 } = result as { filename: string; base64: string };
      const blob = await fetch(`data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${base64}`).then(r => r.blob());
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename || 'notificaciones.xlsx';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      alert.showAlert({ message: 'Exportado a Excel', type: 'success', duration: 3000 });
    } catch (error) {
      console.error('Export to Excel failed:', error);
      alert.showAlert({ message: 'Error al exportar a Excel', type: 'error' });
    }
  };

  const columns: DataGridColumn[] = [
    {
      field: 'message',
      headerName: 'Mensaje',
      flex: 2,
      minWidth: 200,
      sortable: true,
      filterable: true,
      renderCell: ({ value }) => (
        <div className="line-clamp-2 text-sm">{value}</div>
      )
    },
    {
      field: 'type',
      headerName: 'Tipo',
      width: 180,
      sortable: true,
      filterable: true,
      renderCell: ({ value }) => {
        const typeLabels = {
          'INTEREST': 'Interés',
          'CONTACT': 'Contacto',
          'PAYMENT_RECEIPT': 'Recibo de Pago',
          'PAYMENT_OVERDUE': 'Pago Vencido',
          'PUBLICATION_STATUS_CHANGE': 'Cambio de Estado',
          'CONTRACT_STATUS_CHANGE': 'Cambio de Contrato',
          'PROPERTY_AGENT_ASSIGNMENT': 'Asignación de Agente'
        };
        return (
          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
            {typeLabels[value as keyof typeof typeLabels] || value}
          </span>
        );
      }
    },
    {
      field: 'status',
      headerName: 'Estado',
      width: 120,
      sortable: true,
      filterable: true,
      renderCell: ({ value }) => (
        <span className={`px-2 py-1 text-xs rounded-full ${
          value === 'SEND' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
        }`}>
          {value === 'SEND' ? 'Enviado' : 'Leído'}
        </span>
      )
    },
    // New columns: structured contact fields from notifications (do NOT change free-text `message`)
    {
      field: 'interestedUserName',
      headerName: 'Contacto',
      width: 180,
      sortable: true,
      filterable: true,
      renderCell: ({ value }) => (
        <span className="text-sm text-foreground">{value || '-'}</span>
      )
    },
    {
      field: 'interestedUserEmail',
      headerName: 'Email contacto',
      width: 220,
      sortable: true,
      filterable: true,
      renderCell: ({ value }) => (
        value ? <a href={`mailto:${value}`} className="text-sm text-primary underline">{value}</a> : <span className="text-sm text-muted">-</span>
      )
    },
    {
      field: 'interestedUserPhone',
      headerName: 'Teléfono contacto',
      width: 160,
      sortable: true,
      filterable: true,
      renderCell: ({ value }) => (
        value ? <a href={`tel:${value}`} className="text-sm text-foreground">{value}</a> : <span className="text-sm text-muted">-</span>
      )
    },
    {
      field: 'senderType',
      headerName: 'Tipo Remitente',
      width: 140,
      sortable: true,
      filterable: true,
      renderCell: ({ value }) => {
        const typeLabels = {
          'USER': 'Usuario',
          'SYSTEM': 'Sistema',
          'ANONYMOUS': 'Anónimo'
        };
        return typeLabels[value as keyof typeof typeLabels] || value;
      }
    },
    {
      field: 'createdAt',
      headerName: 'Fecha',
      type: 'date',
      renderType: 'dateString',
      width: 120,
      sortable: true,
      filterable: true
    },
    {
      field: 'actions',
      headerName: '',
      width: 140,
      sortable: false,
      filterable: false,
      actionComponent: ({ row }) => (
        <div className="flex items-center gap-1">
          <IconButton
            icon="more_horiz"
            variant="text"
            size="xs"
            ariaLabel="Ver detalles"
            onClick={() => handleViewDetails(row.id, row.message || '')}
          />
          {row.status === 'SEND' && (
            <MarkAsReadButton notificationId={row.id} />
          )}
          <IconButton
            icon="delete"
            variant="text"
            size="xs"
            ariaLabel="Eliminar notificación"
            onClick={() => handleDelete(row.id, row.message || '')}
            className="text-red-500"
          />
        </div>
      ),
    },
  ];

  return (
    <>
      <DataGrid
        title={title || 'Notificaciones'}
        columns={columns}
        rows={rows}
        totalRows={totalRows ?? rows.length}
        height="70vh"
        data-test-id="notifications-grid"
        onExportExcel={handleExportExcel}
      />

      <DetailNotificationDialog
        open={detailDialogOpen}
        onClose={() => setDetailDialogOpen(false)}
        notificationId={selectedNotificationId}
      />

      <DeleteNotificationDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        notificationId={selectedNotificationId}
        notificationMessage={selectedNotificationMessage}
        onSave={handleRefresh}
      />
    </>
  );
}