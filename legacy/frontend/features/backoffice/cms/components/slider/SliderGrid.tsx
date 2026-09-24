'use client';

import { useCallback, useMemo, useState } from 'react';
import DataGrid from '@/shared/components/ui/DataGrid/DataGrid';
import Dialog from '@/shared/components/ui/Dialog/Dialog';
import { Button } from '@/shared/components/ui/Button/Button';
import { TextField } from '@/shared/components/ui/TextField';
import { useSlides, useDeleteSlide } from '@/features/backoffice/cms/hooks';
import type { Slide } from '@/features/backoffice/cms/types';

interface SlideGridItem {
  id: string;
  title: string;
  order: string;
  status: string;
  hasLink: string;
  createdAt: string;
}

interface SliderGridProps {
  onEdit?: (slide: Slide) => void;
  onRefresh?: () => void;
}

/**
 * Slider Grid Component
 *
 * Displays a grid of all slider/carousel items
 * Supports ordering, editing, and deletion
 *
 * @param {SliderGridProps} props - Component props
 * @returns {React.ReactNode} Grid component
 */
export function SliderGrid({ onEdit, onRefresh }: SliderGridProps) {
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedSlideId, setSelectedSlideId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const {
    data: slides = [],
    isLoading,
    error,
    refetch,
  } = useSlides();

  const { mutate: deleteSlide, isPending: isDeleting } = useDeleteSlide();

  const filteredSlides = useMemo(() => {
    if (!searchTerm) return slides;
    
    const search = searchTerm.toLowerCase();
    return slides.filter(
      (s) =>
        s.title.toLowerCase().includes(search) ||
        s.description?.toLowerCase().includes(search)
    );
  }, [slides, searchTerm]);

  const sortedSlides = useMemo(() => {
    return [...filteredSlides].sort((a, b) => a.order - b.order);
  }, [filteredSlides]);

  const gridItems: SlideGridItem[] = useMemo(
    () =>
      sortedSlides.map((slide) => ({
        id: slide.id,
        title: slide.title,
        order: `Posición ${slide.order}`,
        status: slide.active ? 'Activo' : 'Inactivo',
        hasLink: slide.url ? 'Sí' : 'No',
        createdAt: new Date(slide.createdAt).toLocaleDateString('es-MX'),
      })),
    [sortedSlides]
  );

  const handleConfirmDelete = useCallback(() => {
    if (!selectedSlideId) return;

    deleteSlide(selectedSlideId, {
      onSuccess: () => {
        setOpenDeleteDialog(false);
        setSelectedSlideId(null);
        refetch();
        onRefresh?.();
      },
    });
  }, [selectedSlideId, deleteSlide, refetch, onRefresh]);

  const handleRowAction = useCallback(
    (action: string, row: SlideGridItem) => {
      const slide = slides.find((s) => s.id === row.id);
      if (!slide) return;

      if (action === 'edit') {
        onEdit?.(slide);
      } else if (action === 'delete') {
        setSelectedSlideId(row.id);
        setOpenDeleteDialog(true);
      }
    },
    [slides, onEdit]
  );

  const columns = [
    { field: 'title', headerName: 'Título', width: 300 },
    { field: 'order', headerName: 'Orden', width: 120 },
    { field: 'status', headerName: 'Estado', width: 100 },
    { field: 'hasLink', headerName: 'Enlace', width: 80 },
    { field: 'createdAt', headerName: 'Fecha', width: 120 },
  ];

  const actions = [
    { label: 'Editar', id: 'edit', variant: 'blue' as const },
    { label: 'Eliminar', id: 'delete', variant: 'red' as const },
  ];

  if (error) {
    return (
      <div className="p-6 bg-red-50 rounded-lg border border-red-200">
        <h3 className="text-red-900 font-semibold mb-2">
          Error al cargar slider
        </h3>
        <Button variant="primary" onClick={() => refetch()}>
          Reintentar
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <TextField
          placeholder="Buscar por título, descripción..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1"
        />
        <Button variant="secondary" onClick={() => refetch()}>
          Actualizar
        </Button>
      </div>

      <div className="bg-white border rounded-lg overflow-hidden">
        <DataGrid
          columns={columns}
          rows={gridItems}
          loading={isLoading}
        />
      </div>

      <Dialog
        open={openDeleteDialog}
        onOpenChange={setOpenDeleteDialog}
        title="Eliminar Slide"
        description="¿Está seguro de que desea eliminar este slide del carousel?"
        actions={[
          {
            label: 'Cancelar',
            onClick: () => setOpenDeleteDialog(false),
            variant: 'secondary' as const,
          },
          {
            label: 'Eliminar',
            onClick: handleConfirmDelete,
            variant: 'danger' as const,
            loading: isDeleting,
          },
        ]}
      />
    </div>
  );
}
