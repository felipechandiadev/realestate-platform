'use client';

import { useEffect, useState } from 'react';
import Dialog from '@/shared/components/ui/Dialog/Dialog';
import { Button } from '@/shared/components/ui/Button/Button';
import { TextField } from '@/shared/components/ui/TextField';
import { useAboutUs, useUpdateAboutUs } from '@/features/backoffice/cms/hooks';
import { UpdateAboutUsSchema } from '@/features/backoffice/cms/validation';
import type { UpdateAboutUsInput } from '@/features/backoffice/cms/types';

interface AboutUsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

/**
 * About Us Edit Dialog Component
 *
 * Dialog for editing the About Us page content
 * Manages company mission, vision, and values
 *
 * @param {AboutUsDialogProps} props - Component props
 * @returns {React.ReactNode} Dialog component
 */
export function AboutUsDialog({
  open,
  onOpenChange,
  onSuccess,
}: AboutUsDialogProps) {
  const [formData, setFormData] = useState<Partial<UpdateAboutUsInput>>({
    title: '',
    content: '',
    mission: '',
    vision: '',
    values: [],
  });
  const [valuesInput, setValuesInput] = useState('');
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  const { data: aboutUs, isLoading: isLoadingData } = useAboutUs();
  const { mutate: updateAboutUs, isPending: isUpdating } = useUpdateAboutUs();

  useEffect(() => {
    if (aboutUs && open) {
      setFormData({
        title: aboutUs.title,
        content: aboutUs.content,
        mission: aboutUs.mission,
        vision: aboutUs.vision,
        values: aboutUs.values || [],
      });
      setValuesInput((aboutUs.values || []).join('\n'));
    }
    setErrors({});
  }, [aboutUs, open]);

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      const newErrors = { ...errors };
      delete newErrors[field];
      setErrors(newErrors);
    }
  };

  const handleValuesChange = (value: string) => {
    setValuesInput(value);
    const valuesArray = value
      .split('\n')
      .map((v) => v.trim())
      .filter((v) => v.length > 0);
    handleInputChange('values', valuesArray);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = UpdateAboutUsSchema.safeParse(formData);
    if (!result.success) {
      setErrors(result.error.flatten().fieldErrors);
      return;
    }

    updateAboutUs(result.data, {
      onSuccess: () => {
        onOpenChange(false);
        onSuccess?.();
      },
      onError: (error) => {
        setErrors({
          submit: [
            error instanceof Error
              ? error.message
              : 'Error al actualizar información',
          ],
        });
      },
    });
  };

  const isPending = isUpdating || isLoadingData;

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title="Editar Acerca de Nosotros"
      description="Actualiza la información de la empresa"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <TextField
          label="Título"
          value={formData.title || ''}
          onChange={(e) => handleInputChange('title', e.target.value)}
          error={errors.title?.[0]}
        />

        <TextField
          label="Contenido principal"
          value={formData.content || ''}
          onChange={(e) => handleInputChange('content', e.target.value)}
          multiline
          rows={6}
          error={errors.content?.[0]}
        />

        <TextField
          label="Misión"
          value={formData.mission || ''}
          onChange={(e) => handleInputChange('mission', e.target.value)}
          multiline
          rows={4}
          error={errors.mission?.[0]}
        />

        <TextField
          label="Visión"
          value={formData.vision || ''}
          onChange={(e) => handleInputChange('vision', e.target.value)}
          multiline
          rows={4}
          error={errors.vision?.[0]}
        />

        <div>
          <TextField
            label="Valores (uno por línea)"
            value={valuesInput}
            onChange={(e) => handleValuesChange(e.target.value)}
            multiline
            rows={5}
            placeholder="Integridad&#10;Innovación&#10;Excelencia"
            error={errors.values?.[0]}
          />
          <p className="text-sm text-gray-500 mt-1">
            Escribe cada valor en una línea nueva
          </p>
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
            Guardar Cambios
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
