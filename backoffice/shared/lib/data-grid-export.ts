export type GridExportParams = {
  sort?: 'asc' | 'desc';
  sortField?: string;
  search?: string;
  filters?: string;
  filtration?: boolean;
  pagination: false;
  status?: string;
  operation?: string;
};

export function readGridExportParams(
  searchParams: { get(name: string): string | null },
): GridExportParams {
  const params: GridExportParams = { pagination: false };
  const sort = searchParams.get('sort');
  if (sort === 'asc' || sort === 'desc') {
    params.sort = sort;
  }
  const sortField = searchParams.get('sortField');
  if (sortField) {
    params.sortField = sortField;
  }
  const search = searchParams.get('search');
  if (search) {
    params.search = search;
  }
  const filters = searchParams.get('filters');
  if (filters) {
    params.filters = filters;
  }
  const filtration = searchParams.get('filtration');
  if (filtration) {
    params.filtration = filtration === 'true';
  }
  return params;
}

export async function downloadExcelFile(filename: string, base64: string) {
  const blob = await fetch(
    `data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${base64}`,
  ).then((response) => response.blob());
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename || 'export.xlsx';
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
