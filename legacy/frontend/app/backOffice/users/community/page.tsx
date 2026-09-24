/**
 * Community Users / Clients List Page
 * 
 * Propósito:
 * - Gestionar base de datos de clientes / usuarios de comunidad
 * - Visualizar perfil de clientes (corredor, inquilino, inversionista)
 * - Búsqueda y filtrado de usuarios por tipo, estado, etc.
 * - Ver historial de compras/arriendos de clientes
 * - Acciones: contactar, actualizar datos, reportar actividad
 * 
 * Funcionalidad:
 * - Server component: recibe searchParams (search)
 * - Fetcha lista de usuarios comunidad desde action
 * - Renderiza lista con datos y filtros
 * - Validación y manejo de errores
 * 
 * Audiencia: Agentes, Administradores, Gerentes de ventas
 */

import CommunityUsersDataGrid from './ui/CommunityUsersDataGrid';
import { getCommunityUsersGrid } from '@/features/backoffice/users/actions/users.action';

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

export default async function CommunityPage({ searchParams }: PageProps) {
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

  const result = await getCommunityUsersGrid({
    sort,
    sortField,
    search,
    filters,
    filtration,
    page,
    limit,
    pagination: true,
  });

  const rows = Array.isArray(result) ? result : result.data ?? [];
  const totalRows = Array.isArray(result) ? result.length : result.total ?? rows.length;

  return (
    <div className="p-4">
      <CommunityUsersDataGrid rows={rows} totalRows={totalRows} />
    </div>
  );
}
