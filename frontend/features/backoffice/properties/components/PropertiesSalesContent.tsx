/**
 * @fileoverview Properties Sales Page Component
 *
 * Client component that fetches and displays properties for sale using React Query
 * Handles pagination, filtering, sorting, and actions
 *
 * @example
 * ```tsx
 * import { PropertiesSalesContent } from '@/features/backoffice/properties/components/PropertiesSalesContent';
 *
 * export default function Page() {
 *   return <PropertiesSalesContent />;
 * }
 * ```
 */

'use client';

import React, { Suspense, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import DataGrid, { type DataGridColumn } from '@/shared/components/ui/DataGrid/DataGrid';
import { useSalePropertiesGrid } from '@/features/backoffice/properties/hooks';
import type { PropertyGridItem } from '@/features/backoffice/properties/types';
import {
  PropertiesCreateDialog,
  PropertiesDeleteButton,
} from '@/features/backoffice/properties/components';
import { getStatusInSpanish, getStatusChipClasses } from '@/features/backoffice/properties/utils';

/**
 * Properties Sales Grid Content
 * Fetches and displays paginated list of properties for sale
 */
export function PropertiesSalesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get URL params
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '25', 10);
  const search = searchParams.get('search') || '';
  const sortField = searchParams.get('sortField') || 'createdAt';
  const sort = (searchParams.get('sort') as 'asc' | 'desc') || 'desc';

  // Fetch data using React Query hook
  const {
    data: gridResponse,
    isLoading,
    isError,
    error,
  } = useSalePropertiesGrid({
    page,
    limit,
    search,
    sortField,
    sort,
    pagination: true,
    filtration: !!search,
  });

  // Map rows for DataGrid
  const rows = useMemo(() => {
    if (!gridResponse?.items) return [];
    return gridResponse.items.map((item: PropertyGridItem) => ({
      id: item.id,
      title: item.title,
      price: item.price,
      city: item.city,
      type: item.type,
      status: item.status,
      published: item.published,
      featured: item.featured,
      thumbnail: item.thumbnail,
      createdAt: item.createdAt ? new Date(item.createdAt).toLocaleDateString('es-CL') : 'N/A',
    }));
  }, [gridResponse?.items]);

  // DataGrid columns definition
  const columns: DataGridColumn[] = [
    {
      field: 'title',
      headerName: 'Título',
      flex: 2,
      minWidth: 250,
      sortable: true,
      filterable: true,
    },
    {
      field: 'status',
      headerName: 'Estado',
      width: 140,
      sortable: true,
      filterable: true,
      renderCell: ({ value }) => (
        <span className={`px-2 py-1 rounded-md text-xs font-semibold ${getStatusChipClasses(value)}`}>
          {getStatusInSpanish(value)}
        </span>
      ),
    },
    {
      field: 'type',
      headerName: 'Tipo',
      width: 150,
      sortable: true,
      filterable: true,
    },
    {
      field: 'city',
      headerName: 'Ciudad',
      width: 140,
      sortable: true,
      filterable: true,
    },
    {
      field: 'price',
      headerName: 'Precio',
      type: 'number',
      width: 160,
      align: 'right' as const,
      headerAlign: 'right' as const,
      sortable: true,
      renderCell: ({ value }) => {
        if (!value) return '-';
        return new Intl.NumberFormat('es-CL', {
          style: 'currency',
          currency: 'CLP',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(value);
      },
    },
    {
      field: 'published',
      headerName: 'Publicada',
      type: 'boolean',
      width: 120,
      sortable: true,
      renderCell: ({ value }) => (value ? '✓' : ''),
    },
    {
      field: 'featured',
      headerName: 'Destacada',
      type: 'boolean',
      width: 120,
      sortable: true,
      renderCell: ({ value }) => (value ? '★' : ''),
    },
    {
      field: 'createdAt',
      headerName: 'Fecha',
      width: 120,
      sortable: true,
    },
    {
      field: 'actions',
      headerName: 'Acciones',
      width: 200,
      sortable: false,
      filterable: false,
      renderCell: ({ row }) => (
        <div className="flex gap-2">
          <button
            onClick={() =>
              router.push(
                `/backOffice/properties/propertyDetail/${row.id}`
              )
            }
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Detalles
          </button>
          <PropertiesDeleteButton propertyId={row.id} />
        </div>
      ),
    },
  ];

  // Handle pagination changes
  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', newPage.toString());
    router.push(`/backOffice/properties/sales?${params.toString()}`);
  };

  if (isError) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-800">
          Error al cargar propiedades: {error?.message || 'Error desconocido'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Propiedades en Venta</h1>
        <PropertiesCreateDialog operation="SALE" />
      </div>

      {/* Stats */}
      {gridResponse && (
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Total</p>
            <p className="text-2xl font-bold text-blue-600">
              {gridResponse.total}
            </p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Página</p>
            <p className="text-2xl font-bold text-green-600">
              {gridResponse.page}/{Math.ceil(gridResponse.total / gridResponse.limit)}
            </p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Por página</p>
            <p className="text-2xl font-bold text-purple-600">
              {gridResponse.limit}
            </p>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">En esta página</p>
            <p className="text-2xl font-bold text-orange-600">
              {rows.length}
            </p>
          </div>
        </div>
      )}

      {/* DataGrid */}
      <div className="bg-white rounded-lg shadow p-6">
        <DataGrid
          columns={columns}
          rows={rows}
          loading={isLoading}
          pagination={{
            page,
            pageSize: limit,
            rowCount: gridResponse?.total || 0,
            onPaginationModelChange: (model) => handlePageChange(model.page),
          }}
          getRowId={(row) => row.id}
        />
      </div>
    </div>
  );
}

/**
 * Wrapper component with Suspense for server-side rendering
 */
export function PropertiesSalesPage() {
  return (
    <Suspense
      fallback={
        <div className="p-6 text-center">
          <p className="text-gray-600">Cargando propiedades...</p>
        </div>
      }
    >
      <PropertiesSalesContent />
    </Suspense>
  );
}
