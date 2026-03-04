'use client';

import { useCallback, useEffect, useState } from 'react';
import Dialog from '@/shared/components/ui/Dialog/Dialog';
import { Button } from '@/shared/components/ui/Button/Button';
import { TextField } from '@/shared/components/ui/TextField';
import { Select } from '@/shared/components/ui/Select';
import {
  useCreateUser,
  useUpdateUser,
} from '@/features/backoffice/users/hooks';
import { CreateUserSchema, UpdateUserSchema } from '@/features/backoffice/users/validation';
import type { User } from '@/features/backoffice/users/types';

interface AgentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agent?: User | null;
  onSuccess?: () => void;
}

interface FormData {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: string;
  status: string;
  password?: string;
  company?: string;
  licenseNumber?: string;
}

/**
 * Agent Dialog Component
 *
 * Dialog for creating and editing agent users
 * Includes phone and brokerage information fields
 * Handles form validation with Zod
 * Password field only shown on create
 *
 * @param {AgentDialogProps} props - Component props
 * @returns {React.ReactNode} Dialog component
 */
export function AgentDialog({
  open,
  onOpenChange,
  agent,
  onSuccess,
}: AgentDialogProps) {
  const [formData, setFormData] = useState<FormData>({
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    role: 'AGENT',
    status: 'ACTIVE',
    password: '',
    company: '',
    licenseNumber: '',
  });
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  const { mutate: createUser, isPending: isCreating } = useCreateUser();
  const { mutate: updateUser, isPending: isUpdating } = useUpdateUser(agent?.id || '');

  const isEditMode = !!agent;
  const isPending = isCreating || isUpdating;

  // Set form data when agent changes
  useEffect(() => {
    if (agent) {
      setFormData({
        email: agent.email,
        firstName: agent.firstName,
        lastName: agent.lastName,
        phone: agent.phone || '',
        role: agent.role,
        status: agent.status,
        company: '',
        licenseNumber: '',
      });
    } else {
      setFormData({
        email: '',
        firstName: '',
        lastName: '',
        phone: '',
        role: 'AGENT',
        status: 'ACTIVE',
        password: '',
        company: '',
        licenseNumber: '',
      });
    }
    setErrors({});
  }, [agent]);

  const handleInputChange = useCallback(
    (field: string, value: any) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      // Clear error for this field
      if (errors[field]) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[field];
          return newErrors;
        });
      }
    },
    [errors]
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      // Validate form data
      const schema = isEditMode ? UpdateUserSchema : CreateUserSchema;
      const result = schema.safeParse(formData);

      if (!result.success) {
        setErrors(result.error.flatten().fieldErrors);
        return;
      }

      // Call API
      if (isEditMode) {
        updateUser(result.data as any);
        onOpenChange(false);
        onSuccess?.();
      } else {
        createUser(result.data as any);
        setFormData({
          email: '',
          firstName: '',
          lastName: '',
          phone: '',
          role: 'AGENT',
          status: 'ACTIVE',
          password: '',
          company: '',
          licenseNumber: '',
        });
        setErrors({});
        onOpenChange(false);
        onSuccess?.();
      }
    },
    [formData, isEditMode, createUser, updateUser, onOpenChange, onSuccess]
  );

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={isEditMode ? 'Editar Agente' : 'Crear Agente'}
      description={
        isEditMode
          ? 'Actualice los datos del agente'
          : 'Complete los datos del nuevo agente'
      }
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Email */}
        <TextField
          label="Email*"
          type="email"
          value={formData.email}
          onChange={(e) => handleInputChange('email', e.target.value)}
          placeholder="agente@ejemplo.com"
          error={errors.email?.[0]}
          disabled={isEditMode}
        />

        {/* First Name */}
        <TextField
          label="Nombre*"
          value={formData.firstName}
          onChange={(e) => handleInputChange('firstName', e.target.value)}
          placeholder="María"
          error={errors.firstName?.[0]}
        />

        {/* Last Name */}
        <TextField
          label="Apellido*"
          value={formData.lastName}
          onChange={(e) => handleInputChange('lastName', e.target.value)}
          placeholder="García"
          error={errors.lastName?.[0]}
        />

        {/* Phone */}
        <TextField
          label="Teléfono*"
          type="tel"
          value={formData.phone}
          onChange={(e) => handleInputChange('phone', e.target.value)}
          placeholder="+52 555 123 4567"
          error={errors.phone?.[0]}
        />

        {/* Company */}
        <TextField
          label="Inmobiliaria"
          value={formData.company || ''}
          onChange={(e) => handleInputChange('company', e.target.value)}
          placeholder="Nombre de la inmobiliaria"
          error={errors.company?.[0]}
        />

        {/* License Number */}
        <TextField
          label="Número de Licencia"
          value={formData.licenseNumber || ''}
          onChange={(e) => handleInputChange('licenseNumber', e.target.value)}
          placeholder="LIC-12345"
          error={errors.licenseNumber?.[0]}
        />

        {/* Status */}
        <Select
          label="Estado*"
          value={formData.status}
          onChange={(value) => handleInputChange('status', value)}
          options={[
            { label: 'Activo', value: 'ACTIVE' },
            { label: 'Inactivo', value: 'INACTIVE' },
            { label: 'Suspendido', value: 'SUSPENDED' },
          ]}
          error={errors.status?.[0]}
        />

        {/* Password (only on create) */}
        {!isEditMode && (
          <TextField
            label="Contraseña*"
            type="password"
            value={formData.password || ''}
            onChange={(e) => handleInputChange('password', e.target.value)}
            placeholder="••••••••"
            error={errors.password?.[0]}
            helperText="Mínimo 8 caracteres, incluir mayúsculas, minúsculas y números"
          />
        )}

        {/* Submit Errors */}
        {errors.submit && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <p className="text-sm text-red-800">{errors.submit[0]}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending
              ? isEditMode
                ? 'Guardando...'
                : 'Creando...'
              : isEditMode
              ? 'Guardar Cambios'
              : 'Crear Agente'}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
