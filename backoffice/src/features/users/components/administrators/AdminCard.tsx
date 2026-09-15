'use client';

import React from 'react';
import { AdministratorType, AdministratorStatus } from './types';
import { IconButton } from '@realestate/ui';
import { UserAvatarField } from '@/shared/components/ui/Multimedia/UserAvatarField';

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
  const fullName =
    `${admin.personalInfo?.firstName ?? ''} ${admin.personalInfo?.lastName ?? ''}`.trim() ||
    admin.username ||
    admin.email;

  const normalizedStatus = (admin.status ?? '').toString().trim().toUpperCase() as AdministratorStatus;
  const status = STATUS_STYLES[normalizedStatus] || STATUS_STYLES.INACTIVE || {
    className: 'bg-neutral-500 text-white',
    label: normalizedStatus || 'DESCONOCIDO',
  };

  return (
    <article className="border border-neutral-200 bg-white rounded-lg shadow-sm p-4 flex flex-col justify-between min-w-[260px] overflow-visible">
      <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-6 md:gap-4 items-stretch">
        <div className="flex justify-center items-center overflow-visible px-2 pb-2 pt-1">
          <UserAvatarField
            userId={admin.id}
            currentAvatarUrl={admin.personalInfo?.avatarUrl}
            size="sm"
            data-test-id={`admin-avatar-${admin.id}`}
          />
        </div>

        <div className="flex flex-col gap-4 sm:gap-2 w-full overflow-hidden">
          <div className="flex w-full justify-end mb-2">
            <span className={`text-[8px] font-light uppercase px-2 py-0.5 rounded-full ${status.className}`}>
              {status.label}
            </span>
          </div>

          <h3 className="text-lg font-semibold text-foreground truncate break-all">{fullName}</h3>
          <p className="text-xs font-light text-neutral-600 truncate break-all">@{admin.username}</p>

          <div className="flex items-center gap-2">
            <IconButton icon="email" variant="text" size="sm" className="text-neutral-500" />
            <p className="text-xs font-light text-neutral-500 truncate break-all">{admin.email}</p>
          </div>

          {admin.personalInfo?.phone ? (
            <div className="flex items-center gap-2">
              <IconButton icon="phone" variant="text" size="sm" className="text-neutral-500" />
              <p className="text-xs font-light text-neutral-500 truncate break-all">
                {admin.personalInfo.phone}
              </p>
            </div>
          ) : null}
        </div>
      </div>

      <div className="flex justify-end gap-2 mt-4">
        <IconButton
          icon="edit"
          variant="text"
          size="md"
          aria-label={`Editar ${fullName}`}
          title="Editar"
          onClick={() => onEdit?.(admin)}
          className="text-secondary"
        />
        <IconButton
          icon="delete"
          variant="text"
          size="md"
          aria-label={`Eliminar ${fullName}`}
          title="Eliminar"
          onClick={() => onDelete?.(admin)}
          className="text-secondary"
        />
      </div>
    </article>
  );
};

export default AdminCard;
