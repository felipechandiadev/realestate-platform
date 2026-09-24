'use client'

import React, { useState } from 'react'
import Dialog from '@/shared/components/ui/Dialog/Dialog'
import UpdateAgentForm from './UpdateAgentForm'
import type { AgentType } from './types'

interface UpdateAgentDialogProps {
  open: boolean
  onClose: () => void
  agent: AgentType | null
  onSuccess: () => void // Callback to refresh list
}

const UpdateAgentDialog: React.FC<UpdateAgentDialogProps> = ({
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
      title="Editar Agente"
      maxWidth="md"
    >
      <div>
        {error && (
          <div className="mb-4 text-red-600">
            {error}
          </div>
        )}
        <UpdateAgentForm
          agent={agent}
          onSubmitSuccess={handleSubmitSuccess}
          onError={handleError}
          onClose={onClose}
        />
      </div>
    </Dialog>
  )
}

export default UpdateAgentDialog
