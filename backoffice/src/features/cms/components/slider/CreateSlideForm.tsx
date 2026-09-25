'use client';

import React, { useEffect, useMemo, useState } from 'react';
import CreateBaseForm, { BaseFormFieldGroup } from '@/shared/components/ui/BaseForm/CreateBaseForm';
import { createSlideWithMultimedia } from '@/features/cms/actions/slides.action';
import { useAlert } from '@/providers/AlertContext';
import { HeroBannerPreview } from './HeroBannerPreview';

interface CreateSlideFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  nested?: boolean;
  formId?: string;
  onLoadingChange?: (isLoading: boolean) => void;
}

const HEX_COLOR = /^#[0-9A-Fa-f]{6}$/;
const LINK_PATTERN = /^(https?:\/\/\S+|\/\S*)$/;

export default function CreateSlideForm({ onSuccess, onCancel, nested, formId, onLoadingChange }: CreateSlideFormProps) {
  const { showAlert } = useAlert();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const [values, setValues] = useState<Record<string, any>>({
    title: '',
    description: '',
    linkUrl: '',
    ctaStyle: 'none',
    ctaLabel: '',
    textAlign: 'left',
    overlayOpacity: 45,
    textColor: '',
    ctaButtonBgColor: '',
    ctaButtonTextColor: '',
    ctaLinkColor: '',
    startDate: '',
    endDate: '',
    isActive: true,
    multimediaUrl: null,
  });

  const previewUrl = useMemo(() => {
    if (values.multimediaUrl instanceof File) {
      return URL.createObjectURL(values.multimediaUrl);
    }
    return null;
  }, [values.multimediaUrl]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleFieldChange = (field: string, value: any) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    setErrors([]);
  };

  const validateForm = (formValues: Record<string, any>): string[] => {
    const newErrors: string[] = [];
    const title = formValues.title?.trim() ?? '';

    if (title && (title.length < 3 || title.length > 255)) {
      newErrors.push('El título debe tener entre 3 y 255 caracteres');
    }

    if (formValues.linkUrl?.trim() && !LINK_PATTERN.test(formValues.linkUrl.trim())) {
      newErrors.push('La URL debe ser http(s) o una ruta interna que empiece con /');
    }

    const overlay = Number(formValues.overlayOpacity);
    if (!Number.isFinite(overlay) || overlay < 0 || overlay > 90) {
      newErrors.push('La opacidad del overlay debe estar entre 0 y 90');
    }

    for (const color of [formValues.textColor, formValues.ctaButtonBgColor, formValues.ctaButtonTextColor, formValues.ctaLinkColor]) {
      if (color?.trim() && !HEX_COLOR.test(color.trim())) {
        newErrors.push('Los colores deben ser hex de 6 dígitos, por ejemplo #FFFFFF');
        break;
      }
    }

    if ((formValues.ctaStyle === 'button' || formValues.ctaStyle === 'link') && !formValues.ctaLabel?.trim()) {
      newErrors.push('Escribe el texto de la acción');
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
    if (isSubmitting) return;

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
      formData.append('title', values.title?.trim() || '');
      formData.append('description', values.description || '');
      if (values.linkUrl?.trim()) formData.append('linkUrl', values.linkUrl.trim());
      formData.append('ctaStyle', values.ctaStyle || 'none');
      if (values.ctaLabel?.trim()) formData.append('ctaLabel', values.ctaLabel.trim());
      formData.append('textAlign', values.textAlign || 'left');
      formData.append('overlayOpacity', String(values.overlayOpacity ?? 45));
      if (values.textColor?.trim()) formData.append('textColor', values.textColor.trim());
      if (values.ctaButtonBgColor?.trim()) formData.append('ctaButtonBgColor', values.ctaButtonBgColor.trim());
      if (values.ctaButtonTextColor?.trim()) formData.append('ctaButtonTextColor', values.ctaButtonTextColor.trim());
      if (values.ctaLinkColor?.trim()) formData.append('ctaLinkColor', values.ctaLinkColor.trim());
      formData.append('duration', '3');
      formData.append('isActive', values.isActive.toString());
      if (values.startDate) formData.append('startDate', values.startDate);
      if (values.endDate) formData.append('endDate', values.endDate);
      if (values.multimediaUrl) formData.append('multimedia', values.multimediaUrl);

      const result = await createSlideWithMultimedia(formData);

      if (result.success) {
        showAlert({
          message: 'Slide creado exitosamente',
          type: 'success',
          duration: 3000,
        });
        onSuccess?.();
        return;
      }

      const errorMsg = result.error || 'Error al crear el slide';
      setErrors([errorMsg]);
      showAlert({ message: errorMsg, type: 'error', duration: 5000 });
      setIsSubmitting(false);
      onLoadingChange?.(false);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Error interno del servidor';
      setErrors([errorMsg]);
      showAlert({ message: errorMsg, type: 'error', duration: 5000 });
      setIsSubmitting(false);
      onLoadingChange?.(false);
    }
  };

  const showCta = values.ctaStyle === 'button' || values.ctaStyle === 'link';
  const fields: BaseFormFieldGroup[] = [
    {
      id: 'content',
      title: 'Contenido',
      gap: 16,
      fields: [
        { name: 'title', label: 'Título', type: 'text' },
        { name: 'description', label: 'Mensaje', type: 'textarea', rows: 3, multiline: true },
        { name: 'textColor', label: 'Color del texto (#RRGGBB, vacío = blanco)', type: 'text' },
      ],
    },
    {
      id: 'action',
      title: 'Acción',
      gap: 16,
      fields: [
        {
          name: 'ctaStyle',
          label: 'Tipo de acción',
          type: 'select',
          options: [
            { id: 'none', label: 'Sin acción' },
            { id: 'button', label: 'Botón' },
            { id: 'link', label: 'Enlace' },
          ],
        },
        ...(showCta
          ? [
              { name: 'ctaLabel', label: values.ctaStyle === 'button' ? 'Texto del botón' : 'Texto del enlace', type: 'text' as const },
              { name: 'linkUrl', label: 'URL de destino', type: 'text' as const },
              ...(values.ctaStyle === 'button'
                ? [
                    { name: 'ctaButtonBgColor', label: 'Fondo del botón (#RRGGBB, vacío = primario)', type: 'text' as const },
                    { name: 'ctaButtonTextColor', label: 'Texto del botón (#RRGGBB, vacío = blanco)', type: 'text' as const },
                  ]
                : [
                    { name: 'ctaLinkColor', label: 'Color del enlace (#RRGGBB, vacío = color del texto)', type: 'text' as const },
                  ]),
            ]
          : []),
      ],
    },
    {
      id: 'advanced',
      title: 'Avanzado',
      gap: 16,
      fields: [
        { name: 'overlayOpacity', label: 'Opacidad overlay', type: 'numberStepper', min: 0, max: 90, step: 5 },
        {
          name: 'textAlign',
          label: 'Alineación del texto',
          type: 'select',
          options: [
            { id: 'left', label: 'Izquierda' },
            { id: 'center', label: 'Centro' },
            { id: 'right', label: 'Derecha' },
          ],
        },
      ],
    },
    {
      id: 'publish',
      title: 'Publicación',
      gap: 16,
      fields: [
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
        { name: 'startDate', label: 'Fecha de inicio', type: 'text' },
        { name: 'endDate', label: 'Fecha de fin', type: 'text' },
        { name: 'isActive', label: 'Slide activo', type: 'switch' },
      ],
    },
  ];

  return (
    <div className="space-y-4">
      <HeroBannerPreview
        slide={{
          title: values.title,
          description: values.description,
          linkUrl: values.linkUrl,
          ctaLabel: values.ctaLabel,
          ctaStyle: values.ctaStyle,
          textAlign: values.textAlign,
          overlayOpacity: Number(values.overlayOpacity),
          textColor: values.textColor,
          ctaButtonBgColor: values.ctaButtonBgColor,
          ctaButtonTextColor: values.ctaButtonTextColor,
          ctaLinkColor: values.ctaLinkColor,
        }}
        mediaUrl={previewUrl}
      />
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
    </div>
  );
}
