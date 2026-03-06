'use client';

import { useMemo, useState } from 'react';
import UpdateBaseForm, { type BaseUpdateFormField } from '@/shared/components/ui/BaseForm/UpdateBaseForm';
import type { Person } from '@/features/backoffice/contracts/actions/persons.action';
import { updatePerson } from '@/features/backoffice/contracts/actions/persons.action';
import { updateUser } from '@/features/backoffice/users/actions/users.action';
import { useRouter } from 'next/navigation';
import { useAlert } from '@/shared/hooks/useAlert';

interface EditPersonFormProps {
  person: Person;
  onClose: () => void;
  onSuccess?: (updatedPerson: Person) => void;
}

interface EditPersonFormValues {
  name: string;
  dni: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  nationality: string;
  gender: string;
  maritalStatus: string;
  profession: string;
  company: string;
}

const formatDniForValidation = (dni: string): string => {
  return dni.trim().replace(/\./g, '').replace(/\s/g, '').toUpperCase();
};

const isValidDni = (dni: string): boolean => {
  if (!dni) return false;
  return /^[0-9]{7,8}-[0-9K]$/.test(dni);
};

const formatPhone = (phone: string): string => {
  // Allow digits and leading '+' only; remove other formatting characters like spaces, dashes, parentheses.
  return phone.replace(/[^\d+]/g, '');
};

