'use client';

import React, { useState } from 'react';
import UpdateBaseForm, { BaseUpdateFormField } from '@/shared/components/ui/BaseForm/UpdateBaseForm';
import { updateTeamMember, type TeamMember } from '@/features/backoffice/cms/actions/ourTeam.action';
import { useAlert } from '@/providers/AlertContext';

interface UpdateTeamMemberFormProps {
  member: TeamMember;
  onSuccess?: () => void;
  onCancel?: () => void;
  nested?: boolean;
  formId?: string;
  onLoadingChange?: (isLoading: boolean) => void;
}

interface TeamMemberFormData {
  [key: string]: any;
  name: string;
  position: string;
  bio: string;
  mail: string;
  phone: string;
  photo: File | null;
}

export default function UpdateTeamMemberForm({
  member,
  onSuccess,
  onCancel,
  nested,
  formId,
  onLoadingChange,
}: UpdateTeamMemberFormProps) {
  const { showAlert } = useAlert();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const initialState: TeamMemberFormData = {
    name: member.name || '',
    position: member.position || '',
    bio: member.bio || '',
    mail: member.mail || '',
    phone: member.phone || '',
    photo: null,
  };

  const validateForm = (values: TeamMemberFormData): string[] => {
    const newErrors: string[] = [];

    const normalizedName = values.name?.trim() ?? '';
    if (!normalizedName) {
      newErrors.push('El nombre es requerido');
    } else if (normalizedName.length < 2) {
      newErrors.push('El nombre debe tener al menos 2 caracteres');
    } else if (normalizedName.length > 100) {
      newErrors.push('El nombre no puede exceder 100 caracteres');
    }

    const normalizedPosition = values.position?.trim() ?? '';
    if (!normalizedPosition) {
      newErrors.push('La posición es requerida');
    } else if (normalizedPosition.length > 100) {
      newErrors.push('La posición no puede exceder 100 caracteres');
    }

    if (values.bio && values.bio.length > 500) {
      newErrors.push('La biografía no puede exceder 500 caracteres');
    }

    if (values.mail?.trim() && !values.mail.includes('@')) {
      newErrors.push('El email debe ser válido');
    }

    return newErrors;
  };

  const handleSubmit = async (values: any) => {
    const validationErrors = validateForm(values);
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      showAlert({
        message: 'Por favor corrige los errores del formulario',
        type: 'error',
        duration: 4000,
      });
      return;
    }

    setIsSubmitting(true);
    onLoadingChange?.(true);
    setErrors([]);

    try {
      const normalizedName = values.name.trim();
      const normalizedPosition = values.position.trim();
      const normalizedBio = typeof values.bio === 'string' ? values.bio.trim() : '';
      const normalizedMail = values.mail?.trim() || '';
      const normalizedPhone = values.phone?.trim() || '';

      // Detectar cambios
      const updatePayload: Record<string, unknown> = {};

      if (normalizedName !== member.name) updatePayload.name = normalizedName;
      if (normalizedPosition !== member.position) updatePayload.position = normalizedPosition;
      if (normalizedBio !== (member.bio ?? '')) updatePayload.bio = normalizedBio || null;
      if (normalizedMail !== (member.mail ?? '')) updatePayload.mail = normalizedMail || null;
      if (normalizedPhone !== (member.phone ?? '')) updatePayload.phone = normalizedPhone || null;

      // Si no hay cambios y no hay nueva foto, no hacer nada
      if (Object.keys(updatePayload).length === 0 && !values.photo) {
        showAlert({
          message: 'No hay cambios para guardar',
          type: 'info',
          duration: 3000,
        });
        setIsSubmitting(false);
        onLoadingChange?.(false);
        return;
      }

      const formData = new FormData();

      // Agregar campos modificados
      Object.entries(updatePayload).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, String(value));
        }
      });

      // Agregar foto si existe
      if (values.photo instanceof File) {
        formData.append('photo', values.photo);
      }

      const result = await updateTeamMember(member.id, formData);

      if (result.success) {
        showAlert({
          message: 'Miembro del equipo actualizado exitosamente',
          type: 'success',
          duration: 3000,
        });
        onSuccess?.();
      } else {
        const errorMsg = result.error || 'Error al actualizar el miembro del equipo';
        setErrors([errorMsg]);
        showAlert({
          message: errorMsg,
          type: 'error',
          duration: 5000,
        });
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Error interno del servidor';
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

  const fields: BaseUpdateFormField[] = [
    {
      name: 'photo',
      label: 'Foto del miembro',
      type: 'avatar',
      variant: 'avatar',
      currentUrl: member.multimediaUrl,
      currentType: 'image',
      acceptedTypes: ['image/*'],
      maxSize: 5,
    },
    {
      name: 'name',
      label: 'Nombre',
      type: 'text',
      required: true,
    },
    {
      name: 'position',
      label: 'Posición',
      type: 'text',
      required: true,
    },
    {
      name: 'mail',
      label: 'Email',
      type: 'email',
    },
    {
      name: 'phone',
      label: 'Teléfono',
      type: 'text',
    },
    {
      name: 'bio',
      label: 'Biografía',
      type: 'textarea',
      rows: 3,
      multiline: true,
    },
  ];

  return (
    <UpdateBaseForm
      formId={formId}
      nested={nested}
      fields={fields}
      initialState={initialState}
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
      submitLabel="Actualizar miembro"
      errors={errors}
      data-test-id="update-team-member-form"
      onCancel={onCancel}
      cancelButton={true}
    />
  );
}
