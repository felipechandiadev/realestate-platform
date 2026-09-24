'use client';

import { useCallback, useMemo, useState } from 'react';
import DataGrid from '@/shared/components/ui/DataGrid/DataGrid';
import Dialog from '@/shared/components/ui/Dialog/Dialog';
import { Button } from '@/shared/components/ui/Button/Button';
import { TextField } from '@/shared/components/ui/TextField';
import {
  useMultimedia,
  useDeleteMultimedia,
} from '@/features/backoffice/multimedia/hooks';

interface MediaGridItem {
  id: string;
  fileName: string;
  type: string;
  size: string;
  uploadedAt: string;
  url?: string;
}

interface MediaGridProps {
  onRefresh?: () => void;
}

/**
 * Media Grid Component
 *
 * Displays a paginated, sortable grid of all media files (images, videos)
 * Supports searching, filtering, and deletion
 *
 * @param {MediaGridProps} props - Component props
 * @returns {React.ReactNode} Grid component
 */
export function MediaGrid({ onRefresh }: MediaGridProps) {
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedMediaId, setSelectedMediaId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Fetch media
  const {
    data: mediaResponse,
    isLoading,
    error,
    refetch,
  } = useMultimedia({
    page,
    limit,
    search: searchTerm,
  });

  // Delete mutation
  const { mutate: deleteMedia, isPending: isDeleting } = useDeleteMultimedia();

  const mediaFiles = mediaResponse?.items || [];
  const totalRecords = mediaResponse?.total || 0;
  const totalPages = Math.ceil(totalRecords / limit);

  // Map to grid format
  const gridItems: MediaGridItem[] = useMemo(
    () =>
      mediaFiles.map((media) => ({
        id: media.id,
        fileName: media.name,
        type: media.type,
        size: formatFileSize(media.size),
        uploadedAt: new Date(media.createdAt).toLocaleDateString('es-MX'),
      })),
    [mediaFiles]
  );

  // Handle delete confirmation
  const handleConfirmDelete = useCallback(() => {
    if (!selectedMediaId) return;

    deleteMedia(selectedMediaId);
    setOpenDeleteDialog(false);
    setSelectedMediaId(null);
    refetch();
    onRefresh?.();
  }, [selectedMediaId, deleteMedia, refetch, onRefresh]);

  // Handle delete click
  const handleDeleteClick = useCallback((item: MediaGridItem) => {
    setSelectedMediaId(item.id);
    setOpenDeleteDialog(true);
  }, []);

  // Handle search
  const handleSearch = useCallback((value: string) => {
    setSearchTerm(value);
    setPage(1);
  }, []);

  // Handle page change
  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  return (
    <>
      <div className="space-y-4">
        {/* Search */}
        <div className="flex gap-4">
          <TextField
            placeholder="Buscar archivos..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="flex-1"
          />
        </div>

        {/* Grid */}
        <DataGrid
          columns={[
            {
              field: 'fileName',
              headerName: 'Nombre',
              width: 250,
              sortable: true,
            },
            {
              field: 'type',
              headerName: 'Tipo',
              width: 120,
              sortable: true,
            },
            {
              field: 'size',
              headerName: 'Tamaño',
              width: 120,
              sortable: true,
            },
            {
              field: 'uploadedAt',
              headerName: 'Fecha de Subida',
              width: 150,
              sortable: true,
            },
            {
              field: 'url',
              headerName: 'URL',
              width: 200,
              renderCell: (item) => (
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline truncate"
                >
                  {item.url}
                </a>
              ),
            },
            {
              field: 'actions',
              headerName: 'Acciones',
              width: 120,
              renderCell: (item) => (
                <div className="flex gap-2">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteClick(item)}
                    disabled={isDeleting}
                  >
                    Eliminar
                  </Button>
                </div>
              ),
            },
          ]}
          rows={gridItems}
          loading={isLoading}
          limit={limit}
          totalRows={totalRecords}
          pagination={{
            page,
            pageSize: limit,
            rowCount: totalRecords,
            onPaginationModelChange: (model) => setPage(model.page),
          }}
        />
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDeleteDialog}
        onOpenChange={setOpenDeleteDialog}
        title="Confirmar Eliminación"
        description="¿Está seguro que desea eliminar este archivo? Esta acción no se puede deshacer."
      >
        <div className="flex gap-3 justify-end">
          <Button
            variant="outline"
            onClick={() => setOpenDeleteDialog(false)}
            disabled={isDeleting}
          >
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirmDelete}
            disabled={isDeleting}
          >
            {isDeleting ? 'Eliminando...' : 'Eliminar'}
          </Button>
        </div>
      </Dialog>
    </>
  );
}

/**
 * Format file size in human-readable format
 */
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}
