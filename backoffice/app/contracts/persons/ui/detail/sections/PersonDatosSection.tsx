'use client';

import { useRouter } from 'next/navigation';
import type { Person } from '@/features/contracts/actions/persons.action';
import EditPersonForm from '../../EditPersonForm';

type PersonDatosSectionProps = {
  person: Person;
};

export function PersonDatosSection({ person }: PersonDatosSectionProps) {
  const router = useRouter();

  return (
    <section className="space-y-6" data-test-id="person-detail-datos-section">
      <EditPersonForm
        person={person}
        onClose={() => {
          router.refresh();
        }}
        onSuccess={() => {
          router.refresh();
        }}
      />
      <div>
        <p className="text-sm text-muted-foreground">Fecha de registro</p>
        <p className="font-medium text-foreground">
          {new Date(person.createdAt).toLocaleDateString('es-CL')}
        </p>
      </div>
    </section>
  );
}
