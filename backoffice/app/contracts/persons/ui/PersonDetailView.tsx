'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle } from 'lucide-react';
import type { Person } from '@/features/contracts/actions/persons.action';
import { IconButton } from '@realestate/ui';
import { PersonDetailSectionNav } from './detail/PersonDetailSectionNav';
import {
  PERSON_DETAIL_TABS,
  type PersonDetailSectionId,
  personDetailSectionFromHash,
} from './detail/person-detail-section.types';
import { PersonDatosSection } from './detail/sections/PersonDatosSection';
import { PersonIdentidadSection } from './detail/sections/PersonIdentidadSection';
import { PersonDocumentosSection } from './detail/sections/PersonDocumentosSection';

interface PersonDetailViewProps {
  person: Person;
}

export default function PersonDetailView({ person }: PersonDetailViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeSection, setActiveSection] = useState<PersonDetailSectionId>('datos');

  useEffect(() => {
    const syncFromHash = () => {
      const fromHash = personDetailSectionFromHash(window.location.hash);
      if (fromHash) setActiveSection(fromHash);
    };
    syncFromHash();
    window.addEventListener('hashchange', syncFromHash);
    return () => window.removeEventListener('hashchange', syncFromHash);
  }, []);

  const selectSection = useCallback((id: PersonDetailSectionId) => {
    setActiveSection(id);
    const nextHash = `#${id}`;
    if (window.location.hash !== nextHash) {
      window.history.replaceState(
        null,
        '',
        `${window.location.pathname}${window.location.search}${nextHash}`,
      );
    }
  }, []);

  const goBack = useCallback(() => {
    const returnTo = searchParams.get('returnTo')?.trim();
    if (returnTo && returnTo.startsWith('/contracts/persons')) {
      router.push(returnTo);
      return;
    }
    router.push('/contracts/persons');
  }, [router, searchParams]);

  return (
    <div
      className="mx-auto w-full max-w-4xl space-y-3 px-0 py-2 sm:space-y-6 sm:px-6 sm:py-6"
      data-test-id="person-detail-root"
    >
      <header
        className="border-b border-border pb-2 sm:pb-4"
        data-test-id="person-detail-header"
      >
        <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1.5 sm:gap-x-3 sm:gap-y-2">
          <IconButton
            icon="arrow_back"
            variant="action"
            size="sm"
            onClick={goBack}
            ariaLabel="Volver al listado de personas"
            title="Volver"
            data-test-id="person-detail-back"
          />
          <h1
            className="min-w-0 text-xl font-bold tracking-tight text-foreground sm:text-3xl"
            title={person.name || 'Sin nombre'}
          >
            {person.name || 'Sin nombre'}
          </h1>
          <span
            className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold ${
              person.verified
                ? 'bg-blue-100 text-blue-800'
                : 'bg-amber-100 text-amber-800'
            }`}
          >
            {person.verified ? (
              <>
                <CheckCircle className="h-3.5 w-3.5" aria-hidden />
                Verificado
              </>
            ) : (
              'Pendiente'
            )}
          </span>
        </div>
        {person.email ? (
          <p className="mt-1.5 text-sm text-muted-foreground sm:mt-3">{person.email}</p>
        ) : null}
        {person.dni ? (
          <p className="mt-0.5 font-mono text-xs text-muted-foreground">
            Doc: {person.dni}
          </p>
        ) : null}
        <p className="mt-0.5 hidden font-mono text-xs text-muted-foreground sm:block">
          ID: {person.id}
        </p>
      </header>

      <PersonDetailSectionNav
        tabs={PERSON_DETAIL_TABS}
        activeId={activeSection}
        onSelect={selectSection}
      />

      <div
        id={`person-section-panel-${activeSection}`}
        role="tabpanel"
        aria-labelledby={`person-section-tab-${activeSection}`}
        className="min-h-[16rem]"
        data-test-id="person-detail-section-panel"
        data-active-section={activeSection}
      >
        {activeSection === 'datos' ? <PersonDatosSection person={person} /> : null}
        {activeSection === 'identidad' ? (
          <PersonIdentidadSection person={person} />
        ) : null}
        {activeSection === 'documentos' ? (
          <PersonDocumentosSection personId={person.id} />
        ) : null}
      </div>
    </div>
  );
}
