'use client';

import { useState } from 'react';
import { Button, LoadingState } from '@realestate/ui';
import {
  resendCommunityUserVerification,
  setUserStatus,
  type CommunityUserDetailHeader,
} from '@/features/users/actions/users.action';
import { useAlert } from '@/providers/AlertContext';

function formatDate(value?: string | null) {
  if (!value) return '—';
  try {
    return new Date(value).toLocaleString('es-CL');
  } catch {
    return value;
  }
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </dt>
      <dd className="text-sm text-foreground break-words">{value || '—'}</dd>
    </div>
  );
}

type AccountSectionProps = {
  userId: string;
  header: CommunityUserDetailHeader;
  onUpdateSuccess?: () => void | Promise<void>;
};

export function AccountSection({
  userId,
  header,
  onUpdateSuccess,
}: AccountSectionProps) {
  const { showAlert } = useAlert();
  const [busy, setBusy] = useState<'status' | 'resend' | null>(null);

  const isActive = header.status === 'ACTIVE';

  const toggleStatus = async () => {
    setBusy('status');
    try {
      const next = isActive ? 'INACTIVE' : 'ACTIVE';
      const result = await setUserStatus(userId, next);
      if (!result.success) {
        showAlert({
          message: result.error || 'No se pudo actualizar el estado',
          type: 'error',
        });
        return;
      }
      showAlert({
        message: next === 'ACTIVE' ? 'Usuario activado' : 'Usuario desactivado',
        type: 'success',
      });
      await onUpdateSuccess?.();
    } finally {
      setBusy(null);
    }
  };

  const resendVerify = async () => {
    setBusy('resend');
    try {
      const result = await resendCommunityUserVerification(userId, header.email);
      if (!result.success) {
        showAlert({
          message: result.error || 'No se pudo reenviar la verificación',
          type: 'error',
        });
        return;
      }
      showAlert({
        message: 'Correo de verificación reenviado',
        type: 'success',
      });
    } finally {
      setBusy(null);
    }
  };

  if (busy === 'status') {
    return (
      <div className="flex justify-center py-8">
        <LoadingState label="Actualizando estado" />
      </div>
    );
  }

  return (
    <section className="space-y-6" data-test-id="community-user-account-section">
      <dl className="grid gap-4 sm:grid-cols-2">
        <Field label="Email" value={header.email} />
        <Field label="Username" value={header.username} />
        <Field label="Rol" value={header.role} />
        <Field
          label="Estado"
          value={
            <span
              className={`inline-flex rounded-md px-2 py-1 text-xs font-semibold ${
                isActive
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              {isActive ? 'Activo' : header.status || 'Inactivo'}
            </span>
          }
        />
        <Field
          label="Email verificado"
          value={header.emailVerified ? 'Sí' : 'No'}
        />
        <Field label="Último acceso" value={formatDate(header.lastLogin)} />
        <Field label="Registrado" value={formatDate(header.createdAt)} />
        <Field label="Actualizado" value={formatDate(header.updatedAt)} />
        <Field label="ID" value={<span className="font-mono text-xs">{header.id}</span>} />
      </dl>

      <div className="flex flex-wrap gap-2 border-t border-border pt-4">
        <Button
          type="button"
          variant={isActive ? 'outlined' : 'primary'}
          onClick={toggleStatus}
          disabled={busy !== null}
          data-test-id="community-user-toggle-status"
        >
          {isActive ? 'Desactivar cuenta' : 'Activar cuenta'}
        </Button>
        {!header.emailVerified ? (
          <Button
            type="button"
            variant="outlined"
            onClick={resendVerify}
            disabled={busy !== null}
            data-test-id="community-user-resend-verification"
          >
            {busy === 'resend' ? 'Enviando…' : 'Reenviar verificación'}
          </Button>
        ) : null}
      </div>
    </section>
  );
}
