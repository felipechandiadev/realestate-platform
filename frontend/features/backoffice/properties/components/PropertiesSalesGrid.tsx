/**
 * @fileoverview Properties Sales Grid Client Component
 *
 * Client component that displays properties for sale in a DataGrid
 * Receives data as props from Server Component
 * Handles UI interactions and client-side state
 */

'use client';

import React, { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import DataGrid, { type DataGridColumn } from '@/shared/components/ui/DataGrid/DataGrid';
import type { SalePropertyGridRow } from '@/features/backoffice/properties/actions/properties.action';
import {
  PropertiesCreateDialog,
  PropertiesDeleteButton,
} from '@/features/backoffice/properties/components';
import { getStatusInSpanish, getStatusChipClasses } from '@/features/backoffice/properties/utils';
import SaleMoreButton from '@/app/backOffice/properties/sales/ui/SaleMoreButton';

interface PropertiesSalesGridProps {
  properties: SalePropertyGridRow[];
  total: number;
  page: number;
  limit: number;
}

/**
 * Properties Sales Grid
 * Displays paginated list of properties for sale
 */
export function PropertiesSalesGrid({ properties, total, page, limit }: PropertiesSalesGridProps) {
  const router = useRouter();

  // Map rows for DataGrid
  const rows = useMemo(() => {
    return properties.map((item) => ({
      id: item.id,
      code: item.code,
      title: item.title,
      status: item.status,
      operationType: item.operationType,
      typeName: item.typeName,
      assignedAgentName: item.assignedAgentName,
      creatorName: item.creatorName,
      city: item.city,
      state: item.state,
      price: item.price,
      currencyPrice: item.currencyPrice,
      createdAt: item.createdAt ? new Date(item.createdAt).toLocaleDateString('es-CL') : 'N/A',
    }));
  }, [properties]);

  // DataGrid columns definition
  const columns: DataGridColumn[] = [
    {
      field: 'code',
      headerName: 'Código',
      width: 140,
      sortable: true,
      filterable: true,
    },
    {
      field: 'title',
      headerName: 'Título',
      flex: 1.6,
      minWidth: 220,
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
      field: 'typeName',
      headerName: 'Tipo',
      width: 160,
      sortable: true,
      filterable: true,
    },
    {
      field: 'creatorName',
      headerName: 'Creador',
      width: 180,
      sortable: true,
      filterable: true,
    },
    {
      field: 'assignedAgentName',
      headerName: 'Agente',
      width: 180,
      sortable: true,
      filterable: true,
    },
    {
      field: 'city',
      headerName: 'Ciudad',
      width: 150,
      sortable: true,
      filterable: true,
    },
    {
      field: 'price',
      headerName: 'Precio',
      type: 'number',
      width: 140,
      align: 'right' as const,
      headerAlign: 'right' as const,
      sortable: true,
      filterable: true,
      renderCell: ({ row, value }) => {
        if (value === undefined || value === null) return '';
        const currency = row.currencyPrice || 'CLP';

        if (currency === 'UF') {
          return `UF ${new Intl.NumberFormat('es-CL', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }).format(value)}`;
        }

        return new Intl.NumberFormat('es-CL', {
          style: 'currency',
          currency: 'CLP',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(value);
      },
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
      width: 150,
      sortable: false,
      filterable: false,
      renderCell: ({ row }) => (
        <div className="flex gap-2">
          <SaleMoreButton property={row} />
          <PropertiesDeleteButton propertyId={row.id} onSuccess={() => router.refresh()} />
        </div>
      ),
    },
  ];

  // Handle page change
  const handlePageChange = (newPage: number) => {
    const url = new URL(window.location.href);
    url.searchParams.set('page', String(newPage));
    router.push(url.pathname + url.search);
  };

  // Handle page size change
  const handlePageSizeChange = (newPageSize: number) => {
    const url = new URL(window.location.href);
    url.searchParams.set('limit', String(newPageSize));
    url.searchParams.set('page', '1'); // Reset to first page
    router.push(url.pathname + url.search);
  };

  // Handle sort change
  const handleSortChange = (field: string, direction: 'asc' | 'desc') => {
    const url = new URL(window.location.href);
    url.searchParams.set('sortField', field);
    url.searchParams.set('sort', direction);
    router.push(url.pathname + url.search);
  };

  // Handle search
  const handleSearch = (query: string) => {
    const url = new URL(window.location.href);
    if (query) {
      url.searchParams.set('search', query);
    } else {
      url.searchParams.delete('search');
    }
    url.searchParams.set('page', '1'); // Reset to first page
    router.push(url.pathname + url.search);
  };

  return (
    <div className="space-y-6">
      {/* Create Button + Dialog */}
      <div>
        <PropertiesCreateDialog
          operation="SALE"
          onSuccess={() => {
            router.refresh();
          }}
        />
      </div>

      {/* DataGrid */}
      <DataGrid
        columns={columns}
        rows={rows}
        pagination={{
          page,
          pageSize: limit,
          rowCount: total,
          onPaginationModelChange: ({ page: newPage, pageSize: newPageSize }) => {
            if (newPage !== page) handlePageChange(newPage);
            if (newPageSize !== limit) handlePageSizeChange(newPageSize);
          },
        }}
        onSortChange={handleSortChange}
        onSearch={handleSearch}
        searchPlaceholder="Buscar propiedades..."
      />
    </div>
  );
}
