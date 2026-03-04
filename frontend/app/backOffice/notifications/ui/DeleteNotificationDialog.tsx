'use client';

import React, { useState } from 'react';
import Dialog from '@/shared/components/ui/Dialog/Dialog';
import { DeleteBaseForm } from '@/shared/components/ui/BaseForm';
import { deleteNotification } from '@/features/backoffice/notifications/actions/notifications.action';
import { useAlert } from '@/providers/AlertContext';

interface DeleteNotificationDialogProps {
  open: boolean;
  onClose: () => void;
  notificationId: string | null;
  notificationMessage?: string;
  onSave: () => void; // Callback to refresh list
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

  const handleSubmit = async () => {
    if (!notificationId) return;

    setLoading(true);
    setError(null);

    try {
      const result = await deleteNotification(notificationId);
      if (result.success) {
        showAlert({
          message: 'Notificación eliminada exitosamente',
          type: 'success',
          duration: 3000
        });
        onSave();
        onClose();
      } else {
        const errorMsg = result.error || 'Error al eliminar la notificación';
        setError(errorMsg);
        showAlert({
          message: errorMsg,
          type: 'error',
          duration: 5000
        });
      }
    } catch (err) {
      const errorMsg = 'Error inesperado al eliminar la notificación';
      setError(errorMsg);
      showAlert({
        message: errorMsg,
        type: 'error',
        duration: 5000
      });
    } finally {
      setLoading(false);
    }
  };

  const truncatedMessage = notificationMessage
    ? notificationMessage.length > 50
      ? `${notificationMessage.substring(0, 50)}...`
      : notificationMessage
    : 'esta notificación';

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Eliminar Notificación"
      maxWidth="sm"
    >
      <div>
        {error && (
          <div className="mb-4 text-red-600">
            {error}
          </div>
        )}
        <DeleteBaseForm
          message={`¿Estás seguro de que quieres eliminar la notificación "${truncatedMessage}"?`}
          subtitle="Esta acción no se puede deshacer."
          title=""
          isSubmitting={loading}
          submitLabel="Eliminar"
          onSubmit={handleSubmit}
          cancelButton={true}
          cancelButtonText="Cancelar"
          onCancel={onClose}
        />
      </div>
    </Dialog>
  );
};

export default DeleteNotificationDialog;