/**
 * Portal Homepage
 *
 * Propósito:
 * - Landing page pública del sitio web inmobiliario
 * - Banner slider principal
 * - Propiedades destacadas (marquee infinito)
 * - Propiedades regulares con filtrado inicial
 * - Testimonios de clientes
 *
 * Audiencia: Visitantes públicos, clientes potenciales, usuarios no autenticados
 */

import FeaturedPropertiesBand from '@/app/ui/FeaturedPropertiesBand';
import { getPublishedFeaturedPropertiesPublic } from '@/features/shared/properties/actions/properties.action';
import { getPublishedPropertiesFiltered } from '@/features/properties/actions/portalProperties.action';
import Slider from './ui/Slider';
import PortalClient from './PortalClient';
import TestimonialsBand from './ui/TestimonialsBand';
import { listPublicTestimonials } from '@/features/cms/actions/testimonials.action';

interface PortalPageProps {
  searchParams: Promise<{
    operation?: string;
    typeProperty?: string;
    state?: string;
    city?: string;
    currency?: string;
    page?: string;
  }>;
}

export default async function PortalPage({ searchParams }: PortalPageProps) {
  const params = await searchParams;

  const operation = params.operation || '';
  const typeProperty = params.typeProperty || '';
  const state = params.state || '';
  const city = params.city || '';
  const currency = params.currency || '';
  const page = params.page || '';

  const [featuredResultSettled, propertiesResultSettled, testimonialsSettled] = await Promise.allSettled([
    getPublishedFeaturedPropertiesPublic(),
    getPublishedPropertiesFiltered({
      currency: currency,
      state: state,
      city: city,
      typeProperty: typeProperty,
      operation: operation,
      page: page ? parseInt(page) : 1,
    }),
    listPublicTestimonials(),
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

  const featuredResult = featuredResultSettled.status === 'fulfilled' ? featuredResultSettled.value : null;
  const result = propertiesResultSettled.status === 'fulfilled' ? propertiesResultSettled.value : null;
  const testimonials = testimonialsSettled.status === 'fulfilled' ? testimonialsSettled.value : [];

  const featuredProperties = featuredResult?.data ?? [];
  const properties = result?.data ?? [];
  const pagination = result?.pagination;

  return (
    <>
      <Slider />

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
        <FeaturedPropertiesBand properties={featuredProperties} scrollSpeed={30} />
      </div>

      <div className="relative z-0 mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <PortalClient initialProperties={properties} initialPagination={pagination} />
      </div>

      <TestimonialsBand testimonials={testimonials} />
    </>
  );
}
