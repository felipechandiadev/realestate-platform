'use client';

import React, { useState } from 'react';
import Dialog from '@/shared/components/ui/Dialog/Dialog';
import CreateBaseForm, { BaseFormField } from '@/shared/components/ui/BaseForm/CreateBaseForm';
import { useAlert } from '@/providers/AlertContext';
import { updateUserAvatar } from '@/features/backoffice/users/actions/users.action';

interface UploadUserAvatarDialogProps {
  open: boolean;
  onClose: () => void;
  userId: string;
  currentAvatarUrl?: string;
}

interface AvatarFormData {
  avatarFile: File | null;
}

const UploadUserAvatarDialog: React.FC<UploadUserAvatarDialogProps> = ({
  open,
  onClose,
  userId,
  currentAvatarUrl,
}) => {
  const [values, setValues] = useState<AvatarFormData>({
    avatarFile: null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const { success, error: showError } = useAlert();

  const handleChange = (field: string, value: any) => {
    setValues(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateForm = (formValues: AvatarFormData): string[] => {
    const validationErrors: string[] = [];

    if (!formValues.avatarFile) {
      validationErrors.push('Por favor selecciona una imagen');
    }

    return validationErrors;
  };

  const handleSubmit = async () => {
    const validationErrors = validateForm(values);
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      showError('Por favor selecciona una imagen');
      return;
    }

    setIsSubmitting(true);
    setErrors([]);

    try {
      if (!values.avatarFile) {
        showError('Por favor selecciona una imagen');
        return;
      }

      const formData = new FormData();
      formData.append('file', values.avatarFile);

      const result = await updateUserAvatar(userId, formData);

      if (result.success) {
        success('Avatar actualizado exitosamente');
        handleClose();
      } else {
        const errorMsg = result.error || 'Error al actualizar el avatar';
        setErrors([errorMsg]);
        showError(errorMsg);
      }
    } catch (error) {
      console.error('[UploadUserAvatarDialog] Exception:', error);
      const errorMsg = error instanceof Error ? error.message : 'Error interno del servidor';
      setErrors([errorMsg]);
      showError(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setValues({ avatarFile: null });
    setErrors([]);
    onClose();
  };

  const fields: BaseFormField[] = [
    {
      name: 'avatarFile',
      label: '',
      type: 'avatar',
      required: true,
      acceptedTypes: ['image/*'],
      maxSize: 5 * 1024 * 1024, // 5MB
  
    },
  ];

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      title="Actualizar Avatar"
      size="sm"
    >
      <div className="p-4">
        <CreateBaseForm
          fields={fields}
          values={values}
          onChange={handleChange}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          errors={errors}
          submitLabel="Guardar Avatar"
          cancelButton={true}
          cancelButtonText="Cancelar"
          onCancel={handleClose}
        />
      </div>
    </Dialog>
  );
};

export default UploadUserAvatarDialog;