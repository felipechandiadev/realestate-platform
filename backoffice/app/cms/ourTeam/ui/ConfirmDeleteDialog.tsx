'use client';

import React, { useState } from 'react';
import { Dialog } from "@realestate/ui";
import DeleteTeamMemberForm from '@/features/cms/components/ourTeam/DeleteTeamMemberForm';
import type { TeamMember } from '@/features/cms/actions/ourTeam.action';

interface ConfirmDeleteDialogProps {
  open: boolean;
  member: TeamMember | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDeleteDialog({
  open,
  member,
  onConfirm,
  onCancel,
}: ConfirmDeleteDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const FORM_ID = 'delete-team-member-form';

  if (!open || !member) return null;

  const handleDelete = () => {
    // Obtener el formulario por su ID y ejecutar submit
    const form = document.getElementById(FORM_ID) as HTMLFormElement;
    if (form) {
      form.dispatchEvent(
        new Event('submit', { bubbles: true, cancelable: true })
      );
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onCancel}
      title="Confirmar eliminación"
      actions={[
        {
          label: 'Cancelar',
          onClick: onCancel,
          variant: 'secondary',
          loading: isLoading,
        },
        {
          label: isLoading ? 'Eliminando...' : 'Eliminar miembro',
          onClick: handleDelete,
          variant: 'primary',
          loading: isLoading,
        },
      ]}
    >
      <DeleteTeamMemberForm
        nested
        formId={FORM_ID}
        member={member}
        onSuccess={onConfirm}
        onCancel={onCancel}
        onLoadingChange={setIsLoading}
      />
    </Dialog>
  );
}
