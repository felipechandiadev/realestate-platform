'use client';

import { useCallback, useEffect, useState } from 'react';
import Dialog from '@/shared/components/ui/Dialog/Dialog';
import { Button } from '@/shared/components/ui/Button/Button';
import { TextField } from '@/shared/components/ui/TextField';
import FileUploader from '@/shared/components/ui/FileUploader/FileUploader';
import { z } from 'zod';

interface Identity {
  id: string;
  name: string;
  description?: string;
  logoUrl?: string;
}

interface IdentityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  identity?: Identity | null;
  onSuccess?: () => void;
}

/**
 * Identity schema for validation
 */
const IdentitySchema = z.object({
  name: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre es demasiado largo'),
  description: z
    .string()
    .max(500, 'La descripción no puede exceder 500 caracteres')
    .optional()
    .or(z.literal('')),
  logoUrl: z
    .string()
    .url('La URL del logo es inválida')
    .optional()
    .or(z.literal('')),
});

type IdentityInput = z.infer<typeof IdentitySchema>;

/**
 * Identity Edit Dialog Component
 *
 * Dialog for editing site identity/branding
 * Manages company name, logo, and description
 *
 * @param {IdentityDialogProps} props - Component props
 * @returns {React.ReactNode} Dialog component
 */
export function IdentityDialog({
  open,
  onOpenChange,
  identity,
  onSuccess,
}: IdentityDialogProps) {
  const [formData, setFormData] = useState<Partial<IdentityInput>>({
    name: '',
    description: '',
    logoUrl: '',
  });
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    if (identity && open) {
      setFormData({
        name: identity.name,
        description: identity.description || '',
        logoUrl: identity.logoUrl || '',
      });
    }
    setErrors({});
  }, [identity, open]);

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      const newErrors = { ...errors };
      delete newErrors[field];
      setErrors(newErrors);
    }
  };

  const handleLogoUpload = useCallback((url: string) => {
    handleInputChange('logoUrl', url);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = IdentitySchema.safeParse(formData);
    if (!result.success) {
      setErrors(result.error.flatten().fieldErrors);
      return;
    }

    setIsPending(true);

    try {
      // Note: This would need to be connected to actual server actions
      // For now, showing the pattern structure
      console.log('Identity data:', result.data);
      
      // TODO: Call server action here when available
      // await updateIdentity(identity?.id, result.data) or createIdentity(result.data)
      
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      setErrors({
        submit: [
          error instanceof Error
            ? error.message
            : 'Error al actualizar identidad',
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
      title="Editar Identidad del Sitio"
      description="Configura el nombre y logo de tu empresa"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <TextField
          label="Nombre de la empresa*"
          value={formData.name || ''}
          onChange={(e) => handleInputChange('name', e.target.value)}
          error={errors.name?.[0]}
        />

        <TextField
          label="Descripción"
          value={formData.description || ''}
          onChange={(e) => handleInputChange('description', e.target.value)}
          multiline
          rows={3}
          placeholder="Descripción breve de tu empresa"
          error={errors.description?.[0]}
        />

        <div>
          <label className="block text-sm font-medium mb-2">
            Logo de la empresa
          </label>
          <FileUploader
            onUploadSuccess={handleLogoUpload}
            currentFileUrl={formData.logoUrl}
          />
          {errors.logoUrl && (
            <p className="text-red-600 text-sm mt-1">{errors.logoUrl[0]}</p>
          )}
          <p className="text-sm text-gray-500 mt-1">
            Recomendado: PNG transparente, 200x200px
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
