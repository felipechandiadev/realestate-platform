'use client'

import React, { useState } from 'react'
import { UpdateBaseForm, BaseUpdateFormField } from '@/shared/components/ui/BaseForm'
import { updateAgent, setAgentStatus } from '@/features/backoffice/users/actions/agents.action'
import { env } from '@/lib/env'
import type { AgentType, AgentStatus } from '../types'

interface UpdateAgentFormProps {
  agent: AgentType | null
  onSubmitSuccess: () => void // Callback after successful update
  onError: (error: string) => void // Callback for errors
  onClose?: () => void // Callback for close button
}

const UpdateAgentForm: React.FC<UpdateAgentFormProps> = ({
  agent,
  onSubmitSuccess,
  onError,
  onClose,
}) => {
  const [loading, setLoading] = useState(false)

  // Initialize form with agent data
  const getInitialState = () => {
    if (!agent) return {}

    const statusMap: Record<string, number> = {
      'ACTIVE': 1,
      'INACTIVE': 2,
      'VACATION': 3,
      'LEAVE': 4,
    }

    // Build full avatar URL if it exists
    let avatarUrl = ''
    if (agent.personalInfo?.avatarUrl) {
      if (agent.personalInfo.avatarUrl.startsWith('http')) {
        avatarUrl = agent.personalInfo.avatarUrl
      } else {
        avatarUrl = `${env.backendApiUrl}${agent.personalInfo.avatarUrl}`
      }
    }

    return {
      username: agent.username || '',
      email: agent.email || '',
      firstName: agent.personalInfo?.firstName || '',
      lastName: agent.personalInfo?.lastName || '',
      phone: agent.personalInfo?.phone || '',
      status: statusMap[agent.status] || 1,
      avatar: avatarUrl,
      avatarFile: null,
    }
  }

  const handleSubmit = async (values: Record<string, any>) => {
    if (!agent) return

    setLoading(true)
    try {
      // Basic validations
      if (!values.username?.trim()) {
        onError('El nombre de usuario es obligatorio')
        setLoading(false)
        return
      }
      if (!values.email?.trim()) {
        onError('El email es obligatorio')
        setLoading(false)
        return
      }

      const statusMap: Record<number, AgentStatus> = {
        1: 'ACTIVE',
        2: 'INACTIVE',
        3: 'VACATION',
        4: 'LEAVE',
      }
      const newStatus = statusMap[values.status] || 'ACTIVE'
      const currentStatus = agent.status

      // Build update data with all fields and avatar file if present
      const updateData: Record<string, any> = {
        username: values.username.trim(),
        email: values.email.trim(),
        firstName: values.firstName?.trim(),
        lastName: values.lastName?.trim(),
        phone: values.phone?.trim(),
      }

      // Siempre enviar avatarFile (null si no hay)
      updateData.avatarFile = values.avatarFile ?? null

      // Call updateAgent with all data at once
      const result = await updateAgent(agent.id, updateData)
      if (!result.success) {
        onError(result.error || 'Error al actualizar el agente')
        setLoading(false)
        return
      }

      // Update status if changed
      if (newStatus !== currentStatus) {
        const statusResult = await setAgentStatus(agent.id, newStatus)
        if (!statusResult.success) {
          onError(statusResult.error || 'Error al actualizar el estado')
          setLoading(false)
          return
        }
      }

      onSubmitSuccess()
    } catch (err) {
      console.error('Error in UpdateAgentForm:', err)
      onError('Error inesperado al actualizar el agente')
    } finally {
      setLoading(false)
    }
  }

  const fields: BaseUpdateFormField[] = [
    {
      name: 'username',
      label: 'Nombre de usuario',
      type: 'text',
      required: true,
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
    },
    {
      name: 'lastName',
      label: 'Apellido',
      type: 'text',
    },
    {
      name: 'phone',
      label: 'Teléfono',
      type: 'text',
    },
    {
      name: 'avatar',
      label: 'Avatar',
      type: 'avatar',
      currentUrl: (() => {
        if (!agent?.personalInfo?.avatarUrl) return undefined
        if (agent.personalInfo.avatarUrl.startsWith('http')) {
          return agent.personalInfo.avatarUrl
        }
        return `${env.backendApiUrl}${agent.personalInfo.avatarUrl}`
      })(),
      acceptedTypes: ['image/jpeg', 'image/png', 'image/webp'],
      maxSize: 2, // MB
      aspectRatio: '1:1',
      buttonText: 'Cambiar avatar',
      previewSize: 'md',
    },
    {
      name: 'status',
      label: 'Estado',
      type: 'select',
      required: true,
      options: [
        { id: 1, label: 'Activo' },
        { id: 2, label: 'Inactivo' },
        { id: 3, label: 'Vacaciones' },
        { id: 4, label: 'Permiso' },
      ],
    },
  ]

  return (
    <UpdateBaseForm
      fields={fields}
      initialState={getInitialState()}
      onSubmit={handleSubmit}
      isSubmitting={loading}
      submitLabel="Guardar Cambios"
      title=""
      subtitle=""
      errors={[]} // Errors handled via onError prop
      columns={1}
      cancelButton={true}
      cancelButtonText="Cerrar"
      onCancel={onClose}
    />
  )
}

export default UpdateAgentForm
