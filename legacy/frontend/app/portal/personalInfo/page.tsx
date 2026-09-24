/**
 * Personal Information Page (Portal - User Profile)
 * 
 * Propósito:
 * - Perfil y datos personales del usuario autenticado
 * - Actualizar información: nombre, teléfono, dirección, etc.
 * - Gestionar avatar/foto de perfil
 * - Vincular persona (DNI, documentos de identidad)
 * - Verificación de identidad con carga de documentos
 * 
 * Funcionalidad:
 * - Client component: requiere autenticación (useSession)
 * - Carga perfil completo: user + personalInfo + person
 * - UpdateBaseForm con campos agrupados (personal, ubicación, identidad)
 * - Upload de avatar y documentos DNI (frente/reverso)
 * - Validación y actualización con acciones: updateUserProfile, updateUserAvatar, updatePerson
 * - Estados de verificación (verified badge)
 * - Loading states y feedback con alerts
 * 
 * Audiencia: Usuarios registrados gestionando su perfil
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import UpdateBaseForm, { BaseUpdateFormField, BaseUpdateFormFieldGroup } from '@/shared/components/ui/BaseForm/UpdateBaseForm';
import { getCurrentUserProfile, updateUserProfile, updateUserAvatar, updatePerson, createPerson, uploadMultimediaDni } from '@/features/backoffice/users/actions/users.action';
import { useAlert } from '@/shared/hooks/useAlert';

interface PersonData {
  id: string;
  dni?: string;
  address?: string;
  phone?: string;
  email?: string;
  dniCardFrontUrl?: string;
  dniCardRearUrl?: string;
  verified: boolean;
}

interface UserProfile {
  id: string;
  username: string;
  email: string;
  personalInfo?: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    avatarUrl?: string;
    profession?: string;
    company?: string;
    nationality?: string;
    gender?: string;
    maritalStatus?: string;
  };
  person?: PersonData;
  role: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export default function PersonalInfoPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { showAlert } = useAlert();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load user profile on mount
  useEffect(() => {
    async function loadProfile() {
      try {
        if (status === 'unauthenticated') {
          router.push('/portal');
          return;
        }

        if (status !== 'authenticated') {
          return;
        }

        const result = await getCurrentUserProfile();
        if (result.success && result.data) {
          setUserProfile(result.data as UserProfile);
          setError(null);
        } else {
          setError(result.error || 'Error al cargar el perfil');
          showAlert({
            message: result.error || 'No se pudo cargar el perfil',
            type: 'error',
            duration: 3000,
          });
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Error desconocido';
        setError(message);
        showAlert({
          message,
          type: 'error',
          duration: 3000,
        });
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [status, router, showAlert]);

  // Define form field groups (User + Person data combined)
  const formFieldGroups: BaseUpdateFormFieldGroup[] = [
    {
      title: '',
      subtitle: '',
      columns: 1,
      fields: [
        {
          name: 'avatar',
          label: 'Foto de Perfil',
          type: 'avatar',
          currentUrl: userProfile?.personalInfo?.avatarUrl,
          maxSize: 5,
          aspectRatio: '1:1',
          buttonText: 'Cambiar Foto',
          labelText: 'Foto de Perfil',
          previewSize: 'md',
        },
      ] as BaseUpdateFormField[],
    },
    {
      title: '',
      columns: 2,
      fields: [
        {
          name: 'firstName',
          label: 'Nombre',
          type: 'text',
          required: true,
          startIcon: 'person',
        },
        {
          name: 'lastName',
          label: 'Apellido',
          type: 'text',
          required: true,
          startIcon: 'person',
        },
        {
          name: 'email',
          label: 'Correo Electrónico',
          type: 'email',
          required: true,
          startIcon: 'email',
          disabled: true,
        },
        {
          name: 'phone',
          label: 'Teléfono',
          type: 'text',
          startIcon: 'phone',
        },
      ] as BaseUpdateFormField[],
    },
    {
      title: 'Información Personal Detallada',
      subtitle: 'Datos adicionales de identificación y ubicación',
      columns: 2,
      className: 'pt-8',
      fields: [
        {
          name: 'dni',
          label: 'Documento de Identidad (DNI)',
          type: 'dni',
          startIcon: 'badge',
        },
        {
          name: 'profession',
          label: 'Profesión',
          type: 'text',
          startIcon: 'work',
        },
        {
          name: 'company',
          label: 'Empresa',
          type: 'text',
          startIcon: 'business',
        },
        {
          name: 'nationality',
          label: 'Nacionalidad',
          type: 'text',
          startIcon: 'public',
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
          startIcon: 'person',
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
          startIcon: 'people',
        },
      ] as BaseUpdateFormField[],
    },
    {
      title: 'Información de Ubicación',
      subtitle: 'Tu domicilio y ubicación geográfica',
      columns: 2,
      fields: [
        {
          name: 'address',
          label: 'Dirección',
          type: 'text',
          startIcon: 'location_on',
        },
        {
          name: 'city',
          label: 'Ciudad',
          type: 'text',
          startIcon: 'location_city',
        },
        {
          name: 'state',
          label: 'Región',
          type: 'text',
          startIcon: 'map',
        },
        {
          name: 'country',
          label: 'País',
          type: 'text',
          startIcon: 'public',
        },
      ] as BaseUpdateFormField[],
    },
    {
      title: 'Documentos de Identidad',
      subtitle: 'Copia de tu documento de identidad (frente y reverso)',
      columns: 2,
      fields: [
        {
          name: 'dniCardFront',
          label: 'Foto Frente del DNI',
          labelClassName: 'mt-6',
          type: 'image',
          currentUrl: userProfile?.person?.dniCardFrontUrl,
          maxSize: 5,
          aspectRatio: '16:9',
          variant: 'banner',
          buttonText: 'Subir Frente',
          startIcon: 'image',
        },
        {
          name: 'dniCardRear',
          label: 'Foto Reverso del DNI',
          labelClassName: 'mt-6',
          type: 'image',
          currentUrl: userProfile?.person?.dniCardRearUrl,
          maxSize: 5,
          aspectRatio: '16:9',
          variant: 'banner',
          buttonText: 'Subir Reverso',
          startIcon: 'image',
        },
      ] as BaseUpdateFormField[],
    },
  ];

  const handleSubmit = async (values: Record<string, any>) => {
    setSubmitting(true);
    try {
      if (!userProfile) {
        showAlert({
          message: 'Perfil no disponible',
          type: 'error',
          duration: 3000,
        });
        return;
      }

      // Handle avatar separately if it's a File
      let avatarUrl = userProfile.personalInfo?.avatarUrl;
      const avatarFile = values.avatarFile;
      if (avatarFile instanceof File) {
        const formData = new FormData();
        formData.append('file', avatarFile);

        const avatarResult = await updateUserAvatar(userProfile.id, formData);
        if (!avatarResult.success) {
          showAlert({
            message: avatarResult.error || 'Error al actualizar la foto de perfil',
            type: 'error',
            duration: 3000,
          });
          setSubmitting(false);
          return;
        }
        avatarUrl = avatarResult.data?.avatarUrl;
      }

      // Handle DNI document uploads
      let dniCardFrontId: string | undefined = undefined;
      let dniCardRearId: string | undefined = undefined;

      // Upload DNI front if it's a File
      const dniCardFrontFile = values.dniCardFrontFile;
      if (dniCardFrontFile instanceof File) {
        const frontResult = await uploadMultimediaDni(dniCardFrontFile, 'DNI_FRONT');
        if (!frontResult.success) {
          showAlert({
            message: frontResult.error || 'Error al subir foto del frente del DNI',
            type: 'error',
            duration: 3000,
          });
          setSubmitting(false);
          return;
        }
        dniCardFrontId = frontResult.data?.id;
      }

      // Upload DNI rear if it's a File
      const dniCardRearFile = values.dniCardRearFile;
      if (dniCardRearFile instanceof File) {
        const rearResult = await uploadMultimediaDni(dniCardRearFile, 'DNI_REAR');
        if (!rearResult.success) {
          showAlert({
            message: rearResult.error || 'Error al subir foto del reverso del DNI',
            type: 'error',
            duration: 3000,
          });
          setSubmitting(false);
          return;
        }
        dniCardRearId = rearResult.data?.id;
      }

      // Prepare User (personalInfo) update data
      const userUpdateData: any = {
        personalInfo: {
          firstName: values.firstName || userProfile.personalInfo?.firstName,
          lastName: values.lastName || userProfile.personalInfo?.lastName,
          phone: values.phone || userProfile.personalInfo?.phone,
          address: values.address || userProfile.personalInfo?.address,
          city: values.city || userProfile.personalInfo?.city,
          state: values.state || userProfile.personalInfo?.state,
          country: values.country || userProfile.personalInfo?.country,
          avatarUrl: avatarUrl,
          profession: values.profession || userProfile.personalInfo?.profession,
          company: values.company || userProfile.personalInfo?.company,
          nationality: values.nationality || userProfile.personalInfo?.nationality,
          gender: values.gender || userProfile.personalInfo?.gender,
          maritalStatus: values.maritalStatus || userProfile.personalInfo?.maritalStatus,
        },
      };

      // Prepare Person update data
      let personResult: any = null;
      const personData = {
        name: `${values.firstName || userProfile.personalInfo?.firstName || ''} ${values.lastName || userProfile.personalInfo?.lastName || ''}`.trim(),
        dni: values.dni || userProfile.person?.dni,
        address: values.address || userProfile.personalInfo?.address || userProfile.person?.address,
        phone: values.phone || userProfile.personalInfo?.phone || userProfile.person?.phone,
        email: userProfile.email,
        city: values.city || userProfile.personalInfo?.city || userProfile.person?.city,
        state: values.state || userProfile.personalInfo?.state || userProfile.person?.state,
        userId: userProfile.id,
        dniCardFrontId: dniCardFrontId || undefined,
        dniCardRearId: dniCardRearId || undefined,
      };

      if (userProfile.person?.id) {
        // Update existing person
        personResult = await updatePerson(userProfile.person.id, personData);
      } else {
        // Create new person and link to user
        personResult = await createPerson(personData);
        if (personResult.success && personResult.data?.id) {
          userUpdateData.personId = personResult.data.id;
        }
      }

      // Update user profile
      const userResult = await updateUserProfile(userProfile.id, userUpdateData);
      if (!userResult.success) {
        showAlert({
          message: userResult.error || 'Error al actualizar el perfil',
          type: 'error',
          duration: 3000,
        });
        setSubmitting(false);
        return;
      }

      if (personResult && !personResult.success) {
        showAlert({
          message: personResult.error || 'Error al actualizar información personal detallada',
          type: 'warning',
          duration: 3000,
        });
      }

      // Update local state with new profile
      setUserProfile(userResult.data as UserProfile);
      showAlert({
        message: 'Perfil actualizado exitosamente',
        type: 'success',
        duration: 3000,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido';
      showAlert({
        message,
        type: 'error',
        duration: 3000,
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex justify-center"><span className="material-symbols-outlined animate-spin">progress_activity</span></div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-foreground">Por favor inicia sesión para ver tu perfil</p>
      </div>
    );
  }

  if (error && !userProfile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex justify-center"><span className="material-symbols-outlined animate-spin">progress_activity</span></div>
      </div>
    );
  }

  const initialValues = {
    avatar: userProfile.personalInfo?.avatarUrl || null,
    firstName: userProfile.personalInfo?.firstName || '',
    lastName: userProfile.personalInfo?.lastName || '',
    email: userProfile.email,
    phone: userProfile.personalInfo?.phone || userProfile.person?.phone || '',
    address: userProfile.personalInfo?.address || userProfile.person?.address || '',
    city: userProfile.personalInfo?.city || userProfile.person?.city || '',
    state: userProfile.personalInfo?.state || userProfile.person?.state || '',
    country: userProfile.personalInfo?.country || '',
    // Person data
    dni: userProfile.person?.dni || '',
    profession: userProfile.personalInfo?.profession || '',
    company: userProfile.personalInfo?.company || '',
    nationality: userProfile.personalInfo?.nationality || '',
    gender: userProfile.personalInfo?.gender || '',
    maritalStatus: userProfile.personalInfo?.maritalStatus || '',
    // DNI documents
    dniCardFront: userProfile.person?.dniCardFrontUrl || null,
    dniCardRear: userProfile.person?.dniCardRearUrl || null,
  };

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900">
          Mi Información Personal
        </h1>
        <p className="mt-2 text-gray-600">
          Actualiza tu información personal y foto de perfil
        </p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <UpdateBaseForm
          fields={formFieldGroups}
          initialState={initialValues}
          onSubmit={handleSubmit}
          isSubmitting={submitting}
          submitLabel="Guardar Cambios"
          submitVariant="primary"
          cancelButton
          onCancel={() => router.back()}
        />
      </div>
    </div>
  );
}
