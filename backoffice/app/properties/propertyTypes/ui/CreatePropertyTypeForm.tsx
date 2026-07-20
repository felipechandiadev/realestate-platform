'use client';

import React, { useState } from 'react';
import CreateBaseForm, { BaseFormField } from '@/shared/components/ui/BaseForm/CreateBaseForm';
import { createPropertyType } from '@/features/shared/propertyTypes/actions/propertyTypes.action';
import { useAlert } from '@/providers/AlertContext';
import { useRouter } from 'next/navigation';

interface CreatePropertyTypeFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function CreatePropertyTypeForm({ onSuccess, onCancel }: CreatePropertyTypeFormProps) {
  const alert = useAlert();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    hasBedrooms: false,
    hasBathrooms: false,
    hasBuiltSquareMeters: false,
    hasLandSquareMeters: false,
    hasParkingSpaces: false,
    hasFloors: false,
    hasConstructionYear: false,
  });

  const fields: BaseFormField[] = [
    {
      name: 'name',
      label: 'Nombre del tipo de propiedad',
      type: 'text',
      required: true,
      autoFocus: true,
    },
    {
      name: 'description',
      label: 'Descripción',
      type: 'textarea',
      multiline: true,
      rows: 3,
    },
    {
      name: 'hasBedrooms',
      label: 'Dormitorios',
      type: 'switch',
      labelPosition: 'right',
    },
    {
      name: 'hasBathrooms',
      label: 'Baños',
      type: 'switch',
      labelPosition: 'right',
    },
    {
      name: 'hasBuiltSquareMeters',
      label: 'M² Construidos',
      type: 'switch',
      labelPosition: 'right',
    },
    {
      name: 'hasLandSquareMeters',
      label: 'M² Terreno',
      type: 'switch',
      labelPosition: 'right',
    },
    {
      name: 'hasParkingSpaces',
      label: 'Estacionamientos',
      type: 'switch',
      labelPosition: 'right',
    },
    {
      name: 'hasFloors',
      label: 'Pisos',
      type: 'switch',
      labelPosition: 'right',
    },
    {
      name: 'hasConstructionYear',
      label: 'Año Construcción',
      type: 'switch',
      labelPosition: 'right',
    },
  ];

  const handleFieldChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    // Clear errors when user starts typing
    if (errors.length > 0) {
      setErrors([]);
    }
  };

  const handleSubmit = async () => {
    // Basic validation
    if (!formData.name.trim()) {
      setErrors(['El nombre es obligatorio']);
      return;
    }

    setIsSubmitting(true);
    setErrors([]);

    try {
      await createPropertyType(formData);
      alert.success('Tipo de propiedad creado exitosamente');

      // Reset form
      setFormData({
        name: '',
        description: '',
        hasBedrooms: false,
        hasBathrooms: false,
        hasBuiltSquareMeters: false,
        hasLandSquareMeters: false,
        hasParkingSpaces: false,
        hasFloors: false,
        hasConstructionYear: false,
      });

      // Call success callback or refresh page
      if (onSuccess) {
        onSuccess();
      } else {
        router.refresh();
      }
    } catch (error) {
      console.error('Error creating property type:', error);
      alert.error('Error al crear el tipo de propiedad. Por favor, inténtalo de nuevo.');
      setErrors(['Error al crear el tipo de propiedad']);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <CreateBaseForm
        title="Crear Nuevo Tipo de Propiedad"
        subtitle="Configure las características que tendrán las propiedades de este tipo"
        fields={fields}
        values={formData}
        onChange={handleFieldChange}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        submitLabel="Crear Tipo de Propiedad"
        errors={errors}
        columns={1}
        cancelButton={!!onCancel}
        cancelButtonText="Cancelar"
        onCancel={onCancel}
        data-test-id="create-property-type-form"
      />
    </div>
  );
}
