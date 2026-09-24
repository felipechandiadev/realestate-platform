'use client'
import React from 'react';
import Header from './components/Header';
import Body from './components/Body';
import Footer from './components/Footer';
import { ColHeader } from './components/ColHeader';
import { calculateColumnStyles, DataGridStyles, useScreenSize } from './utils/columnStyles';
import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

export type DataGridColumnType =
  | 'string'
  | 'number'
  | 'date'
  | 'dateTime'
  | 'boolean'
  | 'id';

export interface DataGridColumn {
  field: string;
  headerName: string;
  width?: number;
  minWidth?: number;
  maxWidth?: number;
  flex?: number;
  type?: DataGridColumnType;
  sortable?: boolean;
  editable?: boolean;
  filterable?: boolean; // Nueva propiedad para controlar si la columna es filtrable
  // Use serializable render hints instead of passing functions from server
  renderCell?: (params: any) => React.ReactNode;
  renderType?: 'currency' | 'badge' | 'dateString';
  valueGetter?: (params: any) => any;
  align?: 'left' | 'right' | 'center';
  headerAlign?: 'left' | 'right' | 'center';
  hide?: boolean;
  // Componente para acciones que operan sobre la fila completa
  actionComponent?: React.ComponentType<{ row: any; column: DataGridColumn }>;
}

export interface DataGridProps {
  columns: DataGridColumn[];
  title?: string;
  rows?: any[];
  loading?: boolean;
  sort?: 'asc' | 'desc';
  sortField?: string;
  search?: string;
  filters?: string;
  height?: number | string;
  totalRows?: number;
  totalGeneral?: number;
  createForm?: React.ReactNode;
  createFormTitle?: string;
  onAddClick?: () => void; // Callback para el botón + (abre diálogo externo)
  ["data-test-id"]?: string;
  excelUrl?: string; // Absolute URL for Excel export endpoint
  excelFields?: string;
  limit?: number;
  onExportExcel?: () => Promise<void>; // Callback para exportar a Excel
  showBorder?: boolean;
  // Expandable rows
  expandable?: boolean; // Habilita filas expandibles
  expandableRowContent?: (row: any) => React.ReactNode; // Contenido del panel expandido
  defaultExpandedRowIds?: (string | number)[]; // IDs de filas expandidas por defecto
  // Compatibility props used by feature-generated grids
  pagination?: {
    page?: number;
    pageSize?: number;
    rowCount?: number;
    limit?: number;
    onPaginationModelChange?: (model: { page: number; pageSize: number }) => void;
  };
  onPaginationModelChange?: (model: { page: number; pageSize: number }) => void;
  getRowId?: (row: any) => string | number;
}

