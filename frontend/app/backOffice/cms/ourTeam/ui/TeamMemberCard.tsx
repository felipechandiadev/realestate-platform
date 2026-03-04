'use client';

import React from 'react';
import IconButton from '@/shared/components/ui/IconButton/IconButton';
import type { TeamMember } from '@/features/backoffice/cms/actions/ourTeam.action';

export interface TeamMemberCardProps {
  member: TeamMember;
  onEdit: () => void;
  onDelete: () => void;
}

export default function TeamMemberCard({
  member,
  onEdit,
  onDelete,
}: TeamMemberCardProps) {
  const hasPhoto = member.multimediaUrl && member.multimediaUrl.trim();

  return (
    <article className="bg-card rounded-lg border border-border shadow-sm hover:shadow-md transition-shadow flex flex-col h-full relative overflow-hidden">
      
      {/* Imagen con aspect ratio 16:9 */}
      <div className="w-full overflow-hidden">
        {hasPhoto ? (
          <img
            src={member.multimediaUrl}
            alt={member.name}
            className="w-full aspect-video object-cover"
            onError={(e) => {
              const parent = e.currentTarget.parentElement;
              if (parent) {
                parent.innerHTML = `
                  <div class="w-full aspect-video bg-gray-100 flex items-center justify-center">
                    <span class="material-symbols-outlined text-gray-400" style="font-size: 40px">
                      person
                    </span>
                  </div>
                `;
              }
            }}
          />
        ) : (
          <div className="w-full aspect-video bg-gray-100 flex items-center justify-center">
            <span className="material-symbols-outlined text-gray-400" style={{ fontSize: '40px' }}>
              person
            </span>
          </div>
        )}
      </div>

      {/* Contenido principal - padding py-2 px-4 */}
      <div className="space-y-2 flex-1 py-2 px-4">
        <h3 className="text-lg font-semibold text-foreground line-clamp-2">
          {member.name}
        </h3>

        <p className="text-sm text-primary font-medium">
          {member.position}
        </p>

        {/* Metadata con iconos */}
        <div className="flex flex-col gap-2 text-xs text-muted-foreground pt-2">
          {member.mail && (
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-base">mail</span>
              <span className="truncate">{member.mail}</span>
            </div>
          )}

          {member.phone && (
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-base">phone</span>
              <span>{member.phone}</span>
            </div>
          )}
        </div>

        {member.bio && (
          <p className="text-sm text-muted-foreground line-clamp-2 pt-1">
            {member.bio}
          </p>
        )}
      </div>

      {/* Footer de acciones - padding px-4 pb-2 */}
      <div className="flex justify-end items-center gap-2 mt-2 px-4 pb-2">
        <IconButton
          icon="edit"
          variant="text"
          onClick={onEdit}
          ariaLabel={`Editar ${member.name}`}
        />
        <IconButton
          icon="delete"
          variant="text"
          className="text-red-500"
          onClick={onDelete}
          ariaLabel={`Eliminar ${member.name}`}
        />
      </div>
    </article>
  );
}
