'use client';

import { useCallback, useMemo, useState } from 'react';
import DataGrid from '@/shared/components/ui/DataGrid/DataGrid';
import Dialog from '@/shared/components/ui/Dialog/Dialog';
import { Button } from '@/shared/components/ui/Button/Button';
import { TextField } from '@/shared/components/ui/TextField';
import { useTestimonials, useDeleteTestimonial } from '@/features/backoffice/cms/hooks';
import type { Testimonial } from '@/features/backoffice/cms/types';

interface TestimonialGridItem {
  id: string;
  name: string;
  company: string;
  rating: string;
  status: string;
  createdAt: string;
}

interface TestimonialsGridProps {
  onEdit?: (testimonial: Testimonial) => void;
  onRefresh?: () => void;
}

/**
 * Testimonials Grid Component
 *
 * Displays a grid of all customer testimonials
 * Supports searching, editing, and deletion
 *
 * @param {TestimonialsGridProps} props - Component props
 * @returns {React.ReactNode} Grid component
 */
export function TestimonialsGrid({ onEdit, onRefresh }: TestimonialsGridProps) {
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedTestimonialId, setSelectedTestimonialId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const {
    data: testimonials = [],
    isLoading,
    error,
    refetch,
  } = useTestimonials();

  const { mutate: deleteTestimonial, isPending: isDeleting } = useDeleteTestimonial();

  const filteredTestimonials = useMemo(() => {
    if (!searchTerm) return testimonials;
    
    const search = searchTerm.toLowerCase();
    return testimonials.filter(
      (t) =>
        t.name.toLowerCase().includes(search) ||
        t.company?.toLowerCase().includes(search) ||
        t.content.toLowerCase().includes(search)
    );
  }, [testimonials, searchTerm]);

  const gridItems: TestimonialGridItem[] = useMemo(
    () =>
      filteredTestimonials.map((testimonial) => ({
        id: testimonial.id,
        name: testimonial.name,
        company: testimonial.company || 'N/A',
        rating: `${testimonial.rating} ⭐`,
        status: testimonial.published ? 'Publicado' : 'Borrador',
        createdAt: new Date(testimonial.createdAt).toLocaleDateString('es-MX'),
      })),
    [filteredTestimonials]
  );

  const handleConfirmDelete = useCallback(() => {
    if (!selectedTestimonialId) return;

    deleteTestimonial(selectedTestimonialId, {
      onSuccess: () => {
        setOpenDeleteDialog(false);
        setSelectedTestimonialId(null);
        refetch();
        onRefresh?.();
      },
    });
  }, [selectedTestimonialId, deleteTestimonial, refetch, onRefresh]);

  const handleRowAction = useCallback(
    (action: string, row: TestimonialGridItem) => {
      const testimonial = testimonials.find((t) => t.id === row.id);
      if (!testimonial) return;

      if (action === 'edit') {
        onEdit?.(testimonial);
      } else if (action === 'delete') {
        setSelectedTestimonialId(row.id);
        setOpenDeleteDialog(true);
      }
    },
    [testimonials, onEdit]
  );

  const columns = [
    { field: 'name', headerName: 'Cliente', width: 250 },
    { field: 'company', headerName: 'Empresa', width: 200 },
    { field: 'rating', headerName: 'Calificación', width: 120 },
    { field: 'status', headerName: 'Estado', width: 120 },
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
          Error al cargar testimonios
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
          placeholder="Buscar por nombre, empresa, contenido..."
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
        title="Eliminar Testimonio"
        description="¿Está seguro de que desea eliminar este testimonio?"
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
