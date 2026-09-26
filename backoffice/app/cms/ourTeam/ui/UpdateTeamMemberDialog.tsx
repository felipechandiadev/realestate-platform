'use client';

import React, { useState } from 'react';
import { Button, Dialog } from '@realestate/ui';
import UpdateTeamMemberForm from '@/features/cms/components/ourTeam/UpdateTeamMemberForm';
import type { TeamMember } from '@/features/cms/actions/ourTeam.action';

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
    onSuccess({} as TeamMember);
    onClose();
  };

  if (!open || !member) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Editar miembro del equipo"
      actionsJustify="end"
      actions={
        <>
          <Button variant="outlined" type="button" onClick={onClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button variant="primary" type="submit" form={FORM_ID} disabled={isLoading}>
            {isLoading ? 'Actualizando...' : 'Actualizar miembro'}
          </Button>
        </>
      }
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
