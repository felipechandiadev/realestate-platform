'use client';

import React, { useState } from 'react';
import UpdateBaseForm, { BaseUpdateFormFieldGroup } from '@/shared/components/ui/BaseForm/UpdateBaseForm';
import { updateSlideWithMultimedia, updateSlide } from '@/features/cms/actions/slides.action';
import type { Slide } from '@/features/cms/actions/slides.action';
import { useAlert } from '@/providers/AlertContext';
import { HeroBannerPreview } from './HeroBannerPreview';

interface UpdateSlideFormProps {
  slide: Slide;
  onSuccess?: () => void;
  onCancel?: () => void;
  nested?: boolean;
  formId?: string;
  onLoadingChange?: (isLoading: boolean) => void;
}

const HEX_COLOR = /^#[0-9A-Fa-f]{6}$/;
const LINK_PATTERN = /^(https?:\/\/\S+|\/\S*)$/;

export default function UpdateSlideForm({ slide, onSuccess, onCancel, nested, formId, onLoadingChange }: UpdateSlideFormProps) {
  const { showAlert } = useAlert();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const initialState = {
    title: slide.title || '',
    description: slide.description || '',
    linkUrl: slide.linkUrl || '',
    ctaStyle: slide.ctaStyle || 'none',
    ctaLabel: slide.ctaLabel || '',
    textAlign: slide.textAlign || 'left',
    overlayOpacity: slide.overlayOpacity ?? 45,
    textColor: slide.textColor || '',
    ctaButtonBgColor: slide.ctaButtonBgColor || '',
    ctaButtonTextColor: slide.ctaButtonTextColor || '',
    ctaLinkColor: slide.ctaLinkColor || '',
    startDate: slide.startDate?.split('T')[0] || '',
    endDate: slide.endDate?.split('T')[0] || '',
    isActive: slide.isActive ?? true,
    multimediaUrl: slide.multimediaUrl || '',
    multimediaUrlFile: null as File | null,
  };

  const [preview, setPreview] = useState(initialState);

  const validateForm = (values: typeof initialState): string[] => {
    const newErrors: string[] = [];
    const title = values.title?.trim() ?? '';
    if (title && (title.length < 3 || title.length > 255)) {
      newErrors.push('El título debe tener entre 3 y 255 caracteres');
    }
    if (values.linkUrl?.trim() && !LINK_PATTERN.test(values.linkUrl.trim())) {
      newErrors.push('La URL debe ser http(s) o una ruta interna que empiece con /');
    }
    const overlay = Number(values.overlayOpacity);
    if (!Number.isFinite(overlay) || overlay < 0 || overlay > 90) {
      newErrors.push('La opacidad del overlay debe estar entre 0 y 90');
    }
    for (const color of [values.textColor, values.ctaButtonBgColor, values.ctaButtonTextColor, values.ctaLinkColor]) {
      if (typeof color === 'string' && color.trim() && !HEX_COLOR.test(color.trim())) {
        newErrors.push('Los colores deben ser hex de 6 dígitos, por ejemplo #FFFFFF');
        break;
      }
    }
    if ((values.ctaStyle === 'button' || values.ctaStyle === 'link') && !values.ctaLabel?.trim()) {
      newErrors.push('Escribe el texto de la acción');
    }
    if (values.startDate && values.endDate && new Date(values.startDate) >= new Date(values.endDate)) {
      newErrors.push('La fecha de fin debe ser posterior a la fecha de inicio');
    }
    return newErrors;
  };

  const handleSubmit = async (values: any) => {
    if (isSubmitting) return;
    const validationErrors = validateForm(values);
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      showAlert({ message: 'Por favor corrige los errores del formulario', type: 'error', duration: 4000 });
      return;
    }

    setIsSubmitting(true);
    onLoadingChange?.(true);
    setErrors([]);

    try {
      const link = values.linkUrl?.trim() || null;
      const payload = {
        title: values.title?.trim() || null,
        description: values.description || null,
        linkUrl: link,
        ctaStyle: values.ctaStyle || 'none',
        ctaLabel: values.ctaLabel?.trim() || null,
        textAlign: values.textAlign || 'left',
        overlayOpacity: Number(values.overlayOpacity ?? 45),
        textColor: values.textColor?.trim() || null,
        ctaButtonBgColor: values.ctaButtonBgColor?.trim() || null,
        ctaButtonTextColor: values.ctaButtonTextColor?.trim() || null,
        ctaLinkColor: values.ctaLinkColor?.trim() || null,
        startDate: values.startDate?.trim() || null,
        endDate: values.endDate?.trim() || null,
        isActive: values.isActive,
      };

      let result;
      if (values.multimediaUrlFile) {
        const formData = new FormData();
        Object.entries(payload).forEach(([key, value]) => {
          if (value !== undefined && value !== null) formData.append(key, String(value));
        });
        if (!formData.has('title')) formData.append('title', '');
        if (!formData.has('linkUrl') && link === null) formData.append('linkUrl', '');
        formData.append('multimedia', values.multimediaUrlFile);
        result = await updateSlideWithMultimedia(slide.id, formData);
      } else {
        result = await updateSlide(slide.id, payload as any);
      }

      if (result.success) {
        showAlert({ message: 'Slide actualizado exitosamente', type: 'success', duration: 3000 });
        onSuccess?.();
        return;
      }

      const errorMsg = result.error || 'Error al actualizar el slide';
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

  const showCta = preview.ctaStyle === 'button' || preview.ctaStyle === 'link';
  const fields: BaseUpdateFormFieldGroup[] = [
    {
      id: 'content',
      title: 'Contenido',
      fields: [
        { name: 'title', label: 'Título', type: 'text' },
        { name: 'description', label: 'Mensaje', type: 'textarea', rows: 3, multiline: true },
        { name: 'textColor', label: 'Color del texto (#RRGGBB, vacío = blanco)', type: 'text' },
      ],
    },
    {
      id: 'action',
      title: 'Acción',
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
              { name: 'ctaLabel', label: preview.ctaStyle === 'button' ? 'Texto del botón' : 'Texto del enlace', type: 'text' as const },
              { name: 'linkUrl', label: 'URL de destino', type: 'text' as const },
              ...(preview.ctaStyle === 'button'
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
      fields: [
        {
          name: 'multimediaUrl',
          label: 'Imagen o Video',
          type: 'image',
          variant: 'banner',
          currentUrl: slide.multimediaUrl,
          currentType: slide.multimediaUrl && /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(slide.multimediaUrl) ? 'video' : 'image',
          acceptedTypes: ['image/*', 'video/*'],
          maxSize: 60,
          aspectRatio: '16:9',
          previewSize: 'lg',
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
          title: preview.title,
          description: preview.description,
          linkUrl: preview.linkUrl,
          ctaLabel: preview.ctaLabel,
          ctaStyle: preview.ctaStyle as Slide['ctaStyle'],
          textAlign: preview.textAlign as Slide['textAlign'],
          overlayOpacity: Number(preview.overlayOpacity),
          textColor: preview.textColor,
          ctaButtonBgColor: preview.ctaButtonBgColor,
          ctaButtonTextColor: preview.ctaButtonTextColor,
          ctaLinkColor: preview.ctaLinkColor,
          multimediaUrl: typeof preview.multimediaUrl === 'string' ? preview.multimediaUrl : slide.multimediaUrl,
        }}
      />
      <UpdateBaseForm
        formId={formId}
        nested={nested}
        fields={fields}
        initialState={initialState}
        onChange={(field, value) => setPreview((current) => ({ ...current, [field]: value }))}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        errors={errors}
        submitLabel="Actualizar Slide"
        cancelButton={true}
        cancelButtonText="Cancelar"
        onCancel={onCancel}
      />
    </div>
  );
}
