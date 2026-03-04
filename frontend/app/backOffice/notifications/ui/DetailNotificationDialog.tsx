'use client';

import React, { useState, useEffect } from 'react';
import Dialog from '@/shared/components/ui/Dialog/Dialog';
import { getNotificationById } from '@/features/backoffice/notifications/actions/notifications.action';
import { useAlert } from '@/providers/AlertContext';

interface TargetUser {
  id: string;
  name: string;
}

interface DetailNotificationDialogProps {
  open: boolean;
  onClose: () => void;
  notificationId: string | null;
}

const DetailNotificationDialog: React.FC<DetailNotificationDialogProps> = ({
  open,
  onClose,
  notificationId,
}) => {
  const [notification, setNotification] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showAlert } = useAlert();

  useEffect(() => {
    if (open && notificationId) {
      fetchNotificationDetails();
    } else {
      setNotification(null);
      setError(null);
    }
  }, [open, notificationId]);

  const fetchNotificationDetails = async () => {
    if (!notificationId) return;

    setLoading(true);
    setError(null);

    try {
      const result = await getNotificationById(notificationId);
      if (result.success) {
        setNotification(result.notification);
      } else {
        setError(result.error || 'Error al cargar los detalles de la notificación');
        showAlert({
          message: result.error || 'Error al cargar los detalles',
          type: 'error',
          duration: 5000
        });
      }
    } catch (err) {
      const errorMsg = 'Error inesperado al cargar los detalles';
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

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTypeLabel = (type: string) => {
    const typeLabels = {
      'INTEREST': 'Interés en Propiedad',
      'CONTACT': 'Contacto',
      'PAYMENT_RECEIPT': 'Recibo de Pago',
      'PAYMENT_OVERDUE': 'Pago Vencido',
      'PUBLICATION_STATUS_CHANGE': 'Cambio de Estado de Publicación',
      'CONTRACT_STATUS_CHANGE': 'Cambio de Estado de Contrato',
      'PROPERTY_AGENT_ASSIGNMENT': 'Asignación de Agente a Propiedad'
    };
    return typeLabels[type as keyof typeof typeLabels] || type;
  };

  const getStatusLabel = (status: string) => {
    return status === 'SEND' ? 'Enviado' : 'Leído';
  };

  const getSenderTypeLabel = (senderType: string) => {
    const typeLabels = {
      'USER': 'Usuario',
      'SYSTEM': 'Sistema',
      'ANONYMOUS': 'Anónimo'
    };
    return typeLabels[senderType as keyof typeof typeLabels] || senderType;
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Detalles de Notificación"
      size="lg"
      showCloseButton={true}
    >
      <div className="space-y-4">
        {loading && (
          <div className="flex justify-center py-8">
            <div className="flex justify-center"><span className="material-symbols-outlined animate-spin">progress_activity</span></div>
          </div>
        )}

        {error && (
          <div className="text-red-600 text-center py-4">
            {error}
          </div>
        )}

        {notification && !loading && (
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo
                </label>
                <div className="px-3 py-2 bg-gray-50 rounded-md">
                  {getTypeLabel(notification.type)}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estado
                </label>
                <div className={`px-3 py-2 rounded-md ${
                  notification.status === 'SEND'
                    ? 'bg-yellow-50 text-yellow-800'
                    : 'bg-green-50 text-green-800'
                }`}>
                  {getStatusLabel(notification.status)}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Remitente
                </label>
                <div className="px-3 py-2 bg-gray-50 rounded-md">
                  {getSenderTypeLabel(notification.senderType)}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sistema
                </label>
                <div className="px-3 py-2 bg-gray-50 rounded-md">
                  {notification.isSystem ? 'Sí' : 'No'}
                </div>
              </div>
            </div>

            {/* Sender Information */}
            {(notification.senderName || notification.senderId) && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Información del Remitente
                </label>
                <div className="bg-gray-50 rounded-md p-3 space-y-2">
                  {notification.senderName && (
                    <div>
                      <span className="font-medium">Nombre:</span> {notification.senderName}
                    </div>
                  )}
                  {notification.senderId && (
                    <div>
                      <span className="font-medium">ID:</span> {notification.senderId}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Message */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mensaje
              </label>
              <div className="bg-gray-50 rounded-md p-3 whitespace-pre-wrap">
                {notification.message}
              </div>
            </div>

            {/* Información del Interesado */}
            {(notification.interestedUserName || notification.interestedUserEmail || notification.interestedUserPhone) && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Información del interesado
                </label>
                <div className="bg-gray-50 rounded-md p-3 space-y-2">
                  {notification.interestedUserName && (
                    <div>
                      <span className="font-medium">Nombre:</span> {notification.interestedUserName}
                    </div>
                  )}

                  {notification.interestedUserEmail && (
                    <div>
                      <span className="font-medium">Email:</span>{' '}
                      <a href={`mailto:${notification.interestedUserEmail}`} className="text-primary underline">
                        {notification.interestedUserEmail}
                      </a>
                    </div>
                  )}

                  {notification.interestedUserPhone && (
                    <div>
                      <span className="font-medium">Teléfono:</span>{' '}
                      <a href={`tel:${notification.interestedUserPhone}`} className="text-foreground">
                        {notification.interestedUserPhone}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Target Users */}
            {notification.targetUsers && notification.targetUsers.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Usuarios Destinatarios ({notification.targetUsers.length})
                </label>
                <div className="bg-gray-50 rounded-md p-3">
                  <div className="flex flex-wrap gap-2">
                    {notification.targetUsers.map((user: TargetUser, index: number) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                        title={`ID: ${user.id}`}
                      >
                        {user.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Target Emails */}
            {notification.targetMails && notification.targetMails.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Emails Destinatarios ({notification.targetMails.length})
                </label>
                <div className="bg-gray-50 rounded-md p-3">
                  <div className="flex flex-wrap gap-2">
                    {notification.targetMails.map((email: string, index: number) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full"
                      >
                        {email}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha de Creación
                </label>
                <div className="px-3 py-2 bg-gray-50 rounded-md">
                  {formatDate(notification.createdAt)}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Última Actualización
                </label>
                <div className="px-3 py-2 bg-gray-50 rounded-md">
                  {formatDate(notification.updatedAt)}
                </div>
              </div>

              {notification.firstViewedAt && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Primera Vez Vista
                  </label>
                  <div className="px-3 py-2 bg-gray-50 rounded-md">
                    {formatDate(notification.firstViewedAt)}
                  </div>
                </div>
              )}

              {notification.firstViewerId && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Primer Visualizador
                  </label>
                  <div className="px-3 py-2 bg-gray-50 rounded-md">
                    {notification.firstViewerId}
                  </div>
                </div>
              )}
            </div>

            {/* Multimedia */}
            {notification.multimedia && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Multimedia
                </label>
                <div className="bg-gray-50 rounded-md p-3">
                  <div className="space-y-2">
                    <div><span className="font-medium">ID:</span> {notification.multimedia.id}</div>
                    <div><span className="font-medium">Nombre:</span> {notification.multimedia.name}</div>
                    <div><span className="font-medium">Tipo:</span> {notification.multimedia.type}</div>
                    {notification.multimedia.url && (
                      <div>
                        <span className="font-medium">URL:</span>{' '}
                        <a
                          href={notification.multimedia.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          Ver archivo
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Viewer */}
            {notification.viewer && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Visualizador
                </label>
                <div className="bg-gray-50 rounded-md p-3">
                  <div className="space-y-1">
                    <div><span className="font-medium">ID:</span> {notification.viewer.id}</div>
                    <div><span className="font-medium">Nombre:</span> {notification.viewer.name || 'N/A'}</div>
                    <div><span className="font-medium">Email:</span> {notification.viewer.email || 'N/A'}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Dialog>
  );
};

export default DetailNotificationDialog;