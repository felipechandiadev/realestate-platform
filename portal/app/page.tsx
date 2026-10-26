import type { Metadata } from 'next';
import { pageMetadata } from '@/shared/lib/seo-core';
/**
 * Portal Homepage
 */

import FeaturedSection from '@/app/ui/FeaturedSection';
import {
  getPublishedFeaturedProperties,
  getPublishedFeaturedPropertiesPublic,
} from '@/features/shared/properties/actions/properties.action';
import { getPublishedPropertiesFiltered } from '@/features/properties/actions/portalProperties.action';
import Slider from './ui/Slider';
import PortalClient from './PortalClient';
import TestimonialsBand from './ui/TestimonialsBand';
import { listPublicTestimonials } from '@/features/cms/actions/testimonials.action';
import { getIdentity } from '@/features/cms/actions/identity.action';
import { getPortalListingsSettings } from '@/features/cms/actions/portal-listings.action';
import { getPortalFeaturedSettings } from '@/features/cms/actions/portal-featured.action';
import { getPublicSlides } from '@/features/cms/actions/slides.action';

interface PortalPageProps {
  searchParams: Promise<{
    operation?: string;
    typeProperty?: string;
    state?: string;
    city?: string;
    currency?: string;
    page?: string;
    types?: string;
    features?: string;
    featured_page?: string;
  }>;
}

export async function generateMetadata(): Promise<Metadata> {
  const identity = await getIdentity().catch(() => null);
  const name = identity?.name?.trim() || 'Bravo Shott Propiedades';
  const seo = pageMetadata({
    path: '/',
    title: name,
    description:
      'Casas, departamentos y terrenos en venta y arriendo. Administración y tasación de propiedades con asesoría personalizada.',
  });
  return { ...seo, title: { absolute: name } };
}

export default async function PortalPage({ searchParams }: PortalPageProps) {
  const params = await searchParams;

  const operation = params.operation || '';
  const typeProperty = params.typeProperty || '';
  const state = params.state || '';
  const city = params.city || '';
  const currency = params.currency || '';
  const page = params.page || '';
  const types = params.types || '';
  const features = params.features || '';
  const featuredPage = params.featured_page ? Math.max(1, parseInt(params.featured_page, 10) || 1) : 1;

  const [
    featuredSettingsSettled,
    featuredResultSettled,
    propertiesResultSettled,
    testimonialsSettled,
    identitySettled,
    listingsSettled,
    slidesSettled,
  ] = await Promise.allSettled([
    getPortalFeaturedSettings(),
    getPublishedFeaturedPropertiesPublic(),
    getPublishedPropertiesFiltered({
      currency: currency,
      state: state,
      city: city,
      typeProperty: typeProperty,
      typeIds: types || undefined,
      otherFeatures: features || undefined,
      operation: operation,
      page: page ? parseInt(page) : 1,
    }),
    listPublicTestimonials(),
    getIdentity(),
    getPortalListingsSettings(),
    getPublicSlides(),
  ]);

  if (featuredResultSettled.status === 'rejected') {
    console.warn('[PortalPage] Featured properties unavailable');
  }
  if (propertiesResultSettled.status === 'rejected') {
    console.warn('[PortalPage] Filtered properties unavailable');
  }
  if (testimonialsSettled.status === 'rejected') {
    console.warn('[PortalPage] Testimonials unavailable');
  }
  if (slidesSettled.status === 'rejected') {
    console.warn('[PortalPage] Slides unavailable');
  }

  const featuredSettings =
    featuredSettingsSettled.status === 'fulfilled'
      ? featuredSettingsSettled.value
      : {
          layoutDesktop: 'band' as const,
          gridColumns: 3,
          gridRows: 2,
          pageSize: 6,
        };

  const featuredResult =
    featuredResultSettled.status === 'fulfilled' ? featuredResultSettled.value : null;
  const result =
    propertiesResultSettled.status === 'fulfilled' ? propertiesResultSettled.value : null;
  const testimonials =
    testimonialsSettled.status === 'fulfilled' ? testimonialsSettled.value : [];
  const identity = identitySettled.status === 'fulfilled' ? identitySettled.value : null;
  const listings =
    listingsSettled.status === 'fulfilled'
      ? listingsSettled.value
      : { listingsFilterVariant: 'classic' as const };
  const slidesResult =
    slidesSettled.status === 'fulfilled' ? slidesSettled.value : null;
  const companyName = typeof identity?.name === 'string' ? identity.name.trim() : '';

  const bandProperties = featuredResult?.data ?? [];
  const properties = result?.data ?? [];
  const pagination = result?.pagination;
  const filterVariant = listings.listingsFilterVariant;
  const initialSlides =
    slidesResult?.success && Array.isArray(slidesResult.data)
      ? slidesResult.data
      : undefined;

  let gridProperties = bandProperties;
  let featuredPagination:
    | {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
      }
    | undefined;

  if (featuredSettings.layoutDesktop === 'grid' && bandProperties.length > 0) {
    const gridResult = await getPublishedFeaturedProperties(
      featuredPage,
      featuredSettings.pageSize,
    );
    if (gridResult.success) {
      gridProperties = gridResult.data ?? [];
      featuredPagination = gridResult.pagination;
    }
  }

  const hasFeatured =
    bandProperties.length > 0 ||
    (featuredSettings.layoutDesktop === 'grid' && gridProperties.length > 0);

  return (
    <>
      <Slider initialSlides={initialSlides} />

      {hasFeatured ? (
        <>
          <section className="relative z-0 bg-card pt-10">
            <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
              <div className="mb-6">
                <h1 className="mb-2 text-3xl font-extrabold tracking-tight text-primary sm:text-4xl">
                  Propiedades Destacadas
                </h1>
                <p className="text-lg font-light text-muted-foreground sm:text-xl">
                  Explora nuestras propiedades más destacadas seleccionadas especialmente para ti.
                </p>
              </div>
            </div>
          </section>

          <div className="relative w-full bg-card">
            <FeaturedSection
              layoutDesktop={featuredSettings.layoutDesktop}
              gridColumns={featuredSettings.gridColumns}
              bandProperties={bandProperties}
              gridProperties={gridProperties}
              pagination={featuredPagination}
            />
          </div>
        </>
      ) : null}

      <div className="relative z-0 mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <PortalClient
          initialProperties={properties}
          initialPagination={pagination}
          initialCompanyName={companyName}
          filterVariant={filterVariant}
        />
      </div>

      <TestimonialsBand testimonials={testimonials} />
    </>
  );
}
