'use client'

import React, { useState } from 'react'
import { Slide, deleteSlide } from '@/features/backoffice/cms/actions/slides.action'
import DeleteBaseForm from '@/shared/components/ui/BaseForm/DeleteBaseForm'

interface DeleteSlideFormProps {
  slide: Slide;
  onSuccess?: () => void;
  onCancel?: () => void;
  nested?: boolean;
  formId?: string;
  onLoadingChange?: (isLoading: boolean) => void;
}

export default function DeleteSlideForm({
  slide,
  onSuccess,
  onCancel,
  nested,
  formId,
  onLoadingChange,
}: DeleteSlideFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<string[]>([])

  const handleSubmit = async () => {
    setIsSubmitting(true)
    onLoadingChange?.(true)
    setErrors([])

    try {
      const result = await deleteSlide(slide.id)

      if (result.success) {
        onSuccess?.()
      } else {
        setErrors([result.error || 'Error al eliminar el slide'])
      }
    } catch (error) {
      setErrors(['Error interno del servidor'])
    } finally {
      setIsSubmitting(false)
      onLoadingChange?.(false)
    }
  }

  return (
    <DeleteBaseForm
      formId={formId}
      nested={nested}
      message={`¿Estás seguro de que deseas eliminar el slide "${slide.title}"? Esta acción no se puede deshacer.`}
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
      submitLabel="Eliminar Slide"
      errors={errors}
      data-test-id="delete-slide-form"
      onCancel={onCancel}
      cancelButton={true}
    />
  )
}
