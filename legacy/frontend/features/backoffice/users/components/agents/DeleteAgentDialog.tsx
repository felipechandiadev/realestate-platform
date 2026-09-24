'use client'

import React, { useState } from 'react'
import Dialog from '@/shared/components/ui/Dialog/Dialog'
import DeleteAgentForm from './DeleteAgentForm'
import type { AgentType } from './types'

interface DeleteAgentDialogProps {
  open: boolean
  onClose: () => void
  agent: AgentType | null
  onSuccess: () => void // Callback to refresh list
}

const DeleteAgentDialog: React.FC<DeleteAgentDialogProps> = ({
  open,
  onClose,
  agent,
  onSuccess,
}) => {
  const [error, setError] = useState<string | null>(null)

  const handleSubmitSuccess = () => {
    setError(null)
    onSuccess()
    onClose()
  }

  const handleError = (errorMsg: string) => {
    setError(errorMsg)
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Eliminar Agente"
      maxWidth="sm"
    >
      <div>
        {error && (
          <div className="mb-4 text-red-600">
            {error}
          </div>
        )}
        <DeleteAgentForm
          agent={agent}
          onSubmitSuccess={handleSubmitSuccess}
          onError={handleError}
          onClose={onClose}
        />
      </div>
    </Dialog>
  )
}

export default DeleteAgentDialog
