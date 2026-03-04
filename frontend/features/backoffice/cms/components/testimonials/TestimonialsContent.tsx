'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAlert } from '@/providers/AlertContext';
import { TextField } from '@/shared/components/ui/TextField/TextField';
import IconButton from '@/shared/components/ui/IconButton/IconButton';
import { getTestimonials, type Testimonial } from '@/features/backoffice/cms/actions/testimonials.action';
import { TestimonialCard } from './TestimonialCard';
import { CreateTestimonialDialog } from './CreateTestimonialDialog';
import { UpdateTestimonialDialog } from './UpdateTestimonialDialog';
import { DeleteTestimonialDialog } from './DeleteTestimonialDialog';

interface TestimonialsContentProps {
  initialTestimonials: Testimonial[];
  initialSearch?: string;
}

/**
 * Testimonials Content Component (CLC Pattern)
 * Implements Card Listing Content pattern for testimonials management
 */
export function TestimonialsContent({
  initialTestimonials,
  initialSearch = '',
}: TestimonialsContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const alert = useAlert();

  const [testimonials, setTestimonials] = useState<Testimonial[]>(initialTestimonials);
  const [search, setSearch] = useState(initialSearch);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedTestimonial, setSelectedTestimonial] = useState<Testimonial | null>(null);

  useEffect(() => {
    setSearch(searchParams.get('search') || '');
  }, [searchParams]);

  const refreshTestimonials = async () => {
    setIsLoading(true);
    try {
      const result = await getTestimonials({
        search: search || undefined,
      });

      if (result.success) {
        setTestimonials(result.data || []);
      } else {
        alert.error(result.error || 'Error al cargar testimonios');
      }
    } catch (error) {
      console.error('Error recargando testimonios:', error);
      alert.error('Error al recargar los testimonios');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = e.target.value;
    setSearch(value);

    const params = new URLSearchParams();
    if (value.trim()) {
      params.set('search', value);
    }

    router.replace(params.toString() ? `?${params.toString()}` : '?');
  };

  const handleCreateOpen = () => {
    setSelectedTestimonial(null);
    setIsCreateDialogOpen(true);
  };

  const handleEditOpen = (testimonial: Testimonial) => {
    setSelectedTestimonial(testimonial);
    setIsEditDialogOpen(true);
  };

  const handleDeleteOpen = (testimonial: Testimonial) => {
    setSelectedTestimonial(testimonial);
    setIsDeleteDialogOpen(true);
  };

  const handleCreateSuccess = async () => {
    setIsCreateDialogOpen(false);
    await refreshTestimonials();
    alert.success('Testimonio creado correctamente');
  };

  const handleEditSuccess = async () => {
    setIsEditDialogOpen(false);
    setSelectedTestimonial(null);
    await refreshTestimonials();
    alert.success('Testimonio actualizado correctamente');
  };

  const handleDeleteSuccess = async () => {
    setIsDeleteDialogOpen(false);
    setSelectedTestimonial(null);
    await refreshTestimonials();
    alert.success('Testimonio eliminado correctamente');
  };

  const filteredTestimonials = useMemo(() => {
    if (!search.trim()) return testimonials;

    const searchLower = search.toLowerCase();
    return testimonials.filter(
      (t) =>
        t.name.toLowerCase().includes(searchLower) ||
        t.position?.toLowerCase().includes(searchLower) ||
        t.content.toLowerCase().includes(searchLower)
    );
  }, [testimonials, search]);

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Testimonios</h1>
          <p className="text-muted-foreground mt-1">Gestión de testimonios de clientes</p>
        </div>
        <IconButton
          icon="add"
          variant="text"
          onClick={handleCreateOpen}
          ariaLabel="Crear testimonio"
          size="lg"
        />
      </div>

      {/* Search */}
      <div className="flex-1 min-w-0 max-w-xs sm:max-w-sm">
        <TextField
          label="Buscar testimonios"
          placeholder="Por nombre, posición..."
          value={search}
          onChange={handleSearchChange}
          startIcon="search"
          type="search"
        />
      </div>

      {/* Content States */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-card rounded-lg border border-border h-48 animate-pulse" />
          ))}
        </div>
      ) : filteredTestimonials.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <span className="material-symbols-outlined text-5xl block mb-4" style={{ fontSize: '64px' }}>
            comment_bank
          </span>
          <p className="text-lg font-medium">No hay testimonios disponibles</p>
          <p className="text-sm">Crea tu primer testimonio para empezar</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
          {filteredTestimonials.map((testimonial) => (
            <TestimonialCard
              key={testimonial.id}
              testimonial={testimonial}
              onEdit={handleEditOpen}
              onDelete={handleDeleteOpen}
            />
          ))}
        </div>
      )}

      {/* Dialogs */}
      <CreateTestimonialDialog open={isCreateDialogOpen} onClose={() => setIsCreateDialogOpen(false)} onSuccess={handleCreateSuccess} />

      <UpdateTestimonialDialog
        open={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        testimonial={selectedTestimonial}
        onSuccess={handleEditSuccess}
      />

      <DeleteTestimonialDialog
        open={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        testimonial={selectedTestimonial}
        onSuccess={handleDeleteSuccess}
      />
    </div>
  );
}
