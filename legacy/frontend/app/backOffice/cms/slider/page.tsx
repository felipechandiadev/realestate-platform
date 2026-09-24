/**
 * CMS Slider Management Page
 * 
 * Propósito:
 * - Gestionar slides del carousel principal
 * - Reordenar slides con drag & drop
 * - Búsqueda de slides por título/descripción
 * - Acciones: crear, editar, eliminar slides
 * 
 * Funcionalidad:
 * - Server component: recibe searchParams (search)
 * - Fetcha slides iniciales desde getSlides action
 * - Renderiza SliderContent con datos pre-cargados
 * - Suspense boundary automático con loading.tsx
 * 
 * Audiencia: Administradores, Editores de contenido web
 */

import { SliderContent } from '@/features/backoffice/cms/components';
import { getSlides } from '@/features/backoffice/cms/actions/slides.action';

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function SliderPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const search = typeof params.search === 'string' ? params.search : undefined;

  const result = await getSlides({ search });
  const initialSlides = result.success && result.data ? result.data : [];

  return <SliderContent initialSlides={initialSlides} initialSearch={search} />;
}
