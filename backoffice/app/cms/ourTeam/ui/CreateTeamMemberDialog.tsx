'use client';

import React, { useState } from 'react';
import { Button, Dialog } from '@realestate/ui';
import CreateTeamMemberForm from '@/features/cms/components/ourTeam/CreateTeamMemberForm';
import type { TeamMember } from '@/features/cms/actions/ourTeam.action';

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
    onSuccess({} as TeamMember);
    onClose();
  };

  if (!open) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Crear miembro del equipo"
      actionsJustify="end"
      actions={
        <>
          <Button variant="outlined" type="button" onClick={onClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button variant="primary" type="submit" form={FORM_ID} disabled={isLoading}>
            {isLoading ? 'Creando...' : 'Crear miembro'}
          </Button>
        </>
      }
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
