'use client'

import React, { useState } from 'react'
import { DeleteBaseForm } from '@/shared/components/ui/BaseForm'
import { deleteAgent } from '@/features/backoffice/users/actions/agents.action'
import type { AgentType } from '../types'

interface DeleteAgentFormProps {
  agent: AgentType | null
  onSubmitSuccess: () => void
  onError: (error: string) => void
  onClose?: () => void
}

const DeleteAgentForm: React.FC<DeleteAgentFormProps> = ({
  agent,
  onSubmitSuccess,
  onError,
  onClose,
}) => {
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!agent) return

    setLoading(true)
    try {
      const result = await deleteAgent(agent.id)
      if (!result.success) {
        onError(result.error || 'Error al eliminar el agente')
        setLoading(false)
        return
      }

      onSubmitSuccess()
    } catch (err) {
      onError('Error inesperado al eliminar el agente')
    } finally {
      setLoading(false)
    }
  }

  const fullName = agent
    ? `${agent.personalInfo?.firstName ?? ''} ${agent.personalInfo?.lastName ?? ''}`.trim() ||
      agent.username ||
      agent.email
    : ''

  return (
    <DeleteBaseForm
      message={`¿Estás seguro de que quieres eliminar al agente "${fullName}"?`}
      subtitle="Esta acción no se puede deshacer."
      title=""
      isSubmitting={loading}
      submitLabel="Eliminar"
      onSubmit={handleSubmit}
      cancelButton={true}
      cancelButtonText="Cancelar"
      onCancel={onClose}
    />
  )
}

export default DeleteAgentForm
