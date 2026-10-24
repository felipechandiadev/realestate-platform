'use client';

import { useMemo, useState } from 'react';
import UpdateBaseForm, { type BaseUpdateFormField } from '@/shared/components/ui/BaseForm/UpdateBaseForm';
import type { Person } from '@/features/contracts/actions/persons.action';
import { updatePerson } from '@/features/contracts/actions/persons.action';
import { updateUser } from '@/features/users/actions/users.action';
import { useRouter } from 'next/navigation';
import { useAlert } from '@/shared/hooks/useAlert';
import { useUserManagementPermissions } from '@/features/users/hooks/useUserManagementPermissions';
import { USER_MANAGEMENT_FORBIDDEN_MESSAGE } from '@/features/users/permissions';

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
  gender: string;
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
  const { canManageUser } = useUserManagementPermissions();
  // Si la persona es un usuario del sistema, solo ADMIN (o el propio usuario) puede editarlo.
  const isUserEditBlocked = Boolean(person.isFromUser) && !canManageUser(person.id);
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
    gender: person.gender ?? '',
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
      name: 'gender',
      label: 'Género',
      type: 'select',
      options: [
        { value: 'MALE', label: 'Masculino' },
        { value: 'FEMALE', label: 'Femenino' },
        { value: 'OTHER', label: 'Otro' },
      ],
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
      gender: typeof formValues.gender === 'string' ? formValues.gender : '',
    };

    if (isSubmitting) return;

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
        gender: values.gender.trim() || undefined,
      };

      let updatedPerson: Person;

      if (person.isFromUser) {
        // If this person is actually a user, update their personal profile instead.
        // Split the full name into first and last name (basic heuristic).
        const fullName = values.name.trim();
        const [firstName, ...rest] = fullName.split(' ');
        const lastName = rest.join(' ');

        const userResult = await updateUser(person.id, {
          email: values.email.trim() || undefined,
          personalInfo: {
            firstName: firstName || undefined,
            lastName: lastName || undefined,
            phone: values.phone.trim() || undefined,
            address: values.address.trim() || undefined,
            city: values.city.trim() || undefined,
            state: values.state.trim() || undefined,
            // Ya no se editan aquí; se reenvían para no perder lo guardado.
            profession: person.profession || undefined,
            company: person.company || undefined,
            nationality: person.nationality || undefined,
            gender: values.gender.trim() || undefined,
            maritalStatus: person.maritalStatus || undefined,
          },
        });

        if (!userResult.success) {
          throw new Error(userResult.error || 'No se pudo actualizar el usuario');
        }

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
      return;
    } catch (error) {
      showAlert({
        message: `Error al actualizar persona: ${error instanceof Error ? error.message : 'Error desconocido'}`,
        type: 'error',
        duration: 5000,
      });
      setErrors(['No fue posible guardar los cambios en este momento. Intenta nuevamente.']);
      setIsSubmitting(false);
    }
  };

  if (isUserEditBlocked) {
    return (
      <div className="space-y-4 p-4" data-test-id="edit-person-user-forbidden">
        <p className="text-sm text-foreground">{USER_MANAGEMENT_FORBIDDEN_MESSAGE}</p>
        <p className="text-xs text-muted-foreground">
          Esta persona corresponde a un usuario del sistema; sus datos solo pueden ser editados por un administrador o por el propio usuario.
        </p>
        <div className="flex justify-end">
          <button type="button" className="text-sm text-primary" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
    );
  }

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
      stackOnMobile
      rowGap={16}
    />
  );
}
