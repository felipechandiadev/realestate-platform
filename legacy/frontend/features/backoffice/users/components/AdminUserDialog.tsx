'use client';

import { useCallback, useEffect, useState } from 'react';
import Dialog from '@/shared/components/ui/Dialog/Dialog';
import { Button } from '@/shared/components/ui/Button/Button';
import { TextField } from '@/shared/components/ui/TextField';
import { Select } from '@/shared/components/ui/Select';
import { Switch } from '@/shared/components/ui/Switch';
import {
  useCreateUser,
  useUpdateUser,
} from '@/features/backoffice/users/hooks';
import { CreateUserSchema, UpdateUserSchema } from '@/features/backoffice/users/validation';
import type { User } from '@/features/backoffice/users/types';

interface AdminUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: User | null;
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
}

/**
 * Admin User Dialog Component
 *
 * Dialog for creating and editing admin users
 * Handles form validation with Zod
 * Password field only shown on create
 *
 * @param {AdminUserDialogProps} props - Component props
 * @returns {React.ReactNode} Dialog component
 */
export function AdminUserDialog({
  open,
  onOpenChange,
  user,
  onSuccess,
}: AdminUserDialogProps) {
  const [formData, setFormData] = useState<FormData>({
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    role: 'ADMIN',
    status: 'ACTIVE',
    password: '',
  });
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  const { mutate: createUser, isPending: isCreating } = useCreateUser();
  const { mutate: updateUser, isPending: isUpdating } = useUpdateUser(user?.id || '');

  const isEditMode = !!user;
  const isPending = isCreating || isUpdating;

  // Set form data when user changes
  useEffect(() => {
    if (user) {
      setFormData({
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone || '',
        role: user.role,
        status: user.status,
      });
    } else {
      setFormData({
        email: '',
        firstName: '',
        lastName: '',
        phone: '',
        role: 'ADMIN',
        status: 'ACTIVE',
        password: '',
      });
    }
    setErrors({});
  }, [user]);

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
          role: 'ADMIN',
          status: 'ACTIVE',
          password: '',
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
      title={isEditMode ? 'Editar Administrador' : 'Crear Administrador'}
      description={
        isEditMode
          ? 'Actualice los datos del administrador'
          : 'Complete los datos del nuevo administrador'
      }
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Email */}
        <TextField
          label="Email*"
          type="email"
          value={formData.email}
          onChange={(e) => handleInputChange('email', e.target.value)}
          placeholder="usuario@ejemplo.com"
          error={errors.email?.[0]}
          disabled={isEditMode}
        />

        {/* First Name */}
        <TextField
          label="Nombre*"
          value={formData.firstName}
          onChange={(e) => handleInputChange('firstName', e.target.value)}
          placeholder="Juan"
          error={errors.firstName?.[0]}
        />

        {/* Last Name */}
        <TextField
          label="Apellido*"
          value={formData.lastName}
          onChange={(e) => handleInputChange('lastName', e.target.value)}
          placeholder="Pérez"
          error={errors.lastName?.[0]}
        />

        {/* Phone */}
        <TextField
          label="Teléfono"
          type="tel"
          value={formData.phone}
          onChange={(e) => handleInputChange('phone', e.target.value)}
          placeholder="+52 555 123 4567"
          error={errors.phone?.[0]}
        />

        {/* Role */}
        <Select
          label="Rol*"
          value={formData.role}
          onChange={(value) => handleInputChange('role', value)}
          options={[
            { label: 'Administrador', value: 'ADMIN' },
            { label: 'Gerente', value: 'MANAGER' },
          ]}
          error={errors.role?.[0]}
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
              : 'Crear Administrador'}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