export default function EditPersonForm({ person, onClose, onSuccess }: EditPersonFormProps) {
  const router = useRouter();
  const { showAlert } = useAlert();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const initialState = useMemo(() => ({
    name: person.name ?? '',
    dni: person.dni ?? '',
    email: person.email ?? '',
    phone: person.phone ?? '',
    address: person.address ?? '',
    city: person.city ?? '',
    state: person.state ?? '',
    nationality: person.nationality ?? '',
    gender: person.gender ?? '',
    maritalStatus: person.maritalStatus ?? '',
    profession: person.profession ?? '',
    company: person.company ?? '',
  }), [person]);

  const fields: BaseUpdateFormField[] = useMemo(() => ([
    {
      name: 'name',
      label: 'Nombre Completo',
      type: 'text',
      required: true,
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
    },
    {
      name: 'phone',
      label: 'Teléfono',
      type: 'text',
    },
    {
      name: 'address',
      label: 'Dirección',
      type: 'text',
    },
    {
      name: 'city',
      label: 'Ciudad',
      type: 'text',
    },
    {
      name: 'state',
      label: 'Región/Estado',
      type: 'text',
    },
    {
      name: 'nationality',
      label: 'Nacionalidad',
      type: 'text',
    },
    {
      name: 'gender',
      label: 'Género',
      type: 'select',
      options: [
        { value: 'MALE', label: 'Masculino' },
        { value: 'FEMALE', label: 'Femenino' },
        { value: 'OTHER', label: 'Otro' },
      ],
    },
    {
      name: 'maritalStatus',
      label: 'Estado Civil',
      type: 'select',
      options: [
        { value: 'SINGLE', label: 'Soltero(a)' },
        { value: 'MARRIED', label: 'Casado(a)' },
        { value: 'DIVORCED', label: 'Divorciado(a)' },
        { value: 'WIDOWED', label: 'Viudo(a)' },
      ],
    },
    {
      name: 'profession',
      label: 'Profesión',
      type: 'text',
    },
    {
      name: 'company',
      label: 'Empresa',
      type: 'text',
    },
  ]), []);

  const validateForm = (values: EditPersonFormValues): string[] => {
    const validationErrors: string[] = [];
    const cleanedName = values.name.trim();

    if (!cleanedName) {
      validationErrors.push('El nombre es obligatorio');
    } else if (cleanedName.length < 3) {
      validationErrors.push('El nombre debe tener al menos 3 caracteres');
    }

    const cleanedDni = formatDniForValidation(values.dni);
    if (!cleanedDni) {
      validationErrors.push('El DNI es obligatorio');
    } else if (!isValidDni(cleanedDni)) {
      validationErrors.push('Formato de DNI inválido');
    }

    if (values.email) {
      const email = values.email.trim();
      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        validationErrors.push('Email inválido');
      }
    }

    if (values.phone) {
      const cleanedPhone = formatPhone(values.phone);
      if (cleanedPhone && !/^\+?[0-9]{8,15}$/.test(cleanedPhone)) {
        validationErrors.push('Formato de teléfono inválido');
      }
    }

    return validationErrors;
  };

  const handleSubmit = async (formValues: Record<string, unknown>) => {
    const values: EditPersonFormValues = {
      name: typeof formValues.name === 'string' ? formValues.name : '',
      dni: typeof formValues.dni === 'string' ? formValues.dni : '',
      email: typeof formValues.email === 'string' ? formValues.email : '',
      phone: typeof formValues.phone === 'string' ? formValues.phone : '',
      address: typeof formValues.address === 'string' ? formValues.address : '',
      city: typeof formValues.city === 'string' ? formValues.city : '',
      state: typeof formValues.state === 'string' ? formValues.state : '',
      nationality: typeof formValues.nationality === 'string' ? formValues.nationality : '',
      gender: typeof formValues.gender === 'string' ? formValues.gender : '',
      maritalStatus: typeof formValues.maritalStatus === 'string' ? formValues.maritalStatus : '',
      profession: typeof formValues.profession === 'string' ? formValues.profession : '',
      company: typeof formValues.company === 'string' ? formValues.company : '',
    };

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
      const payload = {
        name: values.name.trim(),
        dni: formatDniForValidation(values.dni),
        email: values.email.trim() || undefined,
        phone: formatPhone(values.phone) || undefined,
        address: values.address.trim() || undefined,
        city: values.city.trim() || undefined,
        state: values.state.trim() || undefined,
        nationality: values.nationality.trim() || undefined,
        gender: values.gender.trim() || undefined,
        maritalStatus: values.maritalStatus.trim() || undefined,
        profession: values.profession.trim() || undefined,
        company: values.company.trim() || undefined,
      };

      let updatedPerson: Person;

      if (person.isFromUser) {
        // If this person is actually a user, update their personal profile instead.
        // Split the full name into first and last name (basic heuristic).
        const fullName = values.name.trim();
        const [firstName, ...rest] = fullName.split(' ');
        const lastName = rest.join(' ');

        await updateUser(person.id, {
          email: values.email.trim() || undefined,
          personalInfo: {
            firstName: firstName || undefined,
            lastName: lastName || undefined,
            phone: values.phone.trim() || undefined,
            address: values.address.trim() || undefined,
            city: values.city.trim() || undefined,
            state: values.state.trim() || undefined,
            profession: values.profession.trim() || undefined,
            company: values.company.trim() || undefined,
            nationality: values.nationality.trim() || undefined,
            gender: values.gender.trim() || undefined,
            maritalStatus: values.maritalStatus.trim() || undefined,
          },
        });

        // Show the updated values locally (the API will already have the latest data)
        updatedPerson = { ...person, ...payload } as Person;
      } else {
        updatedPerson = await updatePerson(person.id, payload);
      }

      showAlert({
        message: `Datos de ${updatedPerson.name || 'la persona'} actualizados correctamente`,
        type: 'success',
        duration: 3000,
      });

      router.refresh();
      onSuccess?.(updatedPerson);
      onClose();
    } catch (error) {
      showAlert({
        message: `Error al actualizar persona: ${error instanceof Error ? error.message : 'Error desconocido'}`,
        type: 'error',
        duration: 5000,
      });
      setErrors(['No fue posible guardar los cambios en este momento. Intenta nuevamente.']);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <UpdateBaseForm
      fields={fields}
      initialState={initialState}
      onSubmit={(formValues) => { void handleSubmit(formValues); }}
      isSubmitting={isSubmitting}
      errors={errors}
      submitLabel="Guardar cambios"
      title="Editar datos personales"
      submitVariant="primary"
      cancelButton
      cancelButtonText="Cancelar"
      onCancel={onClose}
      columns={2}
    />
  );
}
