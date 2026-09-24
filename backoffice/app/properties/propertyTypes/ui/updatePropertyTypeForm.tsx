'use client';

import React, { useMemo, useState } from 'react';
import UpdateBaseForm, { BaseUpdateFormField } from '@/shared/components/ui/BaseForm/UpdateBaseForm';
import { updatePropertyType } from '@/features/shared/propertyTypes/actions/propertyTypes.action';
import { useAlert } from '@/providers/AlertContext';
import type { PropertyType } from './PropertyTypeCard';

interface UpdatePropertyTypeFormProps {
  propertyType: PropertyType;
  onSuccess?: () => void;
  onCancel?: () => void;
  formId?: string;
  onLoadingChange?: (loading: boolean) => void;
}

const fields: BaseUpdateFormField[] = [
  {
    name: 'name',
    label: 'Nombre del tipo de propiedad',
    type: 'text',
    required: true,
  },
  {
    name: 'description',
    label: 'Descripción',
    type: 'textarea',
    multiline: true,
    rows: 3,
  },
];

export default function UpdatePropertyTypeForm({
  propertyType,
  onSuccess,
  onCancel,
  formId,
  onLoadingChange,
}: UpdatePropertyTypeFormProps) {
  const alert = useAlert();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const initialState = useMemo(
    () => ({
      name: propertyType.name ?? '',
      description: propertyType.description || '',
    }),
    [propertyType.id, propertyType.name, propertyType.description],
  );

  const setSubmitting = (value: boolean) => {
    setIsSubmitting(value);
    onLoadingChange?.(value);
  };

  const handleSubmit = async (values: Record<string, any>) => {
    if (isSubmitting) return;

    if (!values.name?.trim()) {
      setErrors(['El nombre es obligatorio']);
      return;
    }

    setSubmitting(true);
    setErrors([]);

    try {
      await updatePropertyType(propertyType.id, {
        name: values.name.trim(),
        description: values.description?.trim() || undefined,
      });

      alert.success('Tipo de propiedad actualizado exitosamente');
      onSuccess?.();
    } catch (error) {
      console.error('Error updating property type:', error);
      alert.error('Error al actualizar el tipo de propiedad. Por favor, inténtalo de nuevo.');
      setErrors(['Error al actualizar el tipo de propiedad']);
      setSubmitting(false);
    }
  };

  return (
    <UpdateBaseForm
      fields={fields}
      initialState={initialState}
      onSubmit={handleSubmit}
      onCancel={onCancel}
      isSubmitting={isSubmitting}
      submitLabel="Actualizar"
      cancelButton={Boolean(onCancel)}
      cancelButtonText="Cancelar"
      errors={errors}
      columns={1}
      nested
      formId={formId}
      data-test-id="update-property-type-form"
    />
  );
}
