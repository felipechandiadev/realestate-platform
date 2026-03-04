'use client';

import React, { useState } from 'react';
import CreateBaseForm, { BaseFormField } from '@/shared/components/ui/BaseForm/CreateBaseForm';
import { createSlideWithMultimedia } from '@/features/backoffice/cms/actions/slides.action';
import { useAlert } from '@/providers/AlertContext';

interface CreateSlideFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  nested?: boolean;
  formId?: string;
  onLoadingChange?: (isLoading: boolean) => void;
}

export default function CreateSlideForm({ onSuccess, onCancel, nested, formId, onLoadingChange }: CreateSlideFormProps) {
  const { showAlert } = useAlert();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const [values, setValues] = useState<Record<string, any>>({
    title: '',
    description: '',
    linkUrl: '',
    duration: 3,
    startDate: '',
    endDate: '',
    isActive: true,
    multimediaUrl: null,
  });

  const handleFieldChange = (field: string, value: any) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    setErrors([]);
  };

  const validateForm = (formValues: Record<string, any>): string[] => {
    const newErrors: string[] = [];

    if (!formValues.title?.trim()) {
      newErrors.push('El título es requerido');
    } else if (formValues.title.length < 3) {
      newErrors.push('El título debe tener al menos 3 caracteres');
    } else if (formValues.title.length > 255) {
      newErrors.push('El título no puede exceder 255 caracteres');
    }

    if (formValues.linkUrl?.trim() && !formValues.linkUrl.match(/^https?:\/\/.+/)) {
      newErrors.push('La URL debe ser válida (http:// o https://)');
    }

    if (formValues.duration < 1 || formValues.duration > 60) {
      newErrors.push('La duración debe estar entre 1 y 60 segundos');
    }

    if (formValues.startDate && formValues.endDate) {
      const start = new Date(formValues.startDate);
      const end = new Date(formValues.endDate);
      if (start >= end) {
        newErrors.push('La fecha de fin debe ser posterior a la fecha de inicio');
      }
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
      formData.append('title', values.title.trim());
      formData.append('description', values.description || '');

      if (values.linkUrl?.trim()) {
        formData.append('linkUrl', values.linkUrl.trim());
      }

      formData.append('duration', values.duration.toString());
      formData.append('isActive', values.isActive.toString());

      if (values.startDate) formData.append('startDate', values.startDate);
      if (values.endDate) formData.append('endDate', values.endDate);

      if (values.multimediaUrl) {
        formData.append('multimedia', values.multimediaUrl);
      }

      const result = await createSlideWithMultimedia(formData);

      if (result.success) {
        showAlert({
          message: 'Slide creado exitosamente',
          type: 'success',
          duration: 3000,
        });
        onSuccess?.();
      } else {
        const errorMsg = result.error || 'Error al crear el slide';
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
      name: 'title',
      label: 'Título del Slide',
      type: 'text',
      required: true,
    },
    {
      name: 'description',
      label: 'Descripción',
      type: 'textarea',
      rows: 3,
      multiline: true,
    },
    {
      name: 'multimediaUrl',
      label: 'Imagen o Video',
      type: 'image',
      variant: 'banner',
      acceptedTypes: ['image/*', 'video/*'],
      maxSize: 10,
      uploadPath: '/uploads/web/slides',
      buttonText: 'Seleccionar archivo',
    },
    {
      name: 'linkUrl',
      label: 'URL de destino',
      type: 'text',
    },
    {
      name: 'duration',
      label: 'Duración (segundos)',
      type: 'number',
      min: 1,
      max: 60,
    },
    {
      name: 'startDate',
      label: 'Fecha de inicio',
      type: 'text',
    },
    {
      name: 'endDate',
      label: 'Fecha de fin',
      type: 'text',
    },
    {
      name: 'isActive',
      label: 'Slide activo',
      type: 'switch',
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
      submitLabel="Crear Slide"
      errors={errors}
      cancelButton={true}
      cancelButtonText="Cancelar"
      onCancel={onCancel}
      validate={validateForm}
    />
  );
}
