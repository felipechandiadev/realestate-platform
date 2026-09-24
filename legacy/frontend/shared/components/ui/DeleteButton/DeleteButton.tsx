'use client'

import React, { useState } from 'react'
import * as LucideIcons from 'lucide-react'
import { ICON_MAP } from '../IconButton/ICON_MAP'
import { Button, ButtonVariant } from '@/shared/components/ui/Button/Button'
import Dialog from '@/shared/components/ui/Dialog/Dialog'
import DeleteBaseForm from '@/shared/components/ui/BaseForm/DeleteBaseForm'

interface DeleteButtonProps {
  onDelete: () => Promise<void> | void
  title?: string
  message?: string
  buttonText?: string
  buttonVariant?: ButtonVariant
  icon?: string
  className?: string
  disabled?: boolean
}

export default function DeleteButton({
  onDelete,
  title = 'Confirmar eliminación',
  message = '¿Estás seguro de que deseas eliminar este elemento? Esta acción no se puede deshacer.',
  buttonText = 'Eliminar',
  buttonVariant = 'primary',
  icon,
  className,
  disabled = false,
}: DeleteButtonProps) {
  const [open, setOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleDelete = async () => {
    try {
      setIsDeleting(true)
      setError(null)
      await onDelete()
      setOpen(false)
    } catch (err) {
      console.error('Error deleting:', err)
      setError('Ocurrió un error al eliminar. Inténtalo de nuevo.')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <Button
        variant={buttonVariant}
        onClick={() => setOpen(true)}
        className={className}
        disabled={disabled}
      >
        {icon && (() => {
          const mappedName = ICON_MAP[icon] || 'HelpCircle'
          const IconComponent = (LucideIcons as any)[mappedName]
          return IconComponent ? <IconComponent size={20} className="mr-2 inline" /> : null
        })()}
        {buttonText}
      </Button>

      <Dialog
        open={open}
        onClose={() => !isDeleting && setOpen(false)}
        title={title}
        size="sm"
      >
        <DeleteBaseForm
          message={message}
          onSubmit={handleDelete}
          isSubmitting={isDeleting}
          cancelButton={true}
          onCancel={() => setOpen(false)}
          errors={error ? [error] : []}
          title="" // Hide title in form since it's in the dialog
        />
      </Dialog>
    </>
  )
}
