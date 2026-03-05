'use client';

import React, { useMemo } from 'react';
import { useEffect, useState } from 'react';
import { useCreatePropertyForm } from '@/app/backOffice/properties/hooks/useCreatePropertyForm';
import { StepperBaseForm } from '@/shared/components/ui/BaseForm';
import {
  getBasicInfoFields,
  getPropertyDetailsFields,
  getLocationFields,
  getMultimediaFields,
  getSeoFields,
  getInternalNotesFields,
  PropertyFormData
} from './propertyFormFields';
import Alert from '@/shared/components/ui/Alert/Alert';

interface CreatePropertyProps {
  open?: boolean;
  onClose?: () => void;
  size?: string;
}

export default function CreateProperty({
  open = true,
  onClose,
  size,
}: CreatePropertyProps) {
  const [detectedCoords, setDetectedCoords] = useState<{ initialLat?: number; initialLng?: number } | null>(null);
  const {
    formData,
    propertyTypes,
    loadingTypes,
    stateOptions,
    loadingStates,
    cityOptions,
    loadingCities,
    selectedPropertyType,
    isSubmitting,
    submitError,
    handleChange,
    handleSubmit: handleFormSubmit,
  } = useCreatePropertyForm(onClose);

  // Attempt to detect user's location on mount and prefill coordinates when creating a new property
  useEffect(() => {
    // Only attempt detection when there is no coordinates already in formData
    // and when geolocation is available
    if (typeof window === 'undefined') return;
    if (!navigator?.geolocation) return;
    // If form already has coordinates, skip
    // @ts-ignore - coordinates may be undefined on initial state
    if ((formData as any).coordinates) return;

    let mounted = true;
    const options: PositionOptions = { enableHighAccuracy: false, timeout: 5000, maximumAge: 0 };
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        if (!mounted) return;
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setDetectedCoords({ initialLat: lat, initialLng: lng });
        // Also populate the form value so the location marker is set immediately
        handleChange('coordinates', { lat, lng });
      },
      (err) => {
        // ignore permission denied or other errors gracefully
        console.warn('[CreateProperty] Geolocation failed or denied:', err?.message || err);
      },
      options
    );

    return () => { mounted = false; };
  }, [formData, handleChange]);

  // Definir los pasos del stepper
  const steps = useMemo(() => [
    {
      title: 'Información Básica',
      description: 'Título, descripción, tipo y precio de la propiedad',
      columns: 2,
      fields: getBasicInfoFields(propertyTypes),
    },
    {
      title: 'Detalles de la Propiedad',
      description: 'Características específicas según el tipo de propiedad',
      fields: getPropertyDetailsFields(selectedPropertyType),
    },
    {
      title: 'Ubicación',
      description: 'Estado, ciudad, dirección y coordenadas',
      fields: getLocationFields(stateOptions, cityOptions, formData.state?.id, detectedCoords ?? undefined),
    },
    {
      title: 'Multimedia',
      description: 'Imágenes y videos de la propiedad',
      fields: getMultimediaFields(),
    },
    {
      title: 'SEO y Marketing',
      description: 'Optimización para motores de búsqueda',
      fields: getSeoFields(),
    },
    {
      title: 'Notas Internas',
      description: 'Información adicional para el equipo interno',
      fields: getInternalNotesFields(),
    },
  ], [propertyTypes, selectedPropertyType, stateOptions, cityOptions, formData.state?.id]);

  const handleSubmit = async () => {
    await handleFormSubmit();
  };

  // Mostrar loading si están cargando los tipos de propiedad o estados
  if (loadingTypes || loadingStates) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Cargando datos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">

      {submitError && (
        <div className="mb-6">
          <Alert variant="error">
            {submitError}
          </Alert>
        </div>
      )}

      <StepperBaseForm
       title='Crear Propiedad'
        steps={steps}
        values={formData as unknown as Record<string, unknown>}
        onChange={handleChange}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        submitLabel="Crear Propiedad"
        cancelButton={true}
        cancelButtonText="Cancelar"
        onCancel={onClose}
   
      />
    </div>
  );
}