const DataGrid: React.FC<DataGridProps> = ({
  columns,
  title,
  rows,
  loading: externalLoading = false,
  sort,
  sortField,
  search,
  filters,
  height = '70vh',
  totalRows,
  totalGeneral,
  createForm,
  createFormTitle,
  onAddClick,
  ["data-test-id"]: dataTestId,
  excelUrl,
  excelFields,
  limit = 25,
  onExportExcel,
  showBorder = false,
  expandable = false,
  expandableRowContent,
  defaultExpandedRowIds = [],
}) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [data, setData] = useState<any[]>(rows || []);
  const [loading, setLoading] = useState(externalLoading);
  const [total, setTotal] = useState(totalRows || (rows ? rows.length : 0));
  const [expandedRowIds, setExpandedRowIds] = useState<Set<string | number>>(new Set(defaultExpandedRowIds));
  // Inicializar filterMode basado en si hay filtros activos en la URL
  const [filterMode, setFilterMode] = useState(() => {
    const filtration = searchParams.get('filtration') === 'true';
    return filtration;
  });

  // Hook para detectar tamaño de pantalla
  const { width: screenWidth, isMobile } = useScreenSize();

  const toggleFilterMode = () => setFilterMode((v) => !v);

  // Toggle expandir/colapsar una fila
  const toggleRowExpanded = (rowId: string | number) => {
    setExpandedRowIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(rowId)) {
        newSet.delete(rowId);
      } else {
        newSet.add(rowId);
      }
      return newSet;
    });
  };

  // Update data when rows prop changes (server-side updates)
  useEffect(() => {
    setData(rows || []);
    setTotal(totalRows || (rows ? rows.length : 0));
  }, [rows, totalRows]);

  useEffect(() => {
    setLoading(externalLoading);
  }, [externalLoading]);

  // Sincronizar filterMode con la URL
  useEffect(() => {
    const filtration = searchParams.get('filtration') === 'true';
    setFilterMode(filtration);
  }, [searchParams]);

  // Inicializar limit en la URL si no está presente
  useEffect(() => {
    const currentLimit = searchParams.get('limit');
    if (!currentLimit) {
      const params = new URLSearchParams(searchParams.toString());
      params.set('limit', limit.toString());
      router.replace(`?${params.toString()}`, { scroll: false });
    }
  }, [searchParams, limit, router]);

  const containerClasses = `${DataGridStyles.container} ${DataGridStyles.responsive.minWidth} ${DataGridStyles.responsive.mobileScroll} ${showBorder ? 'border border-border' : ''}`.trim();

  return (
    <div className={containerClasses} style={{ height: typeof height === 'number' ? `${height}px` : height }} data-test-id={dataTestId || "data-grid-root"}>
      {/* Header */}
      <Header
        title={title ?? ''} 
        filterMode={filterMode} 
        onToggleFilterMode={toggleFilterMode}
        columns={columns}
        createForm={createForm}
        createFormTitle={createFormTitle}
        onAddClick={onAddClick}
        screenWidth={screenWidth}
        onExportExcel={onExportExcel ?? (async () => {
          // Default export behavior: use excelUrl & excelFields when provided
          if (!excelUrl) {
            throw new Error('Excel URL not provided');
          }

          const params = new URLSearchParams(searchParams.toString());
          if (excelFields) params.set('fields', excelFields);

          const finalUrl = `${excelUrl}${params.toString() ? `?${params.toString()}` : ''}`;

          const res = await fetch(finalUrl, { method: 'GET', credentials: 'same-origin' });
          if (!res.ok) {
            const errText = await res.text().catch(() => res.statusText);
            throw new Error(`Export failed: ${res.status} ${errText}`);
          }

          const contentDisposition = res.headers.get('content-disposition') || '';
          let filename = 'export.xlsx';
          const m = /filename="(?<name>[^"]+)"/.exec(contentDisposition);
          if (m && m.groups && m.groups.name) filename = m.groups.name;

          const blob = await res.blob();
          const objectUrl = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = objectUrl;
          a.download = filename;
          document.body.appendChild(a);
          a.click();
          a.remove();
          URL.revokeObjectURL(objectUrl);
        })}
      />
      {/* Scrollable container for columns header and body */}
      <div className={`${DataGridStyles.scrollContainer} relative`}>
        {/* Column Headers Row */}
        <div 
          className={`${DataGridStyles.headerRow} sticky top-0 z-10 bg-background`}
          style={{
            minWidth: 'max-content'
          }}
        >
          {/* Expand column header placeholder */}
          {expandable && (
            <div className="w-10 min-w-[40px] border-b border-gray-200" />
          )}
          {columns.filter((c) => !c.hide).map((column, i) => {
            const columnStyles = calculateColumnStyles(columns, screenWidth);
            const style = columnStyles[i];

            return (
              <ColHeader
                key={column.field}
                column={column}
                computedStyle={style}
                filterMode={filterMode}
              />
            );
          })}
        </div>
        {/* Body */}
        <Body 
          columns={columns} 
          rows={loading ? [] : data} 
          filterMode={filterMode} 
          screenWidth={screenWidth}
          expandable={expandable}
          expandedRowIds={expandedRowIds}
          onToggleExpand={toggleRowExpanded}
          expandableRowContent={expandableRowContent}
        />
      </div>
      {/* Footer - siempre pegado abajo */}
      <Footer total={total} totalGeneral={totalGeneral}/>
    </div>
  );
};

export default DataGrid;
