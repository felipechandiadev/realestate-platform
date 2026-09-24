'use client';

import React, { useState } from 'react';
import UpdateBaseForm, { BaseUpdateFormField } from '@/shared/components/ui/BaseForm/UpdateBaseForm';
import { updateSlideWithMultimedia, updateSlide } from '@/features/backoffice/cms/actions/slides.action';
import type { Slide } from '@/features/backoffice/cms/actions/slides.action';
import { useAlert } from '@/providers/AlertContext';

interface UpdateSlideFormProps {
  slide: Slide;
  onSuccess?: () => void;
  onCancel?: () => void;
  nested?: boolean;
  formId?: string;
  onLoadingChange?: (isLoading: boolean) => void;
}

interface SlideFormData {
  [key: string]: any;
  title: string;
  description: string;
  linkUrl: string;
  duration: number | string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  multimediaUrl: string;
  multimediaUrlFile: File | null;
}

export default function UpdateSlideForm({ slide, onSuccess, onCancel, nested, formId, onLoadingChange }: UpdateSlideFormProps) {
  const { showAlert } = useAlert();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const initialState: SlideFormData = {
    title: slide.title || '',
    description: slide.description || '',
    linkUrl: slide.linkUrl || '',
    duration: slide.duration || 3,
    startDate: slide.startDate?.split('T')[0] || '',
    endDate: slide.endDate?.split('T')[0] || '',
    isActive: slide.isActive ?? true,
    multimediaUrl: slide.multimediaUrl || '',
    multimediaUrlFile: null,
  };

  const normalizeLinkUrl = (input: string): string | null => {
    const trimmed = (input ?? '').trim();

    if (!trimmed) {
      return null;
    }

    if (trimmed.startsWith('/') && typeof window !== 'undefined') {
      try {
        const resolved = new URL(trimmed, window.location.origin);
        return resolved.toString();
      } catch {
        return null;
      }
    }

    return trimmed;
  };

  const validateForm = (values: SlideFormData): string[] => {
    const newErrors: string[] = [];

    const normalizedTitle = values.title?.trim() ?? '';
    if (!normalizedTitle) {
      newErrors.push('El título es requerido');
    } else if (normalizedTitle.length < 3) {
      newErrors.push('El título debe tener al menos 3 caracteres');
    }

    if (values.linkUrl?.trim()) {
      const normalizedUrl = normalizeLinkUrl(values.linkUrl);
      if (!normalizedUrl) {
        newErrors.push('La URL debe ser válida (http://, https:// o comenzar con /)');
      }
    }

    const durationNumber = Number(values.duration);
    if (!Number.isFinite(durationNumber)) {
      newErrors.push('La duración debe ser un número válido');
    } else if (durationNumber < 1 || durationNumber > 60) {
      newErrors.push('La duración debe estar entre 1 y 60 segundos');
    }

    if (values.startDate && values.endDate) {
      const start = new Date(values.startDate);
      const end = new Date(values.endDate);
      if (start >= end) {
        newErrors.push('La fecha de fin debe ser posterior a la fecha de inicio');
      }
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
      const normalizedTitle = values.title.trim();
      const normalizedDescription = typeof values.description === 'string' ? values.description : '';
      const normalizedLinkUrl = normalizeLinkUrl(values.linkUrl);
      const durationNumber = Number(values.duration);
      const normalizedStartDate = values.startDate?.trim() || null;
      const normalizedEndDate = values.endDate?.trim() || null;

      const initialStartDate = slide.startDate ? slide.startDate.split('T')[0] : null;
      const initialEndDate = slide.endDate ? slide.endDate.split('T')[0] : null;
      const resolvedLinkForComparison = slide.linkUrl ?? null;
      const shouldClearLink = resolvedLinkForComparison !== null && normalizedLinkUrl === null;

      const updatePayload: Record<string, unknown> = {};

      if (normalizedTitle !== slide.title) updatePayload.title = normalizedTitle;
      if (normalizedDescription !== (slide.description ?? '')) updatePayload.description = normalizedDescription || null;
      if (normalizedLinkUrl !== resolvedLinkForComparison) updatePayload.linkUrl = normalizedLinkUrl;
      if (Number.isFinite(durationNumber) && durationNumber !== slide.duration) updatePayload.duration = durationNumber;
      if (normalizedStartDate !== initialStartDate) updatePayload.startDate = normalizedStartDate;
      if (normalizedEndDate !== initialEndDate) updatePayload.endDate = normalizedEndDate;
      if (typeof values.isActive === 'boolean' && values.isActive !== slide.isActive) updatePayload.isActive = values.isActive;

      let result;

      if (values.multimediaUrlFile) {
        const formData = new FormData();

        Object.entries(updatePayload).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            formData.append(key, String(value));
          }
        });

        if (!formData.has('title')) formData.append('title', normalizedTitle);
        if (!formData.has('isActive')) formData.append('isActive', String(values.isActive));
        if (!formData.has('duration') && Number.isFinite(durationNumber)) formData.append('duration', String(durationNumber));

        if (!formData.has('linkUrl')) {
          if (normalizedLinkUrl) {
            formData.append('linkUrl', normalizedLinkUrl);
          } else if (shouldClearLink) {
            formData.append('linkUrl', '');
          }
        }

        if (!formData.has('startDate') && normalizedStartDate) formData.append('startDate', normalizedStartDate);
        if (!formData.has('endDate') && normalizedEndDate) formData.append('endDate', normalizedEndDate);

        formData.append('multimedia', values.multimediaUrlFile);
        result = await updateSlideWithMultimedia(slide.id, formData);
      } else {
        if (Object.keys(updatePayload).length === 0) {
          showAlert({
            message: 'No se detectaron cambios para actualizar',
            type: 'info',
            duration: 3000,
          });
          setIsSubmitting(false);
           onLoadingChange?.(false);
          return;
        }

        result = await updateSlide(slide.id, updatePayload as any);
      }

      if (result.success) {
        showAlert({
          message: 'Slide actualizado exitosamente',
          type: 'success',
          duration: 3000,
        });
        onSuccess?.();
      } else {
        const errorMsg = result.error || 'Error al actualizar el slide';
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
      required: false,
      currentUrl: slide.multimediaUrl,
      currentType: slide.multimediaUrl?.includes('.mp4') || slide.multimediaUrl?.includes('.webm') ? 'video' : 'image',
      acceptedTypes: ['image/*', 'video/*'],
      maxSize: 60,
      aspectRatio: '16:9',
      previewSize: 'lg',
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
    <UpdateBaseForm
      formId={formId}
      nested={nested}
      fields={fields}
      initialState={initialState}
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
      errors={errors}
      submitLabel="Actualizar Slide"
      cancelButton={true}
      cancelButtonText="Cancelar"
      onCancel={onCancel}
    />
  );
}
