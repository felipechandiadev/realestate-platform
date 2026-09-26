'use client';

import React, { useState } from 'react';
import { Button, Dialog } from '@realestate/ui';
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

  return (
    <Dialog
      open={open}
      onClose={onCancel}
      title="Confirmar eliminación"
      actionsJustify="end"
      actions={
        <>
          <Button variant="outlined" type="button" onClick={onCancel} disabled={isLoading}>
            Cancelar
          </Button>
          <Button variant="primary" type="submit" form={FORM_ID} disabled={isLoading}>
            {isLoading ? 'Eliminando...' : 'Eliminar miembro'}
          </Button>
        </>
      }
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
