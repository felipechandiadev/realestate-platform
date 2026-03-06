'use client'

import React, { useState } from 'react'
import { env } from '@/lib/env';
import { AgentType } from './types'
import IconButton from '@/shared/components/ui/IconButton/IconButton'
import LazyImage from '@/shared/components/ui/LazyImage'
import { useAlert } from '@/shared/hooks/useAlert'

interface AgentCardProps {
  agent: AgentType
  onEdit: (agent: AgentType) => void
  onDelete: (agent: AgentType) => void
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'ACTIVE':
      return 'bg-emerald-600'
    case 'INACTIVE':
      return 'bg-amber-600'
    case 'VACATION':
      return 'bg-sky-600'
    case 'LEAVE':
      return 'bg-rose-600'
    default:
      return 'bg-slate-600'
  }
}

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    ACTIVE: 'Activo',
    INACTIVE: 'Inactivo',
    VACATION: 'Vacaciones',
    LEAVE: 'Permiso',
  }
  return labels[status] || status
}

const AgentCard: React.FC<AgentCardProps> = ({ agent, onEdit, onDelete }) => {
  const { showAlert } = useAlert()

  const [showAvatarDialog, setShowAvatarDialog] = useState(false)
  const fullName = agent.personalInfo
    ? `${agent.personalInfo.firstName || ''} ${agent.personalInfo.lastName || ''}`.trim()
    : agent.username
  // Normalizar avatar URL como en AdminCard
  const avatarUrl = agent.personalInfo?.avatarUrl
    ? (agent.personalInfo.avatarUrl.startsWith('http')
        ? agent.personalInfo.avatarUrl
        : `${env.backendApiUrl}${agent.personalInfo.avatarUrl}`)
    : undefined

  return (
    <article className="border border-neutral-200 bg-white rounded-lg shadow-sm p-4 flex flex-col justify-between min-w-[260px]">
      <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-6 md:gap-4 items-stretch">
        {/* Columna del Avatar */}
        <div className="flex justify-center items-center h-full md:h-full md:justify-center md:items-center">
          <div className="relative flex-shrink-0 mx-auto">
            <div className="h-24 w-24 rounded-full bg-neutral-100 border-4 border-secondary flex items-center justify-center overflow-hidden">
              {avatarUrl ? (
                <LazyImage
                  multimedia={{
                    id: agent.id,
                    url: avatarUrl,
                    filename: 'avatar.jpg',
                    variants: []
                  }}
                  variantType="avatar-md"
                  alt={`Avatar ${fullName}`}
                  sizes="96px"
                  className="h-full w-full object-cover"
                  maintainAspectRatio={true}
                />
              ) : (
                <span className="material-symbols-outlined text-secondary" style={{ fontSize: '4rem' }}>person</span>
              )}
            </div>
            {/* El icono 'add' sobre el avatar ha sido removido */}
          </div>
        </div>
        {/* Columna de Información */}
        <div className="flex flex-col gap-4 sm:gap-2 w-full overflow-hidden">
          {/* Status badge */}
          <div className="flex w-full justify-end mb-2">
            <span className={`text-[8px] font-light uppercase px-2 py-0.5 rounded-full ${getStatusColor(agent.status)} text-white`}>
              {getStatusLabel(agent.status)}
            </span>
          </div>
          {/* Nombre */}
          <h3 className="text-lg font-semibold text-foreground truncate break-all">{fullName}</h3>
          {/* Nombre de usuario */}
          <p className="text-xs font-light text-neutral-600 truncate break-all">@{agent.username}</p>
          {/* Correo con icono */}
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-neutral-500" style={{ fontSize: '0.875rem' }}>email</span>
            <p className="text-xs font-light text-neutral-500 truncate break-all">{agent.email}</p>
          </div>
          {/* Teléfono con icono */}
          {agent.personalInfo?.phone && (
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-neutral-500" style={{ fontSize: '0.875rem' }}>phone</span>
              <p className="text-xs font-light text-neutral-500 truncate break-all">{agent.personalInfo.phone}</p>
            </div>
          )}
        </div>
      </div>
      <div className="flex justify-end gap-2 mt-4">
        <IconButton
          icon="edit"
          variant="text"
          size="sm"
          aria-label={`Editar ${fullName}`}
          title="Editar"
          onClick={() => onEdit(agent)}
          className="text-secondary"
        />
        <IconButton
          icon="delete"
          variant="text"
          size="sm"
          aria-label={`Eliminar ${fullName}`}
          title="Eliminar"
          onClick={() => onDelete(agent)}
          className="text-secondary"
        />
      </div>
    </article>
  )
}

export default AgentCard
