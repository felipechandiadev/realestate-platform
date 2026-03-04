'use client';

import { useCallback, useEffect, useState } from 'react';
import Dialog from '@/shared/components/ui/Dialog/Dialog';
import { Button } from '@/shared/components/ui/Button/Button';
import { TextField } from '@/shared/components/ui/TextField';
import FileUploader from '@/shared/components/ui/FileUploader/FileUploader';
import { z } from 'zod';

interface TeamMember {
  id: string;
  name: string;
  position: string;
  bio?: string;
  mail?: string;
  phone?: string;
  multimediaUrl?: string;
}

interface OurTeamMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teamMember?: TeamMember | null;
  onSuccess?: () => void;
}

/**
 * Team Member schema for validation
 */
const TeamMemberSchema = z.object({
  name: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre es demasiado largo'),
  position: z
    .string()
    .min(2, 'El cargo debe tener al menos 2 caracteres')
    .max(100, 'El cargo es demasiado largo'),
  bio: z
    .string()
    .max(500, 'La biografía no puede exceder 500 caracteres')
    .optional(),
  mail: z.string().email('Email inválido').optional().or(z.literal('')),
  phone: z
    .string()
    .max(20, 'El teléfono es demasiado largo')
    .optional()
    .or(z.literal('')),
  multimediaUrl: z
    .string()
    .url('La URL de imagen es inválida')
    .optional()
    .or(z.literal('')),
});

type TeamMemberInput = z.infer<typeof TeamMemberSchema>;

/**
 * Our Team Member Create/Edit Dialog Component
 *
 * Dialog for creating and editing team member profiles
 * Includes profile photo upload and contact information
 *
 * @param {OurTeamMemberDialogProps} props - Component props
 * @returns {React.ReactNode} Dialog component
 */
export function OurTeamMemberDialog({
  open,
  onOpenChange,
  teamMember,
  onSuccess,
}: OurTeamMemberDialogProps) {
  const [formData, setFormData] = useState<Partial<TeamMemberInput>>({
    name: '',
    position: '',
    bio: '',
    mail: '',
    phone: '',
    multimediaUrl: '',
  });
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    if (teamMember) {
      setFormData({
        name: teamMember.name,
        position: teamMember.position,
        bio: teamMember.bio || '',
        mail: teamMember.mail || '',
        phone: teamMember.phone || '',
        multimediaUrl: teamMember.multimediaUrl || '',
      });
    } else {
      setFormData({
        name: '',
        position: '',
        bio: '',
        mail: '',
        phone: '',
        multimediaUrl: '',
      });
    }
    setErrors({});
  }, [teamMember, open]);

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      const newErrors = { ...errors };
      delete newErrors[field];
      setErrors(newErrors);
    }
  };

  const handleImageUpload = useCallback((url: string) => {
    handleInputChange('multimediaUrl', url);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = TeamMemberSchema.safeParse(formData);
    if (!result.success) {
      setErrors(result.error.flatten().fieldErrors);
      return;
    }

    setIsPending(true);

    try {
      // Note: This would need to be connected to actual server actions
      // For now, showing the pattern structure
      console.log('Team member data:', result.data);
      
      // TODO: Call server action here when available
      // await createTeamMember(result.data) or updateTeamMember(id, result.data)
      
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      setErrors({
        submit: [
          error instanceof Error
            ? error.message
            : 'Error al guardar miembro del equipo',
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
      title={teamMember ? 'Editar Miembro del Equipo' : 'Agregar Miembro del Equipo'}
      description={
        teamMember
          ? `Editando: ${teamMember.name}`
          : 'Agregar nuevo miembro al equipo'
      }
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <TextField
          label="Nombre completo*"
          value={formData.name || ''}
          onChange={(e) => handleInputChange('name', e.target.value)}
          error={errors.name?.[0]}
        />

        <TextField
          label="Cargo/Posición*"
          value={formData.position || ''}
          onChange={(e) => handleInputChange('position', e.target.value)}
          error={errors.position?.[0]}
        />

        <TextField
          label="Biografía"
          value={formData.bio || ''}
          onChange={(e) => handleInputChange('bio', e.target.value)}
          multiline
          rows={4}
          error={errors.bio?.[0]}
        />

        <TextField
          label="Email"
          type="email"
          value={formData.mail || ''}
          onChange={(e) => handleInputChange('mail', e.target.value)}
          error={errors.mail?.[0]}
        />

        <TextField
          label="Teléfono"
          value={formData.phone || ''}
          onChange={(e) => handleInputChange('phone', e.target.value)}
          error={errors.phone?.[0]}
        />

        <div>
          <label className="block text-sm font-medium mb-2">
            Foto de perfil
          </label>
          <FileUploader
            onUploadSuccess={handleImageUpload}
            currentFileUrl={formData.multimediaUrl}
          />
          {errors.multimediaUrl && (
            <p className="text-red-600 text-sm mt-1">{errors.multimediaUrl[0]}</p>
          )}
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
            {teamMember ? 'Guardar Cambios' : 'Agregar Miembro'}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
