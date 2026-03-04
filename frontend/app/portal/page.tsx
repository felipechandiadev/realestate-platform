/**
 * Portal Homepage
 * 
 * Propósito:
 * - Landing page pública del sitio web inmobiliario
 * - Mostrar banner slider principal con destacados
 * - Propiedades destacadas (featured) con paginación
 * - Propiedades regulares con filtrado inicial
 * - Testimonios de clientes
 * - Punto de entrada para visitantes no autenticados
 * 
 * Funcionalidad:
 * - Server component con searchParams para filtrado URL
 * - Fetcha propiedades destacadas paginadas
 * - Fetcha propiedades filtradas por operación/tipo/ubicación/moneda
 * - Renderiza slider hero, bands de propiedades, testimonios
 * - Integra PortalClient para interactividad (búsqueda, filtros)
 * 
 * Audiencia: Visitantes públicos, clientes potenciales, usuarios no autenticados
 */

import FeaturedPropertiesBand from '@/app/portal/ui/FeaturedPropertiesBand';
import { getPublishedFeaturedProperties } from '@/features/backoffice/properties/actions/properties.action';
import { getPublishedPropertiesFiltered } from '@/features/portal/properties/actions/portalProperties.action';
import Slider from './ui/Slider';
import PortalClient from './PortalClient';
import TestimonialsBand from './ui/TestimonialsBand';
import { listPublicTestimonials } from '@/features/backoffice/cms/actions/testimonials.action';

interface PortalPageProps {
  searchParams: Promise<{
    operation?: string;
    typeProperty?: string;
    state?: string;
    city?: string;
    currency?: string;
    page?: string;
    featured_page?: string;
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
  const featuredPage = params.featured_page || '1';

  // Fetch featured properties with pagination
  const featuredResult = await getPublishedFeaturedProperties(
    parseInt(featuredPage) || 1
  );

  const featuredProperties = featuredResult?.data ?? [];

  // Fetch regular properties (filtered)
  const result = await getPublishedPropertiesFiltered({
    currency: currency,
    state: state,
    city: city,
    typeProperty: typeProperty,
    operation: operation,
    page: page ? parseInt(page) : 1,
  });

  const properties = result?.data ?? [];
  const pagination = result?.pagination;

  // Fetch public testimonials (server-side) and show max 4 on home
  const testimonials = await listPublicTestimonials().catch(() => []);

  return (
    <>
      {/* Hero Slider */}
      <Slider />


      {/* Featured Properties Section */}
      <section className="relative z-0 bg-card pt-10">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-6">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-primary mb-2 tracking-tight">
              PROPIEDADES DESTACADAS
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground font-light">
              Explora nuestras propiedades más destacadas seleccionadas especialmente para ti.
            </p>
          </div>
        </div>
      </section>

      <div className="relative w-full bg-card">
        <FeaturedPropertiesBand properties={featuredProperties} />
      </div>

      {/* Regular Portal Properties Section */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 relative z-0">
        <PortalClient initialProperties={properties} initialPagination={pagination} />
      </div>

      {/* Testimonials under the properties grid (show up to 4) */}
      <TestimonialsBand testimonials={testimonials} />
    </>
  );
}
