'use client';

import type { CommunityUserDetailHeader } from '@/features/users/actions/users.action';

type ActivitySectionProps = {
  header: CommunityUserDetailHeader;
};

function formatDate(value?: string | null) {
  if (!value) return null;
  try {
    return new Date(value).toLocaleString('es-CL');
  } catch {
    return value;
  }
}

export function ActivitySection({ header }: ActivitySectionProps) {
  const events: { id: string; label: string; at: string }[] = [];

  if (header.createdAt) {
    events.push({
      id: 'registered',
      label: 'Cuenta registrada',
      at: header.createdAt,
    });
  }
  if (header.emailVerified) {
    events.push({
      id: 'verified',
      label: 'Email verificado',
      at: header.updatedAt || header.createdAt || new Date().toISOString(),
    });
  }
  if (header.lastLogin) {
    events.push({
      id: 'login',
      label: 'Último acceso',
      at: header.lastLogin,
    });
  }
  if (header.status) {
    events.push({
      id: 'status',
      label: `Estado actual: ${header.status === 'ACTIVE' ? 'Activo' : header.status}`,
      at: header.updatedAt || header.createdAt || new Date().toISOString(),
    });
  }

  events.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());

  if (events.length === 0) {
    return (
      <section
        className="rounded-md border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground"
        data-test-id="community-user-activity-empty"
      >
        Sin actividad registrada
      </section>
    );
  }

  return (
    <section className="space-y-0" data-test-id="community-user-activity-section">
      <ol className="relative border-l border-border ml-2 space-y-4">
        {events.map((event) => (
          <li key={event.id} className="ml-4">
            <span className="absolute -left-1.5 mt-1.5 h-3 w-3 rounded-full border border-border bg-background" />
            <p className="text-sm font-medium text-foreground">{event.label}</p>
            <time className="text-xs text-muted-foreground">{formatDate(event.at)}</time>
          </li>
        ))}
      </ol>
    </section>
  );
}
