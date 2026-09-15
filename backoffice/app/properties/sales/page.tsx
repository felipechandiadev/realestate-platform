import { getSalePropertiesGrid } from '@/features/properties/actions/properties.action';
import {
  PropertiesSalesGrid,
  PropertiesSalesPageLayout,
} from '@/features/properties/components/sales';

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

  const page = parseInt(params.page || '1', 10);
  const limit = parseInt(params.limit || '25', 10);
  const search = params.search || '';
  const sortField = params.sortField || 'createdAt';
  const sort = params.sort || 'desc';
  const filters = params.filters || '';

  try {
    const result = await getSalePropertiesGrid({
      page,
      limit,
      search,
      sortField,
      sort,
      filters,
      status: 'ALL',
      filtration: !!search || !!filters,
      pagination: true,
    });

    const properties = Array.isArray(result) ? result : result.data || [];
    const total = Array.isArray(result) ? result.length : result.total || 0;

    return (
      <PropertiesSalesPageLayout>
        <PropertiesSalesGrid
          properties={properties}
          total={total}
          page={page}
          limit={limit}
        />
      </PropertiesSalesPageLayout>
    );
  } catch (error) {
    return (
      <PropertiesSalesPageLayout>
        <div className="rounded-md border border-red-200 bg-red-50 p-4">
          <h2 className="mb-2 font-semibold text-red-800">Error al cargar propiedades</h2>
          <p className="text-red-600">
            {error instanceof Error ? error.message : 'Error desconocido'}
          </p>
        </div>
      </PropertiesSalesPageLayout>
    );
  }
}
