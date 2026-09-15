"use client";

import React, { useEffect, useState } from 'react';
import { Alert, Button, Dialog } from '@realestate/ui';
import CreateBaseForm, { BaseFormField } from '@/shared/components/ui/BaseForm/CreateBaseForm';
import { createAdmin } from '@/features/users/actions/users.action';
import { useAlert } from '@/shared/hooks/useAlert';

interface CreateAdminFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface AdminFormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  phone: string;
  avatarFile: File | null;
}

const FORM_ID = 'create-admin-form';

export default function CreateAdminFormDialog({
  open,
  onClose,
  onSuccess,
}: CreateAdminFormDialogProps) {
  const { showAlert } = useAlert();
  const [values, setValues] = useState<AdminFormData>({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
    avatarFile: null,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    if (open) {
      setIsSubmitting(false);
      setErrors([]);
    }
  }, [open]);

  const handleChange = (field: string, value: any) => {
    setValues((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateForm = (formValues: AdminFormData): string[] => {
    const validationErrors: string[] = [];

    if (!formValues.username.trim()) {
      validationErrors.push('El nombre de usuario es requerido');
    } else if (formValues.username.trim().length < 3) {
      validationErrors.push('El nombre de usuario debe tener al menos 3 caracteres');
    }

    if (!formValues.email.trim()) {
      validationErrors.push('El email es requerido');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formValues.email)) {
      validationErrors.push('El email no es válido');
    }

    if (!formValues.firstName.trim()) {
      validationErrors.push('El nombre es requerido');
    }

    if (!formValues.lastName.trim()) {
      validationErrors.push('El apellido es requerido');
    }

    if (!formValues.password) {
      validationErrors.push('La contraseña es requerida');
    } else if (formValues.password.length < 8) {
      validationErrors.push('La contraseña debe tener al menos 8 caracteres');
    }

    if (!formValues.confirmPassword) {
      validationErrors.push('Debe confirmar la contraseña');
    } else if (formValues.password !== formValues.confirmPassword) {
      validationErrors.push('Las contraseñas no coinciden');
    }

    return validationErrors;
  };

  const handleSubmit = async () => {
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
    setErrors([]);

    try {
      const result = await createAdmin({
        username: values.username.trim(),
        email: values.email.trim().toLowerCase(),
        password: values.password,
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim(),
        phone: values.phone.trim() || undefined,
        avatarFile: values.avatarFile || undefined,
      });

      if (result.success) {
        showAlert({
          message: 'Administrador creado exitosamente',
          type: 'success',
          duration: 3000,
        });
        handleClose();
        onSuccess?.();
        return;
      }

      const errorMsg = result.error || 'Error al crear administrador';
      setErrors([errorMsg]);
      showAlert({
        message: errorMsg,
        type: 'error',
        duration: 5000,
      });
      setIsSubmitting(false);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Error interno del servidor';
      setErrors([errorMsg]);
      showAlert({
        message: errorMsg,
        type: 'error',
        duration: 5000,
      });
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setValues({
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: '',
      phone: '',
      avatarFile: null,
    });
    setErrors([]);
    onClose();
  };

  const fields: BaseFormField[] = [
    {
      name: 'username',
      label: 'Nombre de usuario',
      type: 'text',
      required: true,
      autoFocus: true,
    },
    {
      name: 'email',
      label: 'Email',
      type: 'email',
      required: true,
    },
    {
      name: 'firstName',
      label: 'Nombre',
      type: 'text',
      required: true,
    },
    {
      name: 'lastName',
      label: 'Apellido',
      type: 'text',
      required: true,
    },
    {
      name: 'phone',
      label: 'Teléfono (opcional)',
      type: 'text',
    },
    {
      name: 'password',
      label: 'Contraseña',
      type: 'password',
      required: true,
    },
    {
      name: 'confirmPassword',
      label: 'Confirmar Contraseña',
      type: 'password',
      required: true,
    },
    {
      name: 'avatarFile',
      label: 'Avatar (Opcional)',
      type: 'avatar',
      acceptedTypes: ['image/*'],
      maxSize: 2 * 1024 * 1024,
    },
  ];

  const alertArea =
    errors.length > 0 ? (
      <div className="flex flex-col gap-2">
        {errors.map((err, i) => (
          <Alert key={i} variant="error" data-test-id={`create-admin-error-${i}`}>
            {err}
          </Alert>
        ))}
      </div>
    ) : null;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      title="Crear Nuevo Administrador"
      size="sm"
      scroll="paper"
      maxHeight="90vh"
      actionsJustify="between"
      data-test-id="create-admin-dialog"
      alertArea={alertArea}
      actions={
        <>
          <Button
            type="button"
            variant="outlined"
            size="md"
            onClick={handleClose}
            disabled={isSubmitting}
            data-test-id="create-admin-cancel"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            form={FORM_ID}
            variant="primary"
            size="md"
            disabled={isSubmitting}
            loading={isSubmitting}
            data-test-id="create-admin-submit"
          >
            Crear Administrador
          </Button>
        </>
      }
    >
      <CreateBaseForm
        formId={FORM_ID}
        nested
        fields={fields}
        values={values}
        onChange={handleChange}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        data-test-id="create-admin-form"
      />
    </Dialog>
  );
}
