'use client';

import { useCallback, useEffect, useState } from 'react';
import Dialog from '@/shared/components/ui/Dialog/Dialog';
import { Button } from '@/shared/components/ui/Button/Button';
import { TextField } from '@/shared/components/ui/TextField';
import { Switch } from '@/shared/components/ui/Switch';
import MultimediaUpdater from '@/shared/components/ui/FileUploader/MultimediaUpdater';
import {
  createSlideWithMultimedia,
  updateSlideWithMultimedia,
  type Slide,
} from '@/features/backoffice/cms/actions/slides.action';

interface SliderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  slide?: Slide | null;
  onSuccess?: () => void;
}

/**
 * Slider Create/Edit Dialog Component
 *
 * Dialog for creating and editing slider/carousel items
 * Includes image upload and link configuration
 *
 * @param {SliderDialogProps} props - Component props
 * @returns {React.ReactNode} Dialog component
 */
export function SliderDialog({
  open,
  onOpenChange,
  slide,
  onSuccess,
}: SliderDialogProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    linkUrl: '',
    order: 1,
    isActive: true,
  });
  const [multimediaFile, setMultimediaFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    if (slide) {
      setFormData({
        title: slide.title,
        description: slide.description || '',
        linkUrl: slide.linkUrl || '',
        order: slide.order,
        isActive: slide.isActive,
      });
    } else {
      setFormData({
        title: '',
        description: '',
        linkUrl: '',
        order: 1,
        isActive: true,
      });
    }
    setMultimediaFile(null);
    setErrors({});
  }, [slide, open]);

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      const newErrors = { ...errors };
      delete newErrors[field];
      setErrors(newErrors);
    }
  };

  const handleMultimediaChange = useCallback((file: File | null) => {
    setMultimediaFile(file);
    if (errors.multimedia) {
      const newErrors = { ...errors };
      delete newErrors.multimedia;
      setErrors(newErrors);
    }
  }, [errors]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validación básica
    if (!formData.title.trim()) {
      setErrors({ title: ['El título es requerido'] });
      return;
    }

    if (!slide?.id && !multimediaFile) {
      setErrors({ multimedia: ['La imagen o video es requerido para crear un slide'] });
      return;
    }

    setIsPending(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title.trim());
      formDataToSend.append('description', formData.description.trim());
      formDataToSend.append('linkUrl', formData.linkUrl.trim());
      formDataToSend.append('order', formData.order.toString());
      formDataToSend.append('isActive', formData.isActive.toString());

      if (multimediaFile) {
        formDataToSend.append('multimedia', multimediaFile);
      }

      const result = slide?.id
        ? await updateSlideWithMultimedia(slide.id, formDataToSend)
        : await createSlideWithMultimedia(formDataToSend);

      if (result.success) {
        onOpenChange(false);
        onSuccess?.();
      } else {
        setErrors({
          submit: [result.error || 'Error al guardar el slide'],
        });
      }
    } catch (error) {
      setErrors({
        submit: [
          error instanceof Error ? error.message : 'Error inesperado al guardar',
        ],
      });
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={slide ? 'Editar Slide' : 'Crear Slide'}
      description={
        slide
          ? `Editando: ${slide.title}`
          : 'Agregar nuevo slide al carousel principal'
      }
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <TextField
          label="Título*"
          value={formData.title || ''}
          onChange={(e) => handleInputChange('title', e.target.value)}
          error={errors.title?.[0]}
        />

        <TextField
          label="Descripción"
          value={formData.description || ''}
          onChange={(e) => handleInputChange('description', e.target.value)}
          multiline
          rows={3}
          error={errors.description?.[0]}
        />

        <div>
          <label className="block text-sm font-medium mb-2">
            Imagen o Video del Slide*
          </label>
          <MultimediaUpdater
            currentUrl={slide?.multimediaUrl || ''}
            currentType={slide?.multimediaUrl?.includes('.mp4') || slide?.multimediaUrl?.includes('.webm') ? 'video' : 'image'}
            onFileChange={handleMultimediaChange}
            variant="banner"
            acceptedTypes={['image/*', 'video/*']}
            maxSize={70}
            aspectRatio="16:9"
            previewSize="xl"
          />
          {errors.multimedia && (
            <p className="text-red-600 text-sm mt-1">{errors.multimedia[0]}</p>
          )}
        </div>

        <TextField
          label="URL de destino"
          value={formData.linkUrl || ''}
          onChange={(e) => handleInputChange('linkUrl', e.target.value)}
          placeholder="https://..."
          error={errors.linkUrl?.[0]}
        />

        <TextField
          label="Orden de aparición*"
          type="number"
          value={formData.order || 1}
          onChange={(e) => handleInputChange('order', parseInt(e.target.value) || 1)}
          error={errors.order?.[0]}
        />

        <div className="flex items-center gap-3">
          <Switch
            checked={formData.isActive || false}
            onChange={(checked) => handleInputChange('isActive', checked)}
          />
          <label className="text-sm font-medium">Slide activo</label>
        </div>

        {errors.submit && (
          <div className="p-3 bg-red-50 border border-red-200 rounded">
            <p className="text-red-700 text-sm">{errors.submit[0]}</p>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button
            variant="secondary"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Cancelar
          </Button>
          <Button variant="primary" type="submit" loading={isPending}>
            {slide ? 'Guardar Cambios' : 'Crear Slide'}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
