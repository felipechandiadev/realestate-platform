/**
 * Sales Contracts Management Page
 * 
 * Propósito:
 * - Gestionar contratos de VENTA de propiedades
 * - Visualizar estado de contratos (pendiente, firmado, completado)
 * - Búsqueda y filtrado por múltiples criterios
 * - Ordenamiento por fecha, monto, cliente, estado
 * - Acciones: crear, editar, descargar, firmar contratos
 * 
 * Funcionalidad:
 * - Server component: recibe searchParams (sort, search, filters, page, limit)
 * - Fetcha datos de contratos de venta desde getSaleContractsGrid action
 * - Renderiza SalesContractsGrid con datos y paginación
 * - Soporta URL-based filtering (estado, fecha, etc.)
 * 
 * Audiencia: Administradores, Gestores de contratos, Abogados
 */

import SalesContractsGrid from './ui/SalesContractsGrid';
import { getSaleContractsGrid } from '@/features/backoffice/contracts/actions/contracts.action';

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

export default async function SalesContractsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const sort = params.sort === 'asc' ? 'asc' : (params.sort === 'desc' ? 'desc' : undefined);
  const sortField = typeof params.sortField === 'string' ? params.sortField : undefined;
  const search = typeof params.search === 'string' ? params.search : '';
  const filters = typeof params.filters === 'string' ? params.filters : '';
  const filtration = params.filtration === 'true' || filters !== '';
  const pageParam = typeof params.page === 'string' ? params.page : '1';
  const limitParam = typeof params.limit === 'string' ? params.limit : '25';
  const page = parseInt(pageParam) || 1;
  const limit = parseInt(limitParam) || 25;

  try {
    const result = await getSaleContractsGrid({
      sort,
      sortField,
      search,
      filters,
      filtration,
      page,
      limit,
      pagination: true
    });

    return (
      <div className="p-4">
        <SalesContractsGrid rows={result.data} totalRows={result.total} />
      </div>
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    
    return (
      <div className="p-4">
        <div className="bg-red-50 border border-red-200 rounded-md p-6">
          <h2 className="text-red-800 font-bold text-lg mb-3">⚠️ Error al cargar contratos</h2>
          <p className="text-red-700 mb-4">{errorMessage}</p>
          <details className="text-sm text-red-600 bg-white p-3 rounded border border-red-100">
            <summary className="cursor-pointer font-semibold">Detalles técnicos</summary>
            <pre className="mt-2 whitespace-pre-wrap break-words text-xs">
              {error instanceof Error ? error.stack : JSON.stringify(error)}
            </pre>
          </details>
          <div className="text-red-600 text-sm mt-4">
            <p>💡 <strong>Sugerencias:</strong></p>
            <ul className="list-disc ml-5 mt-2 space-y-1">
              <li>Verifica que el servidor backend esté corriendo en <code className="bg-red-100 px-1">localhost:3000</code></li>
              <li>Comprueba que tengas sesión activa en el sistema</li>
              <li>Revisa los logs del backend para más información</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }
}