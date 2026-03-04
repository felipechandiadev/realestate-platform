'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/shared/components/ui/Button/Button';
import { NotificationsGrid } from './NotificationsGrid';
import { useMarkAllAsRead } from '@/features/backoffice/notifications/hooks';

/**
 * Notifications Content Component
 *
 * Main container component for notifications management
 * Shows NotificationsGrid with additional actions
 * Handles grid refresh and mark all as read functionality
 *
 * @returns {React.ReactNode} Content component
 */
export function NotificationsContent() {
  const [refreshKey, setRefreshKey] = useState(0);
  const { mutate: markAllAsRead, isPending: isMarkingAllRead } = useMarkAllAsRead();

  /**
   * Handle mark all as read
   */
  const handleMarkAllAsRead = useCallback(() => {
    markAllAsRead(undefined, {
      onSuccess: () => {
        setRefreshKey((prev) => prev + 1);
      },
      onError: (error) => {
        console.error('Error marking all notifications as read:', error);
        alert('Error al marcar todas las notificaciones como leídas');
      },
    });
  }, [markAllAsRead]);

  /**
   * Handle grid refresh
   */
  const handleRefresh = useCallback(() => {
    setRefreshKey((prev) => prev + 1);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Gestión de Notificaciones
          </h1>
          <p className="text-gray-600 mt-1">
            Visualice y administre todas las notificaciones del sistema
          </p>
        </div>
        <Button
          onClick={handleMarkAllAsRead}
          disabled={isMarkingAllRead}
          variant="outline"
        >
          {isMarkingAllRead ? 'Marcando...' : 'Marcar Todas como Leídas'}
        </Button>
      </div>

      {/* Grid */}
      <NotificationsGrid key={refreshKey} onRefresh={handleRefresh} />
    </div>
  );
}
