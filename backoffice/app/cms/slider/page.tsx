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

import { SliderContent } from '@/features/cms/components';
import { getSlides } from '@/features/cms/actions/slides.action';
import { getIdentity } from '@/features/cms/actions/identity.action';

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function SliderPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const search = typeof params.search === 'string' ? params.search : undefined;

  const result = await getSlides({ search });
  const initialSlides = result.success && result.data ? result.data : [];
  const identity = await getIdentity();
  const autoplay = Number(identity?.heroAutoplaySeconds);

  return (
    <SliderContent
      initialSlides={initialSlides}
      initialSearch={search}
      identityId={identity?.id}
      initialAutoplaySeconds={Number.isFinite(autoplay) ? Math.max(3, autoplay) : 6}
    />
  );
}
