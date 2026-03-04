'use client';

import React, { useState } from 'react';
import CreateBaseForm, { BaseFormField } from '@/shared/components/ui/BaseForm/CreateBaseForm';
import { createTeamMember } from '@/features/backoffice/cms/actions/ourTeam.action';
import { useAlert } from '@/providers/AlertContext';

interface CreateTeamMemberFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  nested?: boolean;
  formId?: string;
  onLoadingChange?: (isLoading: boolean) => void;
}

export default function CreateTeamMemberForm({
  onSuccess,
  onCancel,
  nested,
  formId,
  onLoadingChange,
}: CreateTeamMemberFormProps) {
  const { showAlert } = useAlert();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const [values, setValues] = useState<Record<string, any>>({
    name: '',
    position: '',
    bio: '',
    mail: '',
    phone: '',
    photo: null,
  });

  const handleFieldChange = (field: string, value: any) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    setErrors([]);
  };

  const validateForm = (formValues: Record<string, any>): string[] => {
    const newErrors: string[] = [];

    if (!formValues.name?.trim()) {
      newErrors.push('El nombre es requerido');
    } else if (formValues.name.length < 2) {
      newErrors.push('El nombre debe tener al menos 2 caracteres');
    } else if (formValues.name.length > 100) {
      newErrors.push('El nombre no puede exceder 100 caracteres');
    }

    if (!formValues.position?.trim()) {
      newErrors.push('La posición es requerida');
    } else if (formValues.position.length > 100) {
      newErrors.push('La posición no puede exceder 100 caracteres');
    }

    if (formValues.bio && formValues.bio.length > 500) {
      newErrors.push('La biografía no puede exceder 500 caracteres');
    }

    if (formValues.mail?.trim() && !formValues.mail.includes('@')) {
      newErrors.push('El email debe ser válido');
    }

    if (!formValues.photo || (Array.isArray(formValues.photo) && formValues.photo.length === 0)) {
      newErrors.push('La foto es requerida');
    }

    return newErrors;
  };

  const handleSubmit = async () => {
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
      const formData = new FormData();
      formData.append('name', values.name.trim());
      formData.append('position', values.position.trim());
      formData.append('bio', values.bio?.trim() || '');

      if (values.mail?.trim()) {
        formData.append('mail', values.mail.trim());
      }

      if (values.phone?.trim()) {
        formData.append('phone', values.phone.trim());
      }

      // Manejar archivo de foto
      const photoFile = Array.isArray(values.photo) ? values.photo[0] : values.photo;
      if (photoFile instanceof File) {
        formData.append('photo', photoFile);
      }

      const result = await createTeamMember(formData);

      if (result.success) {
        showAlert({
          message: 'Miembro del equipo creado exitosamente',
          type: 'success',
          duration: 3000,
        });
        onSuccess?.();
      } else {
        const errorMsg = result.error || 'Error al crear el miembro del equipo';
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

  const fields: BaseFormField[] = [
    {
      name: 'photo',
      label: 'Foto del miembro',
      type: 'avatar',
      required: true,
      variant: 'avatar',
      acceptedTypes: ['image/*'],
      maxSize: 5,
      uploadPath: '/public/web/team-members',
      buttonText: 'Subir foto',
    },
    {
      name: 'name',
      label: 'Nombre',
      type: 'text',
      required: true,
      autoFocus: true,
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
    <CreateBaseForm
      formId={formId}
      nested={nested}
      fields={fields}
      values={values}
      onChange={handleFieldChange}
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
      submitLabel="Crear miembro"
      errors={errors}
      data-test-id="create-team-member-form"
      onCancel={onCancel}
      cancelButton={true}
      validate={validateForm}
    />
  );
}
