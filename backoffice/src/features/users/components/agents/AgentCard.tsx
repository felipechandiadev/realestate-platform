'use client';

import React from 'react';
import { AgentType } from './types';
import { IconButton } from '@realestate/ui';
import { UserAvatarField } from '@/shared/components/ui/Multimedia/UserAvatarField';

interface AgentCardProps {
  agent: AgentType;
  onEdit: (agent: AgentType) => void;
  onDelete: (agent: AgentType) => void;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'ACTIVE':
      return 'bg-emerald-600';
    case 'INACTIVE':
      return 'bg-amber-600';
    case 'VACATION':
      return 'bg-sky-600';
    case 'LEAVE':
      return 'bg-rose-600';
    default:
      return 'bg-slate-600';
  }
};

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    ACTIVE: 'Activo',
    INACTIVE: 'Inactivo',
    VACATION: 'Vacaciones',
    LEAVE: 'Permiso',
  };
  return labels[status] || status;
};

const AgentCard: React.FC<AgentCardProps> = ({ agent, onEdit, onDelete }) => {
  const fullName = agent.personalInfo
    ? `${agent.personalInfo.firstName || ''} ${agent.personalInfo.lastName || ''}`.trim()
    : agent.username;

  return (
    <article className="border border-neutral-200 bg-white rounded-lg shadow-sm p-4 flex flex-col justify-between min-w-[260px] overflow-visible">
      <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-6 md:gap-4 items-stretch">
        <div className="flex justify-center items-center overflow-visible px-2 pb-2 pt-1">
          <UserAvatarField
            userId={agent.id}
            currentAvatarUrl={agent.personalInfo?.avatarUrl}
            size="sm"
            data-test-id={`agent-avatar-${agent.id}`}
          />
        </div>

        <div className="flex flex-col gap-4 sm:gap-2 w-full overflow-hidden">
          <div className="flex w-full justify-end mb-2">
            <span
              className={`text-[8px] font-light uppercase px-2 py-0.5 rounded-full ${getStatusColor(agent.status)} text-white`}
            >
              {getStatusLabel(agent.status)}
            </span>
          </div>

          <h3 className="text-lg font-semibold text-foreground truncate break-all">{fullName}</h3>
          <p className="text-xs font-light text-neutral-600 truncate break-all">@{agent.username}</p>

          <div className="flex items-center gap-2">
            <IconButton icon="email" variant="text" size="sm" className="text-neutral-500" />
            <p className="text-xs font-light text-neutral-500 truncate break-all">{agent.email}</p>
          </div>

          {agent.personalInfo?.phone ? (
            <div className="flex items-center gap-2">
              <IconButton icon="phone" variant="text" size="sm" className="text-neutral-500" />
              <p className="text-xs font-light text-neutral-500 truncate break-all">
                {agent.personalInfo.phone}
              </p>
            </div>
          ) : null}
        </div>
      </div>

      <div className="flex justify-end gap-2 mt-4">
        <IconButton
          icon="edit"
          variant="text"
          size="md"
          aria-label={`Editar ${fullName}`}
          title="Editar"
          onClick={() => onEdit(agent)}
          className="text-secondary"
        />
        <IconButton
          icon="delete"
          variant="text"
          size="md"
          aria-label={`Eliminar ${fullName}`}
          title="Eliminar"
          onClick={() => onDelete(agent)}
          className="text-secondary"
        />
      </div>
    </article>
  );
};

export default AgentCard;
