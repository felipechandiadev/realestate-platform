/**
 * @fileoverview Properties Sales Grid Client Component
 *
 * Client component that displays properties for sale in a DataGrid or CollectionGrid
 * Receives data as props from Server Component
 * Handles UI interactions and client-side state
 */

'use client';

import React, { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  BasicPageLayout,
  CollectionGrid,
  DataGrid,
  Dialog,
  type DataGridColumn,
} from '@realestate/ui';
import type { SalePropertyGridRow } from '@/features/properties/actions/properties.action';
import { CreateProperty } from '@/features/properties/components/dialogs';
import { PropertiesDeleteButton } from '@/features/properties/components/shared';
import {
  formatPropertyPrice,
  getStatusChipClasses,
  getStatusInSpanish,
} from '@/features/properties/utils';
import { SalePropertyCard } from './SalePropertyCard';
import { SalesViewModeToggle, useSalesViewMode } from './SalesViewModeToggle';
import SaleMoreButton from './SaleMoreButton';

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
  const [view, setView] = useSalesViewMode();
  const [dialogOpen, setDialogOpen] = React.useState(false);

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

  const cardItems = useMemo(
    () =>
      properties.map((property) => (
        <SalePropertyCard
          key={property.id}
          property={property}
          onDeleteSuccess={() => router.refresh()}
        />
      )),
    [properties, router],
  );

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
      renderCell: ({ row, value }) =>
        formatPropertyPrice(value, row.currencyPrice),
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
        <div className="flex h-full items-center gap-2">
          <SaleMoreButton property={row} />
          <PropertiesDeleteButton propertyId={row.id} onSuccess={() => router.refresh()} />
        </div>
      ),
    },
  ];

  const createDialog = (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen} title="Crear Propiedad">
      <CreateProperty
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSuccess={() => {
          router.refresh();
        }}
        operation="SALE"
      />
    </Dialog>
  );

  return (
    <BasicPageLayout
      title="Propiedades en venta"
      headerEnd={<SalesViewModeToggle value={view} onChange={setView} />}
      contentClassName="flex min-h-0 flex-1 flex-col"
    >
      {view === 'cards' ? (
        <CollectionGrid
          totalRows={total}
          page={page}
          limit={limit}
          fillViewport
          viewportBottomInset={24}
          onAddClick={() => setDialogOpen(true)}
          contentItems={cardItems}
          contentGridColumns={{ default: 1, sm: 2, md: 3, lg: 4, xl: 5 }}
          contentGridItemsAlign="stretch"
          contentEmptyMessage="No hay propiedades en venta"
          searchPlaceholder="Buscar propiedades..."
          data-test-id="properties-sales-collection-grid"
        />
      ) : (
        <DataGrid
          columns={columns}
          rows={rows}
          totalRows={total}
          limit={limit}
          fillViewport
          viewportBottomInset={24}
          onAddClick={() => setDialogOpen(true)}
          searchPlaceholder="Buscar propiedades..."
          data-test-id="properties-sales-data-grid"
        />
      )}

      {createDialog}
    </BasicPageLayout>
  );
}
