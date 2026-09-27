'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Alert, Button, Dialog, DotProgress, TextField } from '@realestate/ui';
import { changePassword, getCurrentUserProfile } from '@/features/users/actions/users.action';

interface MyAccountDialogProps {
  open: boolean;
  onClose: () => void;
}

type AccountProfile = {
  name: string;
  username: string;
  email: string;
  phone: string;
  role: string;
};

const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'Administrador',
  AGENT: 'Agente',
  COMMUNITY: 'Comunidad',
};

const EMPTY_PASSWORD = {
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
};

function profileValue(value?: string) {
  const trimmed = value?.trim();
  return trimmed || '—';
}

const MyAccountDialog: React.FC<MyAccountDialogProps> = ({ open, onClose }) => {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [profile, setProfile] = useState<AccountProfile | null>(null);
  const [passwordData, setPasswordData] = useState(EMPTY_PASSWORD);

  const loadUserData = useCallback(async () => {
    try {
      setLoading(true);
      setAlert(null);
      const profileResult = await getCurrentUserProfile();
      if (!profileResult.success || !profileResult.data) {
        throw new Error(profileResult.error || 'Error al obtener el perfil del usuario');
      }
      const data = profileResult.data;
      const name = [data.personalInfo?.firstName, data.personalInfo?.lastName].filter(Boolean).join(' ');
      setProfile({
        name,
        username: data.username || '',
        email: data.email || '',
        phone: data.personalInfo?.phone || data.person?.phone || '',
        role: ROLE_LABELS[data.role] || data.role || '',
      });
    } catch (error: unknown) {
      setProfile(null);
      setAlert({
        type: 'error',
        message: error instanceof Error ? error.message : 'Error al cargar los datos del usuario',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open && session?.user) {
      loadUserData();
    }
  }, [open, session, loadUserData]);

  const handlePasswordChange = async () => {
    try {
      setPasswordLoading(true);
      setAlert(null);

      const userId = (session?.user as { id?: string })?.id;
      if (!userId) throw new Error('Usuario no identificado');
      if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
        throw new Error('Todos los campos de contraseña son requeridos');
      }
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        throw new Error('Las contraseñas no coinciden');
      }

      const result = await changePassword(userId, {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      if (!result.success) {
        throw new Error(result.error || 'Error al cambiar la contraseña');
      }

      setPasswordData(EMPTY_PASSWORD);
      setAlert({ type: 'success', message: 'Contraseña cambiada correctamente' });
    } catch (error: unknown) {
      setAlert({
        type: 'error',
        message: error instanceof Error ? error.message : 'Error al cambiar la contraseña',
      });
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleClose = () => {
    setAlert(null);
    setPasswordData(EMPTY_PASSWORD);
    onClose();
  };

  const rows = [
    { label: 'Nombre', value: profile?.name },
    { label: 'Usuario', value: profile?.username },
    { label: 'Correo', value: profile?.email },
    { label: 'Teléfono', value: profile?.phone },
    { label: 'Rol', value: profile?.role },
  ];

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      title="Mi cuenta"
      size="lg"
      actionsJustify="end"
      actions={
        <Button type="button" variant="outlined" onClick={handleClose} disabled={passwordLoading}>
          Cerrar
        </Button>
      }
      data-test-id="myAccountDialog"
    >
      <div className="space-y-4">
        {alert ? <Alert variant={alert.type}>{alert.message}</Alert> : null}

        {loading && !profile ? (
          <div className="flex justify-center py-8">
            <DotProgress />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-[3fr_2fr]">
            <section>
              <h3 className="mb-3 border-b border-border pb-2 text-lg font-semibold text-foreground">
                Información
              </h3>
              <dl className="space-y-3">
                {rows.map((row) => (
                  <div key={row.label}>
                    <dt className="text-xs font-medium text-muted-foreground">{row.label}</dt>
                    <dd className="text-sm text-foreground">{profileValue(row.value)}</dd>
                  </div>
                ))}
              </dl>
            </section>

            <section>
              <h3 className="mb-3 border-b border-border pb-2 text-lg font-semibold text-foreground">
                Cambiar contraseña
              </h3>
              <div className="flex flex-col gap-3">
                <TextField
                  label="Contraseña actual"
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
                    setPasswordData((current) => ({ ...current, currentPassword: event.target.value }))
                  }
                />
                <TextField
                  label="Nueva contraseña"
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
                    setPasswordData((current) => ({ ...current, newPassword: event.target.value }))
                  }
                />
                <TextField
                  label="Confirmar contraseña"
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
                    setPasswordData((current) => ({ ...current, confirmPassword: event.target.value }))
                  }
                />
                <div className="flex justify-end pt-1">
                  <Button
                    type="button"
                    variant="primary"
                    onClick={handlePasswordChange}
                    disabled={passwordLoading}
                  >
                    {passwordLoading ? 'Cambiando...' : 'Cambiar contraseña'}
                  </Button>
                </div>
              </div>
            </section>
          </div>
        )}
      </div>
    </Dialog>
  );
};

export default MyAccountDialog;
