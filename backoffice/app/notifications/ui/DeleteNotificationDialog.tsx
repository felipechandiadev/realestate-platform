'use client';

import React, { useEffect, useState } from 'react';
import { DeleteDialog } from '@realestate/ui';
import { deleteNotification } from '@/features/notifications/actions/notifications.action';
import { useAlert } from '@/providers/AlertContext';

interface DeleteNotificationDialogProps {
  open: boolean;
  onClose: () => void;
  notificationId: string | null;
  notificationMessage?: string;
  onSave: () => void;
}

const DeleteNotificationDialog: React.FC<DeleteNotificationDialogProps> = ({
  open,
  onClose,
  notificationId,
  notificationMessage,
  onSave,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showAlert } = useAlert();

  // Reset solo al abrir de nuevo. En éxito el loading queda activo durante
  // la animación de cierre del Dialog (~200ms) para no reactivar el botón.
  useEffect(() => {
    if (open) {
      setError(null);
      setLoading(false);
    }
  }, [open]);

  const handleConfirm = async () => {
    if (!notificationId || loading) return;

    setLoading(true);
    setError(null);

    try {
      const result = await deleteNotification(notificationId);
      if (result.success) {
        showAlert({
          message: 'Notificación eliminada exitosamente',
          type: 'success',
          duration: 3000,
        });
        onSave();
        onClose();
        return;
      }

      const errorMsg = result.error || 'Error al eliminar la notificación';
      setError(errorMsg);
      setLoading(false);
      showAlert({
        message: errorMsg,
        type: 'error',
        duration: 5000,
      });
    } catch {
      const errorMsg = 'Error inesperado al eliminar la notificación';
      setError(errorMsg);
      setLoading(false);
      showAlert({
        message: errorMsg,
        type: 'error',
        duration: 5000,
      });
    }
  };

  const truncatedMessage = notificationMessage
    ? notificationMessage.length > 50
      ? `${notificationMessage.substring(0, 50)}...`
      : notificationMessage
    : 'esta notificación';

  return (
    <DeleteDialog
      open={open}
      onClose={onClose}
      title="Eliminar Notificación"
      subtitle="Esta acción no se puede deshacer."
      message={`¿Estás seguro de que quieres eliminar la notificación "${truncatedMessage}"?`}
      confirmLabel="Eliminar"
      cancelLabel="Cancelar"
      isSubmitting={loading}
      errors={error ? [error] : []}
      onConfirm={handleConfirm}
      data-test-id="delete-notification-dialog"
    />
  );
};

export default DeleteNotificationDialog;
