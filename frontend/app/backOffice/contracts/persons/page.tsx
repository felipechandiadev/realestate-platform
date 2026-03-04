/**
 * Persons / Stakeholders Management Page
 * 
 * Propósito:
 * - Gestionar directorio de personas involucradas en transacciones
 * - Mantener base de datos de vendedores, compradores, inquilinos, inversionistas
 * - Buscar y filtrar personas por tipo, ciudad, estado, país
 * - Ver historial de transacciones por persona
 * - Actualizar información de contacto y documentación
 * 
 * Funcionalidad:
 * - Server component: búsqueda, filtrado geográfico, sorting
 * - Fetcha lista de personas con parámetros avanzados
 * - Renderiza DataGrid con información y acciones
 * - Supports: city, state, country filtering; sort asc/desc
 * - Pagination (page, limit) para manejo de grandes listas
 * 
 * Audiencia: Agentes, Administradores, Gerentes de ventas
 */

import PersonsDataGrid from './ui/PersonsDataGrid';
import { listPersons } from '@/features/backoffice/contracts/actions/persons.action';

interface PageProps {
  searchParams: Promise<{
    sort?: 'asc' | 'desc';
    sortField?: string;
    search?: string;
    page?: string;
    limit?: string;
    city?: string;
    state?: string;
    country?: string;
  }>;
}

export default async function PersonsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const sort = params.sort === 'asc' ? 'asc' : (params.sort === 'desc' ? 'desc' : undefined);
  const sortField = typeof params.sortField === 'string' ? params.sortField : undefined;
  const search = typeof params.search === 'string' ? params.search : '';
  const pageParam = typeof params.page === 'string' ? params.page : '1';
  const limitParam = typeof params.limit === 'string' ? params.limit : '25';
  const page = parseInt(pageParam) || 1;
  const limit = parseInt(limitParam) || 25;
  const city = typeof params.city === 'string' ? params.city : undefined;
  const state = typeof params.state === 'string' ? params.state : undefined;
  const country = typeof params.country === 'string' ? params.country : undefined;

  const rows = await listPersons({
    sort,
    sortField,
    search,
    page,
    limit,
    city,
    state,
    country,
  });

  return (
    <div className="p-4">
      <PersonsDataGrid rows={rows} totalRows={rows.length} />
    </div>
  );
}
