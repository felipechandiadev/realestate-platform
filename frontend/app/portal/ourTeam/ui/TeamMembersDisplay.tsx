'use client';

import { TeamMember } from '@/features/backoffice/cms/actions/ourTeam.action';

interface TeamMembersDisplayProps {
  members: TeamMember[];
}

export default function TeamMembersDisplay({ members }: TeamMembersDisplayProps) {
  return (
    <>
      {members.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {members.map((member) => (
            <div
              key={member.id}
              className="bg-card border border-border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              {/* Photo */}
              <div className="relative w-full h-64 bg-gray-100 overflow-hidden flex items-center justify-center">
                {member.multimediaUrl ? (
                  <img
                    src={member.multimediaUrl}
                    alt={member.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      const parent = e.currentTarget.parentElement;
                      if (parent) {
                        const icon = document.createElement('span');
                        icon.className = 'material-symbols-outlined text-gray-400';
                        icon.style.fontSize = '80px';
                        icon.textContent = 'person';
                        parent.appendChild(icon);
                      }
                    }}
                  />
                ) : (
                  <span className="material-symbols-outlined text-gray-400" style={{ fontSize: '80px' }}>
                    person
                  </span>
                )}
              </div>

              {/* Info */}
              <div className="p-6">
                <h3 className="text-lg font-bold text-primary mb-2">
                  {member.name}
                </h3>
                <p className="text-sm font-medium text-accent mb-3">
                  {member.position}
                </p>
                {member.bio && (
                  <p className="text-sm text-foreground mb-4 line-clamp-3">
                    {member.bio}
                  </p>
                )}

                {/* Contact Info */}
                <div className="space-y-2 border-t border-border pt-4">
                  {member.mail && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="material-symbols-outlined text-primary" style={{ fontSize: '18px' }}>
                        mail
                      </span>
                      <a
                        href={`mailto:${member.mail}`}
                        className="text-primary hover:underline truncate"
                      >
                        {member.mail}
                      </a>
                    </div>
                  )}
                  {member.phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="material-symbols-outlined text-primary" style={{ fontSize: '18px' }}>
                        phone
                      </span>
                      <a
                        href={`tel:${member.phone}`}
                        className="text-primary hover:underline"
                      >
                        {member.phone}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <span className="material-symbols-outlined text-gray-400 mx-auto mb-4" style={{ fontSize: '64px' }}>
            people
          </span>
          <p className="text-muted-foreground">
            No hay miembros del equipo disponibles en este momento
          </p>
        </div>
      )}
    </>
  );
}
