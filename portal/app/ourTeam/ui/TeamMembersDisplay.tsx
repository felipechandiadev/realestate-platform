'use client';

import { useState } from 'react';
import { Mail, Phone, User, Users } from 'lucide-react';
import { TeamMember } from '@/features/cms/actions/ourTeam.action';

interface TeamMembersDisplayProps {
  members: TeamMember[];
}

function MemberPhoto({ name, url }: { name: string; url?: string | null }) {
  const [failed, setFailed] = useState(false);
  const showImage = Boolean(url) && !failed;

  return (
    <div className="relative flex h-64 w-full items-center justify-center overflow-hidden bg-gray-100">
      {showImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={url!}
          alt={name}
          className="h-full w-full object-cover"
          onError={() => setFailed(true)}
        />
      ) : (
        <User size={80} className="text-gray-400" strokeWidth={1.25} aria-hidden />
      )}
    </div>
  );
}

export default function TeamMembersDisplay({ members }: TeamMembersDisplayProps) {
  return (
    <>
      {members.length > 0 ? (
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {members.map((member) => (
            <div
              key={member.id}
              className="overflow-hidden rounded-lg border border-border bg-card shadow-sm transition-shadow hover:shadow-md"
            >
              <MemberPhoto name={member.name} url={member.multimediaUrl} />

              <div className="p-6">
                <h3 className="mb-2 text-lg font-bold text-primary">{member.name}</h3>
                <p className="mb-3 text-sm font-medium text-accent">{member.position}</p>
                {member.bio ? (
                  <p className="mb-4 line-clamp-3 text-sm text-foreground">{member.bio}</p>
                ) : null}

                <div className="space-y-2 border-t border-border pt-4">
                  {member.mail ? (
                    <div className="flex items-center gap-2 text-sm">
                      <Mail size={18} className="shrink-0 text-primary" aria-hidden />
                      <a
                        href={`mailto:${member.mail}`}
                        className="truncate text-primary hover:underline"
                      >
                        {member.mail}
                      </a>
                    </div>
                  ) : null}
                  {member.phone ? (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone size={18} className="shrink-0 text-primary" aria-hidden />
                      <a href={`tel:${member.phone}`} className="text-primary hover:underline">
                        {member.phone}
                      </a>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-12 text-center">
          <Users size={64} className="mx-auto mb-4 text-gray-400" strokeWidth={1.25} aria-hidden />
          <p className="text-muted-foreground">
            No hay miembros del equipo disponibles en este momento
          </p>
        </div>
      )}
    </>
  );
}
