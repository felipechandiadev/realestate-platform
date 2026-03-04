/**
 * Rent Properties Management Page
 * 
 * Propósito:
 * - Gestionar catálogo completo de propiedades en ARRIENDO
 * - Visualizar listado de propiedades con búsqueda y filtros
 * - Ordenar por múltiples campos (precio, fecha, ubicación, etc.)
 * - Implementar paginación para grandes volúmenes de datos
 * - Acciones sobre propiedades (editar, eliminar, detalles)
 * 
 * Funcionalidad:
 * - Server component: recibe searchParams (sort, search, filters, page, limit)
 * - Fetcha datos de propiedades en arriendo desde getRentPropertiesGrid action
 * - Renderiza RentGrid con datos y total de registros
 * - Soporta URL-based filtering y pagination (SSR-friendly)
 * 
 * Audiencia: Agentes, Administradores, Gerentes de arriendos
 */

import RentGrid from './ui/RentGrid';
import { getRentPropertiesGrid } from '@/features/backoffice/properties/actions/properties.action';

interface PageProps {
  searchParams: Promise<{
    sort?: 'asc' | 'desc';
    sortField?: string;
    search?: string;
    filters?: string;
    filtration?: string;
    page?: string;
    limit?: string;
  }>;
}

export default async function RentPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const sort = params.sort === 'asc' ? 'asc' : (params.sort === 'desc' ? 'desc' : undefined);
  const sortField = typeof params.sortField === 'string' ? params.sortField : undefined;
  const search = typeof params.search === 'string' ? params.search : '';
  const filters = typeof params.filters === 'string' ? params.filters : '';
  const filtration = params.filtration === 'true' || filters !== '';
  const pageParam = typeof params.page === 'string' ? params.page : '1';
  const limitParam = typeof params.limit === 'string' ? params.limit : '10';
  const page = parseInt(pageParam) || 1;
  const limit = parseInt(limitParam) || 25;

  const result = await getRentPropertiesGrid({ sort, sortField, search, filters, filtration, page, limit, pagination: true });
  const rows = Array.isArray(result) ? result : result.data ?? [];
  const totalRows = Array.isArray(result) ? result.length : result.total ?? rows.length;

  return (
    <div className="p-4">
      <RentGrid rows={rows} totalRows={totalRows} />
    </div>
  );
}
