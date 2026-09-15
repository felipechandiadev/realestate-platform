'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { IconButton } from '@realestate/ui';
import BasicInfoSection from '@/features/properties/components/dialogs/fullProperty/BasicInfoSection';
import CharacteristicsSection from '@/features/properties/components/dialogs/fullProperty/CharacteristicsSection';
import LocationSection from '@/features/properties/components/dialogs/fullProperty/LocationSection';
import MultimediaSection from '@/features/properties/components/dialogs/fullProperty/multimedia/MultimediaSection';
import SEOSection from '@/features/properties/components/dialogs/fullProperty/SEOSection';
import InternalNotesSection from '@/features/properties/components/dialogs/fullProperty/InternalNotesSection';
import HistorySection from '@/features/properties/components/dialogs/fullProperty/HistorySection';
import { getPropertyHeaderInfo } from '@/features/properties/actions/properties.action';
import {
  getStatusChipClasses,
  getStatusInSpanish,
} from '@/features/properties/utils';
import { PropertyDetailSectionNav } from './PropertyDetailSectionNav';
import {
  PROPERTY_DETAIL_TABS,
  type PropertyDetailSectionId,
  propertyDetailSectionFromHash,
} from './property-detail-section.types';

export type PropertySalesDetailHeader = {
  title?: string | null;
  code?: string | null;
  status?: string | null;
  isFeatured?: boolean | null;
};

type PropertySalesDetailPageProps = {
  propertyId: string;
  initialHeader: PropertySalesDetailHeader;
};

export function PropertySalesDetailPage({
  propertyId,
  initialHeader,
}: PropertySalesDetailPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [header, setHeader] = useState<PropertySalesDetailHeader>(initialHeader);
  const [activeSection, setActiveSection] = useState<PropertyDetailSectionId>(() => {
    if (typeof window === 'undefined') return 'basica';
    return propertyDetailSectionFromHash(window.location.hash) ?? 'basica';
  });

  useEffect(() => {
    setHeader(initialHeader);
  }, [initialHeader]);

  useEffect(() => {
    const syncFromHash = () => {
      const fromHash = propertyDetailSectionFromHash(window.location.hash);
      if (fromHash) setActiveSection(fromHash);
    };
    syncFromHash();
    window.addEventListener('hashchange', syncFromHash);
    return () => window.removeEventListener('hashchange', syncFromHash);
  }, []);

  const selectSection = useCallback((id: PropertyDetailSectionId) => {
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

  const refreshHeader = useCallback(async () => {
    const response = await getPropertyHeaderInfo(propertyId);
    if (response.success && response.data) {
      setHeader({
        title: response.data.title ?? null,
        code: response.data.code ?? null,
        status: response.data.status ?? null,
        isFeatured: response.data.isFeatured ?? null,
      });
    }
    router.refresh();
  }, [propertyId, router]);

  const goBack = useCallback(() => {
    const returnTo = searchParams.get('returnTo')?.trim();
    if (returnTo && returnTo.startsWith('/properties/sales')) {
      router.push(returnTo);
      return;
    }
    router.push('/properties/sales');
  }, [router, searchParams]);

  const displayTitle = header.title?.trim() || 'Sin título de propiedad';
  const displayStatus = header.status ?? undefined;
  const displayCode = header.code ?? undefined;

  return (
    <div
      className="mx-auto w-full max-w-4xl space-y-3 px-0 py-2 sm:space-y-6 sm:px-6 sm:py-6"
      data-test-id="property-sales-detail-root"
    >
      <header className="border-b border-border pb-2 sm:pb-4" data-test-id="property-sales-detail-header">
        <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1.5 sm:gap-x-3 sm:gap-y-2">
          <IconButton
            icon="ArrowLeft"
            variant="action"
            size="sm"
            onClick={goBack}
            ariaLabel="Volver al listado de ventas"
            data-test-id="property-sales-detail-back"
          />
          <h1
            className="min-w-0 text-xl font-bold tracking-tight text-foreground sm:text-3xl"
            title={displayTitle}
          >
            {displayTitle}
          </h1>
          {header.isFeatured ? (
            <span className="rounded-md bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
              Destacada
            </span>
          ) : null}
          {displayStatus ? (
            <span
              className={`rounded-md px-2 py-1 text-xs font-semibold ${getStatusChipClasses(displayStatus)}`}
            >
              {getStatusInSpanish(displayStatus)}
            </span>
          ) : null}
        </div>
        {displayCode ? (
          <p
            className="mt-1.5 font-mono text-xs text-muted-foreground sm:mt-3 sm:text-sm"
            data-test-id="property-sales-detail-code"
          >
            Código: {displayCode}
          </p>
        ) : null}
        <p className="mt-0.5 hidden font-mono text-xs text-muted-foreground sm:mt-1 sm:block">
          ID: {propertyId}
        </p>
      </header>

      <PropertyDetailSectionNav
        tabs={PROPERTY_DETAIL_TABS}
        activeId={activeSection}
        onSelect={selectSection}
      />

      <div
        id={`property-section-panel-${activeSection}`}
        role="tabpanel"
        aria-labelledby={`property-section-tab-${activeSection}`}
        className="min-h-[16rem]"
        data-test-id="property-sales-detail-section-panel"
        data-active-section={activeSection}
      >
        {activeSection === 'basica' ? (
          <BasicInfoSection propertyId={propertyId} onUpdateSuccess={refreshHeader} />
        ) : null}
        {activeSection === 'caracteristicas' ? (
          <CharacteristicsSection propertyId={propertyId} />
        ) : null}
        {activeSection === 'ubicacion' ? <LocationSection propertyId={propertyId} /> : null}
        {activeSection === 'multimedia' ? <MultimediaSection propertyId={propertyId} /> : null}
        {activeSection === 'seo' ? (
          <SEOSection
            propertyId={propertyId}
            propertyTitle={displayTitle}
            onUpdateSuccess={refreshHeader}
          />
        ) : null}
        {activeSection === 'notas' ? <InternalNotesSection propertyId={propertyId} /> : null}
        {activeSection === 'historial' ? <HistorySection propertyId={propertyId} /> : null}
      </div>
    </div>
  );
}

export default PropertySalesDetailPage;
