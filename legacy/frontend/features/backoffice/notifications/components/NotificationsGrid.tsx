'use client';

import { useCallback, useMemo, useState } from 'react';
import DataGrid from '@/shared/components/ui/DataGrid/DataGrid';
import Dialog from '@/shared/components/ui/Dialog/Dialog';
import { Button } from '@/shared/components/ui/Button/Button';
import { TextField } from '@/shared/components/ui/TextField';
import { Badge } from '@/shared/components/ui/Badge/Badge';
import {
  useNotifications,
  useDeleteNotification,
  useMarkAsRead,
} from '@/features/backoffice/notifications/hooks';
import type { Notification } from '@/features/backoffice/notifications/types';

interface NotificationGridItem {
  id: string;
  recipient: string;
  message: string;
  status: string;
  type: string;
  sentAt: string;
}

interface NotificationsGridProps {
  onRefresh?: () => void;
}

/**
 * Notifications Grid Component
 *
 * Displays a paginated, sortable grid of all notifications
 * Shows message preview, status, date
 * Supports mark as read and delete actions
 *
 * @param {NotificationsGridProps} props - Component props
 * @returns {React.ReactNode} Grid component
 */
export function NotificationsGrid({ onRefresh }: NotificationsGridProps) {
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedNotificationId, setSelectedNotificationId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Fetch notifications
  const {
    data: notificationsResponse,
    isLoading,
    error,
    refetch,
  } = useNotifications({
    limit,
    offset: (page - 1) * limit,
  });

  // Delete mutation
  const { mutate: deleteNotification, isPending: isDeleting } = useDeleteNotification();
  const { mutate: markAsRead, isPending: isMarkingRead } = useMarkAsRead();

  const notifications = notificationsResponse || [];
  const totalRecords = notificationsResponse?.length || 0;
  const totalPages = Math.ceil(totalRecords / limit);

  // Filter by search term
  const filteredNotifications = useMemo(() => {
    if (!searchTerm) return notifications;
    const term = searchTerm.toLowerCase();
    return notifications.filter(
      (n: Notification) =>
        n.title.toLowerCase().includes(term) ||
        n.message.toLowerCase().includes(term) ||
        n.userId.toLowerCase().includes(term)
    );
  }, [notifications, searchTerm]);

  // Map to grid format
  const gridItems: NotificationGridItem[] = useMemo(
    () =>
      filteredNotifications.map((notification: Notification) => ({
        id: notification.id,
        recipient: notification.userId,
        message: truncateMessage(notification.message, 60),
        status: notification.isRead ? 'Leído' : 'No leído',
        type: getTypeLabel(notification.type),
        sentAt: new Date(notification.createdAt).toLocaleDateString('es-MX', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
      })),
    [filteredNotifications]
  );

  // Handle delete confirmation
  const handleConfirmDelete = useCallback(() => {
    if (!selectedNotificationId) return;

    deleteNotification(selectedNotificationId, {
      onSuccess: () => {
        setOpenDeleteDialog(false);
        setSelectedNotificationId(null);
        refetch();
        onRefresh?.();
      },
      onError: (error) => {
        console.error('Error deleting notification:', error);
        alert('Error al eliminar la notificación');
      },
    });
  }, [selectedNotificationId, deleteNotification, refetch, onRefresh]);

  // Handle delete click
  const handleDeleteClick = useCallback((item: NotificationGridItem) => {
    setSelectedNotificationId(item.id);
    setOpenDeleteDialog(true);
  }, []);

  // Handle mark as read
  const handleMarkAsRead = useCallback(
    (item: NotificationGridItem) => {
      markAsRead(item.id, {
        onSuccess: () => {
          refetch();
          onRefresh?.();
        },
        onError: (error) => {
          console.error('Error marking notification as read:', error);
        },
      });
    },
    [markAsRead, refetch, onRefresh]
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
            placeholder="Buscar notificaciones..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="flex-1"
          />
        </div>

        {/* Grid */}
        <DataGrid
          columns={[
            {
              field: 'recipient',
              headerName: 'Destinatario',
              width: 200,
              sortable: true,
            },
            {
              field: 'message',
              headerName: 'Mensaje',
              width: 350,
              sortable: true,
            },
            {
              field: 'type',
              headerName: 'Tipo',
              width: 120,
              sortable: true,
              renderCell: (item) => (
                <Badge variant={getTypeVariant(item.type)}>
                  {item.type}
                </Badge>
              ),
            },
            {
              field: 'status',
              headerName: 'Estado',
              width: 120,
              sortable: true,
              renderCell: (item) => (
                <Badge variant={item.status === 'Leído' ? 'default' : 'warning'}>
                  {item.status}
                </Badge>
              ),
            },
            {
              field: 'sentAt',
              headerName: 'Fecha',
              width: 180,
              sortable: true,
            },
            {
              field: 'actions',
              headerName: 'Acciones',
              width: 250,
              renderCell: (item) => (
                <div className="flex gap-2">
                  {item.status === 'No leído' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleMarkAsRead(item)}
                      disabled={isMarkingRead}
                    >
                      Marcar Leído
                    </Button>
                  )}
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
            onPaginationModelChange: (model) => setPage(model.page),
          }}
        />
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDeleteDialog}
        onOpenChange={setOpenDeleteDialog}
        title="Confirmar Eliminación"
        description="¿Está seguro que desea eliminar esta notificación? Esta acción no se puede deshacer."
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
 * Truncate message to specified length
 */
function truncateMessage(message: string, length: number): string {
  if (message.length <= length) return message;
  return message.substring(0, length) + '...';
}

/**
 * Get type label in Spanish
 */
function getTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    info: 'Información',
    success: 'Éxito',
    warning: 'Advertencia',
    error: 'Error',
  };
  return labels[type] || type;
}

/**
 * Get type badge variant
 */
function getTypeVariant(type: string): 'success' | 'warning' | 'error' | 'default' {
  const variants: Record<string, 'success' | 'warning' | 'error' | 'default'> = {
    'Información': 'default',
    'Éxito': 'success',
    'Advertencia': 'warning',
    'Error': 'error',
  };
  return variants[type] || 'default';
}
