'use client';

import React, { useState } from 'react';
import DeleteBaseForm from '@/shared/components/ui/BaseForm/DeleteBaseForm';
import { deletePropertyType } from '@/features/shared/propertyTypes/actions/propertyTypes.action';
import { useAlert } from '@/providers/AlertContext';
import type { PropertyType } from './PropertyTypeCard';

interface DeletePropertyTypeFormProps {
  propertyType: PropertyType;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function DeletePropertyTypeForm({ propertyType, onSuccess, onCancel }: DeletePropertyTypeFormProps) {
  const alert = useAlert();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const handleSubmit = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    setErrors([]);

    try {
      await deletePropertyType(propertyType.id);

      alert.success(`Tipo de propiedad "${propertyType.name}" eliminado exitosamente`);

      if (onSuccess) {
        onSuccess();
      }
      // Keep submitting true until dialog closes / remounts.
    } catch (error) {
      console.error('Error deleting property type:', error);
      alert.error('Error al eliminar el tipo de propiedad. Por favor, inténtalo de nuevo.');
      setErrors(['Error al eliminar el tipo de propiedad']);
      setIsSubmitting(false);
    }
  };

  const message = `¿Estás seguro de que deseas eliminar el tipo de propiedad "${propertyType.name}"? Esta acción no se puede deshacer.`;

  return (
    <DeleteBaseForm
      title=""
      subtitle="Esta acción eliminará permanentemente el tipo de propiedad"
      message={message}
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
      submitLabel="Eliminar"
      errors={errors}
      data-test-id="delete-property-type-form"
      cancelButton={Boolean(onCancel)}
      cancelButtonText="Cancelar"
      onCancel={onCancel}
    />
  );
}
