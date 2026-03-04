'use client';

import React, { useState } from 'react';
import Dialog from '@/shared/components/ui/Dialog/Dialog';
import UpdateTeamMemberForm from '@/features/backoffice/cms/components/ourTeam/UpdateTeamMemberForm';
import type { TeamMember } from '@/features/backoffice/cms/actions/ourTeam.action';

interface UpdateTeamMemberDialogProps {
  open: boolean;
  member: TeamMember | null;
  onClose: () => void;
  onSuccess: (member: TeamMember) => void;
}

export default function UpdateTeamMemberDialog({
  open,
  member,
  onClose,
  onSuccess,
}: UpdateTeamMemberDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const FORM_ID = 'update-team-member-form';

  const handleSuccess = () => {
    onSuccess({} as TeamMember); // El form ya muestra el alert de éxito
    onClose();
  };

  if (!open || !member) return null;

  const handleUpdate = () => {
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
      onClose={onClose}
      title="Editar miembro del equipo"
      actions={[
        {
          label: 'Cancelar',
          onClick: onClose,
          variant: 'secondary',
          loading: isLoading,
        },
        {
          label: isLoading ? 'Actualizando...' : 'Actualizar miembro',
          onClick: handleUpdate,
          variant: 'primary',
          loading: isLoading,
        },
      ]}
    >
      <UpdateTeamMemberForm
        nested
        formId={FORM_ID}
        member={member}
        onSuccess={handleSuccess}
        onCancel={onClose}
        onLoadingChange={setIsLoading}
      />
    </Dialog>
  );
}
