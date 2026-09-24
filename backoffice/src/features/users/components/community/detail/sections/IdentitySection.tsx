'use client';

import Link from 'next/link';
import type { CommunityUserDetailHeader } from '@/features/users/actions/users.action';

function Field({ label, value }: { label: string; value?: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </dt>
      <dd className="text-sm text-foreground break-words">{value || '—'}</dd>
    </div>
  );
}

type IdentitySectionProps = {
  header: CommunityUserDetailHeader;
};

export function IdentitySection({ header }: IdentitySectionProps) {
  const person = header.person;

  if (!person) {
    return (
      <section
        className="rounded-md border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground"
        data-test-id="community-user-identity-empty"
      >
        Este usuario aún no tiene ficha de identidad vinculada
      </section>
    );
  }

  return (
    <section className="space-y-6" data-test-id="community-user-identity-section">
      <dl className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Verificación"
          value={
            <span
              className={`inline-flex rounded-md px-2 py-1 text-xs font-semibold ${
                person.verified
                  ? 'bg-green-100 text-green-800'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              {person.verified ? 'Verificado' : 'Pendiente'}
            </span>
          }
        />
        <Field label="DNI" value={person.dni} />
        <Field label="Teléfono" value={person.phone} />
        <Field label="Email persona" value={person.email} />
        <Field label="Dirección" value={person.address} />
      </dl>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            DNI frente
          </p>
          {person.dniCardFrontUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={person.dniCardFrontUrl}
              alt="DNI frente"
              className="max-h-40 w-full rounded-md border border-border object-contain bg-muted"
            />
          ) : (
            <p className="text-sm text-muted-foreground">Sin imagen</p>
          )}
        </div>
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            DNI dorso
          </p>
          {person.dniCardRearUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={person.dniCardRearUrl}
              alt="DNI dorso"
              className="max-h-40 w-full rounded-md border border-border object-contain bg-muted"
            />
          ) : (
            <p className="text-sm text-muted-foreground">Sin imagen</p>
          )}
        </div>
      </div>

      <Link
        href={`/contracts/persons/${person.id}`}
        className="inline-flex items-center justify-center rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-muted"
        data-test-id="community-user-open-person"
      >
        Abrir ficha de persona
      </Link>
    </section>
  );
}
