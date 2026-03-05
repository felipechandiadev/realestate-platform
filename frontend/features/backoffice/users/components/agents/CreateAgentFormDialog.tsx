'use client'

import React, { useState } from 'react'
import Dialog from '@/shared/components/ui/Dialog/Dialog'
import CreateBaseForm, { BaseFormField } from '@/shared/components/ui/BaseForm/CreateBaseForm'
import { createAgent } from '@/features/backoffice/users/actions/agents.action'
import { useAlert } from '@/shared/hooks/useAlert'
import { AgentType } from './types'

interface CreateAgentFormDialogProps {
  open: boolean
  onClose: () => void
  onSuccess?: () => void
}

interface AgentFormData {
  username: string
  email: string
  password: string
  confirmPassword: string
  firstName: string
  lastName: string
  phone: string
  avatarFile: File | null
}

export default function CreateAgentFormDialog({
  open,
  onClose,
  onSuccess,
}: CreateAgentFormDialogProps) {
  const { showAlert } = useAlert()
  const [values, setValues] = useState<AgentFormData>({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
    avatarFile: null,
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<string[]>([])

  const handleChange = (field: string, value: any) => {
    setValues((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const validateForm = (formValues: AgentFormData): string[] => {
    const validationErrors: string[] = []

    if (!formValues.username.trim()) {
      validationErrors.push('El nombre de usuario es requerido')
    } else if (formValues.username.trim().length < 3) {
      validationErrors.push('El nombre de usuario debe tener al menos 3 caracteres')
    }

    if (!formValues.email.trim()) {
      validationErrors.push('El email es requerido')
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formValues.email)) {
      validationErrors.push('El email no es válido')
    }

    if (!formValues.firstName.trim()) {
      validationErrors.push('El nombre es requerido')
    }

    if (!formValues.lastName.trim()) {
      validationErrors.push('El apellido es requerido')
    }

    if (!formValues.password) {
      validationErrors.push('La contraseña es requerida')
    } else if (formValues.password.length < 8) {
      validationErrors.push('La contraseña debe tener al menos 8 caracteres')
    }

    if (!formValues.confirmPassword) {
      validationErrors.push('Debe confirmar la contraseña')
    } else if (formValues.password !== formValues.confirmPassword) {
      validationErrors.push('Las contraseñas no coinciden')
    }

    return validationErrors
  }

  const handleSubmit = async () => {
    const validationErrors = validateForm(values)
    if (validationErrors.length > 0) {
      setErrors(validationErrors)
      showAlert({
        message: 'Por favor corrige los errores del formulario',
        type: 'error',
        duration: 4000,
      })
      return
    }

    setIsSubmitting(true)
    setErrors([])

    try {
      console.log('[CreateAgentFormDialog] Submitting with:', {
        username: values.username,
        email: values.email,
        firstName: values.firstName,
        lastName: values.lastName,
        phone: values.phone,
        hasAvatar: !!values.avatarFile,
      })

      const result = await createAgent({
        username: values.username.trim(),
        email: values.email.trim().toLowerCase(),
        password: values.password,
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim(),
        phone: values.phone.trim() || undefined,
        avatarFile: values.avatarFile || undefined,
      })

      console.log('[CreateAgentFormDialog] Result:', result)

      if (result.success) {
        showAlert({
          message: 'Agente creado exitosamente',
          type: 'success',
          duration: 3000,
        })
        handleClose()
        onSuccess?.()
      } else {
        const errorMsg = result.error || 'Error al crear agente'
        console.error('[CreateAgentFormDialog] Creation failed:', errorMsg)
        setErrors([errorMsg])
        showAlert({
          message: errorMsg,
          type: 'error',
          duration: 5000,
        })
      }
    } catch (error) {
      console.error('[CreateAgentFormDialog] Exception:', error)
      const errorMsg = error instanceof Error ? error.message : 'Error interno del servidor'
      setErrors([errorMsg])
      showAlert({
        message: errorMsg,
        type: 'error',
        duration: 5000,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

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
    })
    setErrors([])
    onClose()
  }

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
      maxSize: 2 * 1024 * 1024, // 2MB
    },
  ]

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      title="Crear Nuevo Agente"
      maxWidth="sm"
    >
      <div className="p-4">
        <CreateBaseForm
          fields={fields}
          values={values}
          onChange={handleChange}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          errors={errors}
          submitLabel="Crear Agente"
          cancelButton={true}
          cancelButtonText="Cancelar"
          onCancel={handleClose}
        />
      </div>
    </Dialog>
  )
}
