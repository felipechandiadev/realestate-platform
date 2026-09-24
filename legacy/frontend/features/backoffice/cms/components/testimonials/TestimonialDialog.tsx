'use client';

import { useCallback, useEffect, useState } from 'react';
import Dialog from '@/shared/components/ui/Dialog/Dialog';
import { Button } from '@/shared/components/ui/Button/Button';
import { TextField } from '@/shared/components/ui/TextField';
import RangeSlider from '@/shared/components/ui/RangeSlider/RangeSlider';
import {
  useCreateTestimonial,
  useUpdateTestimonial,
} from '@/features/backoffice/cms/hooks';
import { TestimonialSchema } from '@/features/backoffice/cms/validation';
import type { Testimonial, CreateTestimonialInput } from '@/features/backoffice/cms/types';

interface TestimonialDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  testimonial?: Testimonial | null;
  onSuccess?: () => void;
}

/**
 * Testimonial Create/Edit Dialog Component
 *
 * Dialog for creating and editing customer testimonials
 * Includes rating slider
 *
 * @param {TestimonialDialogProps} props - Component props
 * @returns {React.ReactNode} Dialog component
 */
export function TestimonialDialog({
  open,
  onOpenChange,
  testimonial,
  onSuccess,
}: TestimonialDialogProps) {
  const [formData, setFormData] = useState<Partial<CreateTestimonialInput>>({
    clientName: '',
    text: '',
    rating: 5,
  });
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  const { mutate: createTestimonial, isPending: isCreating } = useCreateTestimonial();
  const { mutate: updateTestimonial, isPending: isUpdating } = useUpdateTestimonial();

  useEffect(() => {
    if (testimonial) {
      setFormData({
        clientName: testimonial.clientName,
        text: testimonial.text,
        rating: testimonial.rating || 5,
      });
    } else {
      setFormData({
        clientName: '',
        text: '',
        rating: 5,
      });
    }
    setErrors({});
  }, [testimonial, open]);

  const handleInputChange = (field: string, value: any) => {
    // Map compatibility aliases to actual fields
    const fieldMap: Record<string, string> = {
      clientName: 'name',
      text: 'content',
    };
    const actualField = fieldMap[field] || field;
    
    setFormData((prev) => ({ 
      ...prev, 
      [field]: value,  // Keep compatibility field
      [actualField]: value  // Set actual field too
    }));
    if (errors[field]) {
      const newErrors = { ...errors };
      delete newErrors[field];
      setErrors(newErrors);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = TestimonialSchema.safeParse(formData);
    if (!result.success) {
      setErrors(result.error.flatten().fieldErrors);
      return;
    }

    if (testimonial?.id) {
      updateTestimonial(
        { id: testimonial.id, data: result.data },
        {
          onSuccess: () => {
            onOpenChange(false);
            onSuccess?.();
          },
          onError: (error) => {
            setErrors({
              submit: [
                error instanceof Error
                  ? error.message
                  : 'Error al actualizar testimonio',
              ],
            });
          },
        }
      );
    } else {
      createTestimonial(result.data, {
        onSuccess: () => {
          onOpenChange(false);
          onSuccess?.();
        },
        onError: (error) => {
          setErrors({
            submit: [
              error instanceof Error
                ? error.message
                : 'Error al crear testimonio',
            ],
          });
        },
      });
    }
  };

  const isPending = isCreating || isUpdating;

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={testimonial ? 'Editar Testimonio' : 'Crear Testimonio'}
      description={
        testimonial
          ? `Editando testimonio de ${testimonial.clientName}`
          : 'Agregar nuevo testimonio de cliente'
      }
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <TextField
          label="Nombre del Cliente*"
          value={formData.clientName || ''}
          onChange={(e) => handleInputChange('clientName', e.target.value)}
          error={errors.clientName?.[0]}
        />

        <TextField
          label="Testimonio*"
          value={formData.text || ''}
          onChange={(e) => handleInputChange('text', e.target.value)}
          multiline
          rows={4}
          error={errors.text?.[0]}
        />

        <div>
          <label className="block text-sm font-medium mb-2">
            Calificación: {formData.rating} de 5 ⭐
          </label>
          <RangeSlider
            min={1}
            max={5}
            step={1}
            value={formData.rating || 5}
            onChange={(value) => handleInputChange('rating', value)}
          />
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
            {testimonial ? 'Guardar Cambios' : 'Crear Testimonio'}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
