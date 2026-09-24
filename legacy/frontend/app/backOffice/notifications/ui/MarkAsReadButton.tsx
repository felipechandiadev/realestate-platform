'use client';
import React, { useState } from 'react';
import IconButton from '@/shared/components/ui/IconButton/IconButton';
import { updateNotificationStatus } from '@/features/backoffice/notifications/actions/notifications.action';
import { useAlert } from '@/providers/AlertContext';

interface MarkAsReadButtonProps {
  notificationId: string;
}

export default function MarkAsReadButton({ notificationId }: MarkAsReadButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { showAlert } = useAlert();

  const handleMarkAsRead = async () => {
    setIsLoading(true);
    try {
      const result = await updateNotificationStatus(notificationId, 'OPEN');
      if (result.success) {
        showAlert({
          message: 'Notificación marcada como leída',
          type: 'success',
          duration: 3000
        });
        // Refrescar la página para actualizar el estado
        window.location.reload();
      } else {
        showAlert({
          message: result.error || 'Error al marcar como leída',
          type: 'error',
          duration: 5000
        });
      }
    } catch (error) {
      showAlert({
        message: 'Error inesperado al marcar como leída',
        type: 'error',
        duration: 5000
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <IconButton
      icon="check"
      variant="text"
      ariaLabel="Marcar como leída"
      onClick={handleMarkAsRead}
      disabled={isLoading}
      style={{
        minWidth: 32,
        minHeight: 32,
        width: 32,
        height: 32,
        padding: 4
      }}
    />
  );
}