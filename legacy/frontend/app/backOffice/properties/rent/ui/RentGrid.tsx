'use client';
import React from 'react';
import RentMoreButton from './RentMoreButton';
import { useRouter } from 'next/navigation';
import DataGrid, { type DataGridColumn } from '@/shared/components/ui/DataGrid/DataGrid';
import { env } from '@/lib/env';
import type { RentPropertyGridRow } from '@/features/backoffice/properties/actions/properties.action';
import { CreateProperty } from '@/features/backoffice/properties/components/dialogs';
import { PropertiesDeleteButton } from '@/features/backoffice/properties/components/shared';
import { getStatusInSpanish, getStatusChipClasses } from '@/features/backoffice/properties/utils';

type RentGridProps = {
  rows: RentPropertyGridRow[];
  totalRows?: number;
  title?: string;
};

// Helper function to resolve user display name
function resolveUserDisplayName(user?: any): string | null {
  if (!user) return null;
  const firstName = typeof user.personalInfo?.firstName === 'string' ? user.personalInfo.firstName.trim() : '';
  const lastName = typeof user.personalInfo?.lastName === 'string' ? user.personalInfo.lastName.trim() : '';
  const fullName = `${firstName} ${lastName}`.trim();
  if (fullName) return fullName;
  if (typeof user.username === 'string') return user.username;
  if (typeof user.email === 'string') return user.email;
  return null;
}

// Mapea los campos del backend a los esperados por el DataGrid
function mapRow(row: any) {
  return {
    id: row.p_id ?? row.id,
    code: row.p_code ?? row.code,
    title: row.p_title ?? row.title,
    status: row.p_status ?? row.status,
    operationType: row.p_operationType ?? row.operationType,
    typeName: row.typeName ?? row.propertyType?.name ?? row.propertyTypeName ?? '',
    assignedAgentName: row.assignedAgentName ?? resolveUserDisplayName(row.assignedAgent),
    creatorName: row.creatorName ?? resolveUserDisplayName(row.creatorUser),
    city: row.p_city ?? row.city,
    state: row.p_state ?? row.state,
    price: row.p_price ?? row.price,
    isFeatured: row.p_isFeatured ?? row.isFeatured ?? false,
    currencyPrice: row.p_currencyPrice ?? row.currencyPrice,
    createdAt: row.p_createdAt ?? row.createdAt,
    // Puedes agregar más campos si los necesitas en el grid
  };
}

export default function RentGrid({ rows, totalRows, title }: RentGridProps) {
  const router = useRouter();

  const columns: DataGridColumn[] = [
    { field: 'code', headerName: 'Código', width: 140, sortable: true, filterable: true },
    { field: 'title', headerName: 'Título', flex: 1.6, minWidth: 220, sortable: true, filterable: true },
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
      )
    },
    { field: 'operationType', headerName: 'Operación', width: 130, hide: true, sortable: true, filterable: true },
    { field: 'typeName', headerName: 'Tipo', width: 160, sortable: true, filterable: true },
    { field: 'creatorName', headerName: 'Creador', width: 180, sortable: true, filterable: true },
    { field: 'assignedAgentName', headerName: 'Agente', width: 180, sortable: true, filterable: true },
    { field: 'city', headerName: 'Ciudad', width: 150, sortable: true, filterable: true },
    { field: 'state', headerName: 'Región', width: 140, hide: true, sortable: true, filterable: true },
    { 
      field: 'price', 
      headerName: 'Precio', 
      type: 'number', 
      width: 140, 
      align: 'right', 
      headerAlign: 'right', 
      sortable: true, 
      filterable: true,
      renderCell: ({ row, value }) => {
        if (value === undefined || value === null) return '';
        const currency = row.currencyPrice || 'CLP';
        
        if (currency === 'UF') {
          return `UF ${new Intl.NumberFormat('es-CL', { 
            minimumFractionDigits: 2,
            maximumFractionDigits: 2 
          }).format(value)}`;
        }
        
        return new Intl.NumberFormat('es-CL', { 
          style: 'currency', 
          currency: 'CLP',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0
        }).format(value);
      }
    },
    { field: 'createdAt', headerName: 'Creado', type: 'date', renderType: 'dateString', width: 100, sortable: true, filterable: true },
    { 
      field: 'isFeatured',
      headerName: 'Destacada',
      width: 120,
      type: 'boolean',
      sortable: true,
      filterable: true,
      renderCell: ({ value }) => {
        return value ? (
          <span className="text-sm px-2 py-1 rounded bg-green-100 text-green-800">Sí</span>
        ) : (
          <span className="text-sm px-2 py-1 rounded bg-gray-100 text-gray-600">No</span>
        );
      }
    },
    {
      field: 'actions',
      headerName: '',
      width: 100,
      sortable: false,
      filterable: false,
      actionComponent: ({ row }) => (
        <div className="flex items-center gap-1">
          <PropertiesDeleteButton propertyId={row.id} onSuccess={() => { router.refresh(); }} />
          <RentMoreButton property={row} />
        </div>
      ),
    },
  ];

  const excelEndpoint = `${env.backendApiUrl}/properties/grid-rent/excel`;
  const excelFields = [
    'id',
    'code',
    'title',
    'status',
    'isFeatured',
    'operationType',
    'typeName',
    'creatorName',
    'assignedAgentName',
    'city',
    'state',
    'price',
    'createdAt',
  ].join(',');

  // Aplica el mapeo antes de pasar los datos al DataGrid
  const mappedRows = rows.map(mapRow);

  return (
    <>
      <DataGrid
        title={''}
        columns={columns}
        rows={mappedRows}
        totalRows={totalRows ?? mappedRows.length}
        height="85vh"
        data-test-id="rent-properties-grid"
        excelUrl={excelEndpoint}
        limit={25}
        excelFields={excelFields}
        createForm={
          <CreateProperty
            onSuccess={() => router.refresh()}
            size='lg'
            operation="RENT"
          />
        }
      />
    </>
  );
}
