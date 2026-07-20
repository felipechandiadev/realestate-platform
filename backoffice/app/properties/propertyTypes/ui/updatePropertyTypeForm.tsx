'use client';

import React, { useState } from 'react';
import UpdateBaseForm, { BaseUpdateFormField } from '@/shared/components/ui/BaseForm/UpdateBaseForm';
import { updatePropertyType } from '@/features/shared/propertyTypes/actions/propertyTypes.action';
import { useAlert } from '@/providers/AlertContext';
import type { PropertyType } from './PropertyTypeCard';

interface UpdatePropertyTypeFormProps {
  propertyType: PropertyType;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function UpdatePropertyTypeForm({ propertyType, onSuccess, onCancel }: UpdatePropertyTypeFormProps) {
  const alert = useAlert();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

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

  const initialState = {
    name: propertyType.name,
    description: propertyType.description || '',
  };

  const handleSubmit = async (values: Record<string, any>) => {
    // Basic validation
    if (!values.name?.trim()) {
      setErrors(['El nombre es obligatorio']);
      return;
    }

    setIsSubmitting(true);
    setErrors([]);

    try {
      await updatePropertyType(propertyType.id, {
        name: values.name.trim(),
        description: values.description?.trim() || undefined,
      });

      alert.success('Tipo de propiedad actualizado exitosamente');

      // Call success callback
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error updating property type:', error);
      alert.error('Error al actualizar el tipo de propiedad. Por favor, inténtalo de nuevo.');
      setErrors(['Error al actualizar el tipo de propiedad']);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <UpdateBaseForm
        title="Actualizar Tipo de Propiedad"
        subtitle="Modifique el nombre y descripción del tipo de propiedad"
        fields={fields}
        initialState={initialState}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        submitLabel="Actualizar Tipo de Propiedad"
        errors={errors}
        columns={1}
        data-test-id="update-property-type-form"
      />
    </div>
  );
}
