/**
 * Blog Articles Page (Portal)
 * 
 * Propósito:
 * - Blog público con artículos inmobiliarios
 * - Educación y contenido de valor para visitantes
 * - SEO y posicionamiento orgánico
 * - Filtrado por categorías
 * 
 * Funcionalidad:
 * - Server component con filtrado por categoría (URL query)
 * - Fetcha artículos públicos desde action listArticles
 * - CategoriesBlog component para selector de categorías
 * - BlogList component para grid de artículos
 * - Muestra todos si no hay categoría seleccionada
 * - Header con título y descripción SEO-friendly
 * 
 * Audiencia: Visitantes públicos, clientes potenciales, buscadores de información
 */

import { listArticles } from '@/features/backoffice/cms/actions/articles.action';
import BlogList from './ui/BlogList';
import CategoriesBlog from './ui/CategoriesBlog';

interface BlogPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const params = await searchParams;
  let category = typeof params.category === 'string' ? params.category : undefined;
  
  // Si category es string vacío, tratarlo como undefined para mostrar todos
  if (category === '') {
    category = undefined;
  }

  // Obtener artículos filtrados por categoría si existe (usando listArticles - pública)
  const articles = await listArticles({ category });

  // Obtener todas las categorías disponibles (sin filtro)
  const allArticles = await listArticles({});

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Blog Inmobiliario
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Descubre consejos, tendencias y guías sobre el mundo inmobiliario.
            Encuentra la información que necesitas para tomar las mejores decisiones.
          </p>
        </div>

        {/* Filtros de categorías */}
        <div className="mb-8">
          <CategoriesBlog articles={allArticles} />
        </div>

        {/* Lista de artículos */}
        <BlogList blogs={articles} />
      </div>
    </div>
  );
}
