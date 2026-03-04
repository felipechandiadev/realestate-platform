'use client'

import { useState } from 'react'
import { useAlert } from '@/shared/hooks/useAlert'
import UpdateBaseForm, { type BaseUpdateFormField } from '@/shared/components/ui/BaseForm/UpdateBaseForm'
import { updateDocumentType, type DocumentType } from '@/features/backoffice/contracts/actions/documentTypes.action'

interface UpdateDocumentTypeFormProps {
  documentType: DocumentType
  onSuccess?: () => void
  onCancel?: () => void
}

const fields: BaseUpdateFormField[] = [
  {
    name: 'name',
    label: 'Nombre',
    type: 'text',
    required: true,
  },
  {
    name: 'description',
    label: 'Descripción',
    type: 'textarea',
    required: false,
    rows: 4,
  },
]

export default function UpdateDocumentTypeForm({
  documentType,
  onSuccess,
  onCancel,
}: UpdateDocumentTypeFormProps) {
  const { showAlert } = useAlert()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<string[]>([])

  const initialState = {
    name: documentType.name,
    description: documentType.description || '',
  }

  const handleSubmit = async (values: Record<string, any>) => {
    const validationErrors = validate(values)
    if (validationErrors.length > 0) {
      setErrors(validationErrors)
      return
    }

    setIsSubmitting(true)

    const result = await updateDocumentType(documentType.id, {
      name: values.name.trim(),
      description: values.description.trim() || undefined,
      available: documentType.available, // Mantener el estado actual
    })

    setIsSubmitting(false)

    if (result.success) {
      showAlert({
        message: 'Tipo de documento actualizado exitosamente',
        type: 'success',
        duration: 3000,
      })
      onSuccess?.()
    } else {
      showAlert({
        message: result.error || 'Error al actualizar el tipo de documento',
        type: 'error',
        duration: 5000,
      })
    }
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

  return (
    <UpdateBaseForm
      fields={fields}
      initialState={initialState}
      onSubmit={handleSubmit}
      onCancel={onCancel}
      isSubmitting={isSubmitting}
      submitLabel="Actualizar Tipo de Documento"
      cancelButton={true}
      cancelButtonText="Cancelar"
      errors={errors}
    />
  )
}