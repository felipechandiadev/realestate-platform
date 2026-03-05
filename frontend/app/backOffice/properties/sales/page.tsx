import { getSalePropertiesGrid } from '@/features/backoffice/properties/actions/properties.action';
import { PropertiesSalesGrid } from '@/features/backoffice/properties/components/sales';

interface PageProps {
  searchParams: Promise<{
    page?: string;
    limit?: string;
    search?: string;
    sortField?: string;
    sort?: 'asc' | 'desc';
    filters?: string;
  }>;
}

export default async function Page({ searchParams }: PageProps) {
  const params = await searchParams;
  
  // Parse URL parameters
  const page = parseInt(params.page || '1', 10);
  const limit = parseInt(params.limit || '25', 10);
  const search = params.search || '';
  const sortField = params.sortField || 'createdAt';
  const sort = params.sort || 'desc';
  const filters = params.filters || '';

  try {
    // Fetch data using Server Action
    const result = await getSalePropertiesGrid({
      page,
      limit,
      search,
      sortField,
      sort,
      filters,
      filtration: !!search || !!filters,
      pagination: true,
    });

    // Normalize response (can be array or object with data property)
    const properties = Array.isArray(result) ? result : result.data || [];
    const total = Array.isArray(result) ? result.length : result.total || 0;

    return (
      <div className="p-6">
        <PropertiesSalesGrid
          properties={properties}
          total={total}
          page={page}
          limit={limit}
        />
      </div>
    );
  } catch (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <h2 className="text-red-800 font-semibold mb-2">Error al cargar propiedades</h2>
          <p className="text-red-600">{error instanceof Error ? error.message : 'Error desconocido'}</p>
        </div>
      </div>
    );
  }
}
