'use client'

import React, { useState } from 'react'
import * as LucideIcons from 'lucide-react'
import { ICON_MAP } from '@/shared/lib/ICON_MAP'
import { Button, type ButtonVariant } from '@realestate/ui'
import { Dialog } from "@realestate/ui"
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

  const openDialog = () => {
    setError(null)
    setIsDeleting(false)
    setOpen(true)
  }

  const handleDelete = async () => {
    if (isDeleting) return

    setIsDeleting(true)
    setError(null)

    try {
      await onDelete()
      setOpen(false)
      // Keep isDeleting true until reopen so the button stays disabled during close animation.
    } catch (err) {
      console.error('Error deleting:', err)
      setError('Ocurrió un error al eliminar. Inténtalo de nuevo.')
      setIsDeleting(false)
    }
  }

  return (
    <>
      <Button
        variant={buttonVariant}
        onClick={openDialog}
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
          onCancel={() => !isDeleting && setOpen(false)}
          errors={error ? [error] : []}
          title="" // Hide title in form since it's in the dialog
        />
      </Dialog>
    </>
  )
}
