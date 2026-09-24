'use client';

import type { CommunityUserDetailHeader } from '@/features/users/actions/users.action';

function Field({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="space-y-1">
      <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </dt>
      <dd className="text-sm text-foreground break-words">{value?.trim() || '—'}</dd>
    </div>
  );
}

type ProfileSectionProps = {
  header: CommunityUserDetailHeader;
};

export function ProfileSection({ header }: ProfileSectionProps) {
  const info = header.personalInfo;
  const hasAny =
    info &&
    Object.values(info).some((v) => typeof v === 'string' && v.trim().length > 0);

  if (!hasAny) {
    return (
      <section
        className="rounded-md border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground"
        data-test-id="community-user-profile-empty"
      >
        Sin datos de perfil
      </section>
    );
  }

  return (
    <section className="space-y-6" data-test-id="community-user-profile-section">
      <div className="flex items-center gap-4">
        {info?.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={info.avatarUrl}
            alt="Avatar"
            className="h-16 w-16 rounded-full object-cover border border-border"
          />
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted text-sm font-semibold text-muted-foreground">
            {(info?.firstName?.[0] || header.email[0] || '?').toUpperCase()}
          </div>
        )}
        <div>
          <p className="font-medium text-foreground">{header.displayName}</p>
          <p className="text-sm text-muted-foreground">{header.email}</p>
        </div>
      </div>

      <dl className="grid gap-4 sm:grid-cols-2">
        <Field label="Nombre" value={info?.firstName} />
        <Field label="Apellido" value={info?.lastName} />
        <Field label="Teléfono" value={info?.phone} />
        <Field label="Dirección" value={info?.address} />
        <Field label="Ciudad" value={info?.city} />
        <Field label="Región" value={info?.state} />
        <Field label="País" value={info?.country} />
        <Field label="Profesión" value={info?.profession} />
        <Field label="Empresa" value={info?.company} />
        <Field label="Nacionalidad" value={info?.nationality} />
        <Field label="Género" value={info?.gender} />
        <Field label="Estado civil" value={info?.maritalStatus} />
      </dl>
    </section>
  );
}
