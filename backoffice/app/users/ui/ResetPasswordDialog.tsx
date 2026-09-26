'use client';

import React, { useEffect, useState } from 'react';
import { Button, Dialog, TextField } from '@realestate/ui';
import { resetUserPassword } from '@/features/users/actions/users.action';
import { useAlert } from '@/providers/AlertContext';

export interface ResetPasswordDialogProps {
  open: boolean;
  userId: string;
  displayName: string;
  onClose: () => void;
}

const ResetPasswordDialog: React.FC<ResetPasswordDialogProps> = ({
  open,
  userId,
  displayName,
  onClose,
}) => {
  const { showAlert } = useAlert();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setPassword('');
    setConfirmPassword('');
    setError(null);
    setLoading(false);
  }, [open, userId]);

  const handleClose = () => {
    if (loading) return;
    onClose();
  };

  const handleSubmit = async () => {
    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      return;
    }
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setLoading(true);
    setError(null);
    const result = await resetUserPassword(userId, password);
    setLoading(false);

    if (!result.success) {
      setError(result.error || 'No se pudo restablecer la contraseña');
      return;
    }

    showAlert({ message: 'Contraseña restablecida', type: 'success' });
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      title="Restablecer contraseña"
      maxWidth="sm"
      actionsJustify="end"
      actions={
        <>
          <Button variant="outlined" type="button" onClick={handleClose} disabled={loading}>
            Cancelar
          </Button>
          <Button variant="primary" type="button" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Guardando...' : 'Guardar'}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <p className="text-sm text-neutral-600">
          Nueva contraseña para {displayName}
        </p>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <TextField
          label="Nueva contraseña"
          type="password"
          name="newPassword"
          value={password}
          required
          onChange={(event) => setPassword(event.target.value)}
        />
        <TextField
          label="Confirmar contraseña"
          type="password"
          name="confirmPassword"
          value={confirmPassword}
          required
          onChange={(event) => setConfirmPassword(event.target.value)}
        />
      </div>
    </Dialog>
  );
};

export default ResetPasswordDialog;
