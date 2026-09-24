'use client';

import React, { useState } from 'react';
import { TeamMember, deleteTeamMember } from '@/features/backoffice/cms/actions/ourTeam.action';
import DeleteBaseForm from '@/shared/components/ui/BaseForm/DeleteBaseForm';
import { useAlert } from '@/providers/AlertContext';

interface DeleteTeamMemberFormProps {
  member: TeamMember;
  onSuccess?: () => void;
  onCancel?: () => void;
  nested?: boolean;
  formId?: string;
  onLoadingChange?: (isLoading: boolean) => void;
}

export default function DeleteTeamMemberForm({
  member,
  onSuccess,
  onCancel,
  nested,
  formId,
  onLoadingChange,
}: DeleteTeamMemberFormProps) {
  const { showAlert } = useAlert();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    onLoadingChange?.(true);
    setErrors([]);

    try {
      const result = await deleteTeamMember(member.id);

      if (result.success) {
        showAlert({
          message: 'Miembro del equipo eliminado exitosamente',
          type: 'success',
          duration: 3000,
        });
        onSuccess?.();
      } else {
        const errorMsg = result.error || 'Error al eliminar el miembro del equipo';
        setErrors([errorMsg]);
        showAlert({
          message: errorMsg,
          type: 'error',
          duration: 5000,
        });
      }
    } catch (error) {
      const errorMsg = 'Error interno del servidor';
      setErrors([errorMsg]);
      showAlert({
        message: errorMsg,
        type: 'error',
        duration: 5000,
      });
    } finally {
      setIsSubmitting(false);
      onLoadingChange?.(false);
    }
  };

  return (
    <DeleteBaseForm
      formId={formId}
      nested={nested}
      message={`¿Estás seguro de que deseas eliminar a "${member.name}"? Esta acción no se puede deshacer.`}
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
      submitLabel="Eliminar miembro"
      errors={errors}
      data-test-id="delete-team-member-form"
      onCancel={onCancel}
      cancelButton={true}
    />
  );
}
