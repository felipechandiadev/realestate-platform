'use client';
import { useState } from 'react';
import CreateBaseForm, { BaseFormField } from '@/shared/components/ui/BaseForm/CreateBaseForm';
import { createPerson } from '@/features/backoffice/contracts/actions/persons.action';
import { useRouter } from 'next/navigation';
import { useAlert } from '@/shared/hooks/useAlert';

interface CreatePersonFormProps {
  onClose: () => void;
  onSuccess?: () => void;
}

interface PersonFormData {
  name: string;
  dni: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
}

export default function CreatePersonForm({ onClose, onSuccess }: CreatePersonFormProps) {
  const router = useRouter();
  const { showAlert } = useAlert();
  
  const [values, setValues] = useState<PersonFormData>({
    name: '',
    dni: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const handleChange = (field: string, value: any) => {
    setValues(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateForm = (formValues: PersonFormData): string[] => {
    const validationErrors: string[] = [];

    if (!formValues.name.trim()) {
      validationErrors.push('El nombre es obligatorio');
    } else if (formValues.name.trim().length < 3) {
      validationErrors.push('El nombre debe tener al menos 3 caracteres');
    }

    if (!formValues.dni.trim()) {
      validationErrors.push('El DNI es obligatorio');
    } else {
      // Remover puntos y espacios para validar
      const cleanDni = formValues.dni.trim().replace(/\./g, '').replace(/\s/g, '');
      // Formato válido: 12345678-9 o 1234567-8 o 12345678-k (con o sin puntos)
      if (!/^[0-9]{7,8}-[0-9Kk]$/.test(cleanDni)) {
        validationErrors.push('Formato de DNI inválido');
      }
    }

    if (formValues.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formValues.email)) {
      validationErrors.push('Email inválido');
    }

    if (formValues.phone) {
      const cleanedPhone = formValues.phone.replace(/[^\d+]/g, '');
      if (cleanedPhone && !/^\+?[0-9]{8,15}$/.test(cleanedPhone)) {
        validationErrors.push('Formato de teléfono inválido');
      }
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
        duration: 4000
      });
      return;
    }

    setIsSubmitting(true);
    setErrors([]);

    try {
      const cleanedPhone = values.phone.trim().replace(/[^\d+]/g, '');
      const result = await createPerson({
        name: values.name.trim(),
        dni: values.dni.trim(),
        email: values.email.trim() || undefined,
        phone: cleanedPhone || undefined,
        address: values.address.trim() || undefined,
        city: values.city.trim() || undefined,
        state: values.state.trim() || undefined,
      });
      
      if (!result.success) {
        showAlert({
          message: result.error || 'Error al crear la persona',
          type: 'error',
          duration: 5000,
        });
        setIsSubmitting(false);
        return;
      }

      showAlert({
        message: `Persona ${values.name} creada exitosamente`,
        type: 'success',
        duration: 3000,
      });

      onClose();
      router.refresh();
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      showAlert({
        message: `Error al crear persona: ${error instanceof Error ? error.message : 'Error desconocido'}`,
        type: 'error',
        duration: 5000,
      });
      setIsSubmitting(false);
    }
  };

  const fields: BaseFormField[] = [
    {
      name: 'name',
      label: 'Nombre Completo',
      type: 'text',
      required: true,
      autoFocus: true,
    },
    {
      name: 'dni',
      label: 'DNI',
      type: 'dni',
      required: true,
    },
    {
      name: 'email',
      label: 'Email',
      type: 'email',
      required: false,
    },
    {
      name: 'phone',
      label: 'Teléfono',
      type: 'text',
      required: false,
    },
    {
      name: 'address',
      label: 'Dirección',
      type: 'text',
      required: false,
    },
    {
      name: 'city',
      label: 'Ciudad',
      type: 'text',
      required: false,
    },
    {
      name: 'state',
      label: 'Región/Estado',
      type: 'text',
      required: false,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
        <p className="text-sm text-blue-700 dark:text-blue-300">
          <strong>Nota:</strong> Esta persona NO será un usuario del sistema, solo se utilizará como parte de los contratos.
          Los campos obligatorios son: Nombre completo y DNI.
        </p>
      </div>
      
      <CreateBaseForm
        fields={fields}
        values={values}
        onChange={handleChange}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        errors={errors}
        submitLabel="Crear Persona"
        cancelButton={true}
        cancelButtonText="Cancelar"
        onCancel={onClose}
        columns={2}
      />
    </div>
  );
}
