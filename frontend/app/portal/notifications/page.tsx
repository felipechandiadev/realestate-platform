/**
 * Notifications Page (Portal - User Dashboard)
 * 
 * Propósito:
 * - Centro de notificaciones personales del usuario
 * - Alertas sobre propiedades, contratos, mensajes
 * - Notificaciones del sistema (favoritos, publicaciones, vencimientos)
 * - Marcar notificaciones como leídas
 * 
 * Funcionalidad:
 * - Client component: requiere autenticación (useAuth)
 * - useNotification context para estado global
 * - Lista de notificaciones con Cards
 * - Filtrado visual: leídas/no leídas
 * - Acciones: markAsRead, markAllAsRead
 * - Auto-refresh cuando cambia usuario
 * - Loading y error states
 * - Redirect si no autenticado
 * 
 * Audiencia: Usuarios registrados gestionando notificaciones
 */

'use client';

import React, { useEffect } from 'react';
import { useNotification } from '@/providers/NotificationContext';
import { useAuth } from '@/app/providers';
import { Button } from '@/shared/components/ui/Button/Button';
import Card from '@/shared/components/ui/Card/Card';
import Alert from '@/shared/components/ui/Alert/Alert';
import { useRouter } from 'next/navigation';

export default function NotificationsPage() {
  const { user, status } = useAuth();
  const router = useRouter();
  const {
    notifications,
    loading,
    error,
    refreshNotifications,
    markAsRead,
    markAllAsRead,
  } = useNotification();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/portal');
    }
  }, [status, router]);

  useEffect(() => {
    if (user?.id) {
      refreshNotifications();
    }
  }, [user?.id, refreshNotifications]);

  const handleMarkAsRead = async (id: string, currentStatus?: string) => {
    if (currentStatus === 'OPEN') return;
    try {
      await markAsRead(id);
    } catch (err) {
      console.error('Error marking as read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  };

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex justify-center"><span className="material-symbols-outlined animate-spin">progress_activity</span></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Mis Notificaciones</h1>
          <p className="text-muted-foreground mt-1">
            Mantente al día con las actualizaciones de tus propiedades y trámites.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outlined"
            onClick={refreshNotifications}
            disabled={loading.grid}
            className="flex items-center gap-2"
          >
            <span className={`material-symbols-outlined ${loading.grid ? 'animate-spin' : ''}`}>
              refresh
            </span>
            Actualizar
          </Button>
          <Button
            variant="primary"
            onClick={handleMarkAllAsRead}
            disabled={loading.markAllAsRead || notifications.length === 0}
            className="flex items-center gap-2"
          >
            <span className="material-symbols-outlined">done_all</span>
            Marcar todas como leídas
          </Button>
        </div>
      </div>

      {/* Errores */}
      {error && (
        <Alert variant="error" className="mb-6">
          {error}
        </Alert>
      )}

      <div className="space-y-4">
        {loading.grid && notifications.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex justify-center"><span className="material-symbols-outlined animate-spin">progress_activity</span></div>
          </div>
        ) : notifications.length > 0 ? (
          notifications.map((notification) => (
            <Card
              key={notification.id}
              className={`transition-all border-l-4 ${
                notification.status === 'SEND'
                  ? 'border-l-primary bg-primary/5 shadow-md'
                  : 'border-l-transparent'
              }`}
            >
              <div 
                className="flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer"
                onClick={() => handleMarkAsRead(notification.id, notification.status)}
              >
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`material-symbols-outlined text-xl ${
                      notification.status === 'SEND' ? 'text-primary' : 'text-muted-foreground'
                    }`}>
                      {notification.type === 'INTEREST' ? 'favorite' : 
                       notification.type === 'PAYMENT_OVERDUE' ? 'warning' :
                       notification.type === 'CONTRACT_STATUS_CHANGE' ? 'description' : 'info'}
                    </span>
                    <h3 className={`font-semibold ${notification.status === 'SEND' ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {notification.senderName || 'Sistema'}
                    </h3>
                    {notification.status === 'SEND' && (
                      <span className="bg-primary/10 text-primary text-[10px] font-bold px-1.5 py-0.5 rounded-full uppercase">
                        Nueva
                      </span>
                    )}
                  </div>
                  <p className={`${notification.status === 'SEND' ? 'text-foreground' : 'text-muted-foreground'} line-clamp-2`}>
                    {notification.message}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {notification.createdAt ? new Date(notification.createdAt).toLocaleString('es-CL', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    }) : ''}
                  </p>
                </div>
                {notification.status === 'SEND' && (
                  <Button
                    variant="text"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMarkAsRead(notification.id);
                    }}
                    className="text-primary hover:bg-primary/10"
                  >
                    Marcar como leída
                  </Button>
                )}
              </div>
            </Card>
          ))
        ) : (
          <Card className="flex flex-col items-center justify-center py-16 text-center">
            <span className="material-symbols-outlined text-6xl text-muted-foreground mb-4">
              notifications_off
            </span>
            <h3 className="text-xl font-medium text-foreground">No tienes notificaciones</h3>
            <p className="text-muted-foreground max-w-sm mt-2">
              Cuando recibas avisos sobre tus propiedades o pagos, aparecerán aquí.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
