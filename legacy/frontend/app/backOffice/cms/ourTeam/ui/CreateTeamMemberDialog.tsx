'use client';

import React, { useState } from 'react';
import Dialog from '@/shared/components/ui/Dialog/Dialog';
import CreateTeamMemberForm from '@/features/backoffice/cms/components/ourTeam/CreateTeamMemberForm';
import type { TeamMember } from '@/features/backoffice/cms/actions/ourTeam.action';

interface CreateTeamMemberDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (member: TeamMember) => void;
}

export default function CreateTeamMemberDialog({
  open,
  onClose,
  onSuccess,
}: CreateTeamMemberDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const FORM_ID = 'create-team-member-form';

  const handleSuccess = () => {
    onSuccess({} as TeamMember); // El form ya muestra el alert de éxito
    onClose();
  };

  if (!open) return null;

  const handleCreate = () => {
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
      title="Crear miembro del equipo"
      actions={[
        {
          label: 'Cancelar',
          onClick: onClose,
          variant: 'secondary',
          loading: isLoading,
        },
        {
          label: isLoading ? 'Creando...' : 'Crear miembro',
          onClick: handleCreate,
          variant: 'primary',
          loading: isLoading,
        },
      ]}
    >
      <CreateTeamMemberForm
        nested
        formId={FORM_ID}
        onSuccess={handleSuccess}
        onCancel={onClose}
        onLoadingChange={setIsLoading}
      />
    </Dialog>
  );
}
