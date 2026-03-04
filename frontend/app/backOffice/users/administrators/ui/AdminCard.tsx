import React, { useState } from 'react';
import { AdministratorType, AdministratorStatus } from './types';
import IconButton from '@/shared/components/ui/IconButton/IconButton';
import UploadUserAvatarDialog from '../../ui/UploadUserAvatarDialog';
import { env } from '@/lib/env';

export interface AdminCardProps {
  admin: AdministratorType;
  onEdit?: (admin: AdministratorType) => void;
  onDelete?: (admin: AdministratorType) => void;
}

const STATUS_STYLES: Record<AdministratorStatus, { className: string; label: string }> = {
  ACTIVE: { className: 'bg-emerald-600 text-white', label: 'ACTIVO' },
  INVITED: { className: 'bg-sky-600 text-white', label: 'INVITADO' },
  INACTIVE: { className: 'bg-amber-600 text-white', label: 'INACTIVO' },
  SUSPENDED: { className: 'bg-rose-600 text-white', label: 'SUSPENDIDO' },
};

const AdminCard: React.FC<AdminCardProps> = ({ admin, onEdit, onDelete }) => {
  const [showAvatarDialog, setShowAvatarDialog] = useState(false);
  const fullName = `${admin.personalInfo?.firstName ?? ''} ${admin.personalInfo?.lastName ?? ''}`.trim() || admin.username || admin.email;

  // Normalizar el estado: convertir a mayúsculas y asegurar que sea válido
  const normalizedStatus = (admin.status ?? '').toString().trim().toUpperCase() as AdministratorStatus;
  const status = STATUS_STYLES[normalizedStatus] || STATUS_STYLES['INACTIVE'] || {
    className: 'bg-neutral-500 text-white',
    label: normalizedStatus || 'DESCONOCIDO',
  };
  
  console.log('[AdminCard] Status debug:', { adminStatus: admin.status, normalizedStatus, statusLabel: status.label });

  return (
    <>
  <article className="border border-neutral-200 bg-white rounded-lg shadow-sm p-4 flex flex-col justify-between min-w-[260px]">
  <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-6 md:gap-4 items-stretch">
          {/* Columna del Avatar */}
          <div className="flex justify-center items-center h-full md:h-full md:justify-center md:items-center">
            <div className="relative flex-shrink-0 mx-auto">
              <div className="h-24 w-24 rounded-full bg-neutral-100 border-4 border-secondary flex items-center justify-center overflow-hidden">
                {admin.personalInfo?.avatarUrl ? (
                  // eslint-disable-next-line @next/next/next/no-img-element
                  <img 
                    src={
                      admin.personalInfo.avatarUrl.startsWith('http') 
                        ? admin.personalInfo.avatarUrl 
                        : `${env.backendApiUrl}${admin.personalInfo.avatarUrl}`
                    } 
                    alt={`Avatar ${fullName}`} 
                    className="h-full w-full object-cover" 
                  />
                ) : (
                  <span className="material-symbols-outlined text-secondary" style={{ fontSize: '4rem' }}>person</span>
                )}
              </div>
              {!admin.personalInfo?.avatarUrl && (
                <IconButton
                  icon="add"
                  variant="primary"
                  size="xs"
                  className="absolute bottom-0 right-2 z-10"
                  aria-label="Agregar avatar"
                  title="Agregar avatar"
                  onClick={() => setShowAvatarDialog(true)}
                />
              )}
            </div>
          </div>

          {/* Columna de Información */}
          <div className="flex flex-col gap-4 sm:gap-2 w-full overflow-hidden">
            {/* Status badge */}
            <div className="flex w-full justify-end mb-2">
              <span className={`text-[8px] font-light uppercase px-2 py-0.5 rounded-full ${status.className}`}>
                {status.label}
              </span>
            </div>

            {/* Nombre */}
            <h3 className="text-lg font-semibold text-foreground truncate break-all">{fullName}</h3>

            {/* Nombre de usuario */}
            <p className="text-xs font-light text-neutral-600 truncate break-all">@{admin.username}</p>

            {/* Correo con icono */}
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-neutral-500" style={{ fontSize: '0.875rem' }}>email</span>
              <p className="text-xs font-light text-neutral-500 truncate break-all">{admin.email}</p>
            </div>

            {/* Teléfono con icono */}
            {admin.personalInfo?.phone && (
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-neutral-500" style={{ fontSize: '0.875rem' }}>phone</span>
                <p className="text-xs font-light text-neutral-500 truncate break-all">{admin.personalInfo.phone}</p>
              </div>
            )}
          </div>
        </div>

  <div className="flex justify-end gap-2 mt-4 ">
          <IconButton
            icon="edit"
            variant="text"
            size="sm"
            aria-label={`Editar ${fullName}`}
            title="Editar"
            onClick={() => onEdit?.(admin)}
            className='text-secondary'
          />

          <IconButton
            icon="delete"
            variant="text"
            size="sm"
            aria-label={`Eliminar ${fullName}`}
            title="Eliminar"
            onClick={() => onDelete?.(admin)}
               className='text-secondary'
          />
        </div>
      </article>

      <UploadUserAvatarDialog
        open={showAvatarDialog}
        onClose={() => setShowAvatarDialog(false)}
        userId={admin.id}
        currentAvatarUrl={admin.personalInfo?.avatarUrl || undefined}
      />
    </>
  );
};

export default AdminCard;
