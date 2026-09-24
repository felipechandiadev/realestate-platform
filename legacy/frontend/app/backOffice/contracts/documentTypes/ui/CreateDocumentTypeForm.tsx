'use client'

import { useState } from 'react'
import { useAlert } from '@/shared/hooks/useAlert'
import CreateBaseForm, { type BaseFormField } from '@/shared/components/ui/BaseForm/CreateBaseForm'
import { createDocumentType } from '@/features/backoffice/contracts/actions/documentTypes.action'

interface CreateDocumentTypeFormProps {
  onSuccess?: () => void
}

const fields: BaseFormField[] = [
  {
    name: 'name',
    label: 'Nombre',
    type: 'text',
    required: true,
    autoFocus: true,
  },
  {
    name: 'description',
    label: 'Descripción',
    type: 'textarea',
    required: false,
    rows: 4,
  },
]

export default function CreateDocumentTypeForm({ onSuccess }: CreateDocumentTypeFormProps) {
  const { showAlert } = useAlert()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  })
  const [errors, setErrors] = useState<string[]>([])

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setErrors([])
  }

  const validate = (values: Record<string, any>): string[] => {
    const newErrors: string[] = []

    if (!values.name?.trim()) {
      newErrors.push('El nombre es requerido')
    } else if (values.name.length < 3) {
      newErrors.push('El nombre debe tener al menos 3 caracteres')
    }

    return newErrors
  }

  const handleSubmit = async () => {
    const validationErrors = validate(formData)
    if (validationErrors.length > 0) {
      setErrors(validationErrors)
      return
    }

    setIsSubmitting(true)

    const result = await createDocumentType({
      name: formData.name.trim(),
      description: formData.description.trim() || undefined,
      available: true, // Por defecto activo
    })

    setIsSubmitting(false)

    if (result.success) {
      showAlert({
        message: 'Tipo de documento creado exitosamente',
        type: 'success',
        duration: 3000,
      })
      onSuccess?.()
    } else {
      showAlert({
        message: result.error || 'Error al crear el tipo de documento',
        type: 'error',
        duration: 5000,
      })
    }
  }

  return (
    <CreateBaseForm
      fields={fields}
      values={formData}
      onChange={handleChange}
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
      submitLabel="Crear Tipo de Documento"
      errors={errors}
      validate={validate}
    />
  )
}
