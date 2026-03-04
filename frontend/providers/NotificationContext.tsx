"use client";
import React, { createContext, useContext, useState, useCallback, ReactNode, useMemo, useEffect } from 'react';
import { useAuth } from '@/app/providers';
import { useAlert } from '@/shared/hooks/useAlert';
import {
  getUserGridNotifications,
  UserGridNotificationsParams,
  UserNotificationGridRow,
  UserGridNotificationsResponse,
  markAllNotificationsAsRead,
  updateNotificationStatus
} from '@/features/backoffice/notifications/actions/notifications.action';

export type NotificationGridRow = UserNotificationGridRow;

export type NotificationGridParams = UserGridNotificationsParams;

export type NotificationGridResponse = UserGridNotificationsResponse;

type NotificationContextType = {
  // Estado
  unreadCount: number;
  notifications: NotificationGridRow[];
  loading: {
    count: boolean;
    grid: boolean;
    markAsRead: boolean;
    markAllAsRead: boolean;
    updateStatus: boolean;
  };
  error: string | null;

  // Métodos
  getUnreadCount: () => Promise<void>;
  getNotificationGrid: (params?: NotificationGridParams) => Promise<NotificationGridResponse>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  updateNotificationStatus: (notificationId: string, status: 'SEND' | 'OPEN') => Promise<void>;
  refreshNotifications: () => Promise<void>;
};

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const { showAlert } = useAlert();

  // Estado local
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [notifications, setNotifications] = useState<NotificationGridRow[]>([]);
  const [loading, setLoading] = useState({
    count: false,
    grid: false,
    markAsRead: false,
    markAllAsRead: false,
    updateStatus: false,
  });
  const [error, setError] = useState<string | null>(null);

  // Método para obtener cuenta de notificaciones sin leer
  const getUnreadCount = useCallback(async () => {
    if (!isAuthenticated || !user?.id) {
      setUnreadCount(0);
      return;
    }

    setLoading(prev => ({ ...prev, count: true }));
    setError(null);

    try {
      // Obtener todas las notificaciones del usuario y contar las no leídas
      const result = await getUserGridNotifications(user.id, {
        fields: 'id,status',
        pagination: false
      });

      if (!result) {
        setUnreadCount(0);
        return;
      }

      if (Array.isArray(result)) {
        const unread = result.filter(n => n.status === 'SEND').length;
        setUnreadCount(unread);
      } else if (result.data && Array.isArray(result.data)) {
        // Si es paginado, contar en los datos
        const unread = result.data.filter(n => n.status === 'SEND').length;
        setUnreadCount(unread);
      } else {
        setUnreadCount(0);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al obtener conteo de notificaciones';
      setError(errorMessage);
      console.error('Error getting unread count:', err);
    } finally {
      setLoading(prev => ({ ...prev, count: false }));
    }
  }, [isAuthenticated, user?.id]);

  // Método para obtener grid de notificaciones
  const getNotificationGrid = useCallback(async (params?: NotificationGridParams): Promise<NotificationGridResponse> => {
    if (!isAuthenticated || !user?.id) {
      throw new Error('Usuario no autenticado');
    }

    setLoading(prev => ({ ...prev, grid: true }));
    setError(null);

    try {
      const result = await getUserGridNotifications(user.id, params);
      setNotifications(Array.isArray(result) ? result : result.data);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al obtener notificaciones';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(prev => ({ ...prev, grid: false }));
    }
  }, [isAuthenticated, user?.id]);

  // Método para marcar una notificación como leída
  const markAsRead = useCallback(async (notificationId: string) => {
    if (!isAuthenticated || !user?.id) {
      throw new Error('Usuario no autenticado');
    }

    setLoading(prev => ({ ...prev, markAsRead: true }));
    setError(null);

    try {
      await updateNotificationStatus(notificationId, 'OPEN');

      // Actualizar estado local
      setNotifications(prev =>
        prev.map(n =>
          n.id === notificationId ? { ...n, status: 'OPEN' } : n
        )
      );

      // Actualizar conteo
      setUnreadCount(prev => Math.max(0, prev - 1));

      showAlert({
        message: 'Notificación marcada como leída',
        type: 'success',
        duration: 3000
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al marcar notificación como leída';
      setError(errorMessage);
      showAlert({
        message: errorMessage,
        type: 'error',
        duration: 5000
      });
      throw err;
    } finally {
      setLoading(prev => ({ ...prev, markAsRead: false }));
    }
  }, [isAuthenticated, user?.id, showAlert]);

  // Método para marcar todas las notificaciones como leídas
  const markAllAsRead = useCallback(async () => {
    if (!isAuthenticated || !user?.id) {
      throw new Error('Usuario no autenticado');
    }

    setLoading(prev => ({ ...prev, markAllAsRead: true }));
    setError(null);

    try {
      const count = await markAllNotificationsAsRead(user.id);

      // Actualizar estado local
      setNotifications(prev =>
        prev.map(n => ({ ...n, status: 'OPEN' }))
      );

      // Resetear conteo
      setUnreadCount(0);

      showAlert({
        message: `${count} notificaciones marcadas como leídas`,
        type: 'success',
        duration: 3000
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al marcar todas las notificaciones como leídas';
      setError(errorMessage);
      showAlert({
        message: errorMessage,
        type: 'error',
        duration: 5000
      });
      throw err;
    } finally {
      setLoading(prev => ({ ...prev, markAllAsRead: false }));
    }
  }, [isAuthenticated, user?.id, showAlert]);

  // Método para actualizar estado de notificación
  const updateNotificationStatusMethod = useCallback(async (notificationId: string, status: 'SEND' | 'OPEN') => {
    if (!isAuthenticated || !user?.id) {
      throw new Error('Usuario no autenticado');
    }

    setLoading(prev => ({ ...prev, updateStatus: true }));
    setError(null);

    try {
      await updateNotificationStatus(notificationId, status);

      // Actualizar estado local
      setNotifications(prev =>
        prev.map(n =>
          n.id === notificationId ? { ...n, status } : n
        )
      );

      // Recalcular conteo si cambió a SEND o OPEN
      if (status === 'OPEN') {
        setUnreadCount(prev => Math.max(0, prev - 1));
      } else if (status === 'SEND') {
        setUnreadCount(prev => prev + 1);
      }

      showAlert({
        message: `Notificación ${status === 'OPEN' ? 'marcada como leída' : 'marcada como no leída'}`,
        type: 'success',
        duration: 3000
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar estado de notificación';
      setError(errorMessage);
      showAlert({
        message: errorMessage,
        type: 'error',
        duration: 5000
      });
      throw err;
    } finally {
      setLoading(prev => ({ ...prev, updateStatus: false }));
    }
  }, [isAuthenticated, user?.id, showAlert]);

  // Método para refrescar notificaciones
  const refreshNotifications = useCallback(async () => {
    await Promise.all([
      getUnreadCount(),
      getNotificationGrid()
    ]);
  }, [getUnreadCount, getNotificationGrid]);

  // Efecto para cargar datos iniciales cuando el usuario se autentica
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      refreshNotifications();
    } else {
      // Resetear estado cuando no hay usuario autenticado
      setUnreadCount(0);
      setNotifications([]);
      setError(null);
    }
  }, [isAuthenticated, user?.id, refreshNotifications]);

  const value = useMemo<NotificationContextType>(() => ({
    unreadCount,
    notifications,
    loading,
    error,
    getUnreadCount,
    getNotificationGrid,
    markAsRead,
    markAllAsRead,
    updateNotificationStatus: updateNotificationStatusMethod,
    refreshNotifications,
  }), [
    unreadCount,
    notifications,
    loading,
    error,
    getUnreadCount,
    getNotificationGrid,
    markAsRead,
    markAllAsRead,
    updateNotificationStatusMethod,
    refreshNotifications,
  ]);

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotificationContext() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotificationContext must be used within a NotificationProvider');
  return ctx;
}

// Convenience alias that reads better in components
export const useNotification = useNotificationContext;