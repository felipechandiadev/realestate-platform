'use client';
import { useState, useEffect } from "react";
import IconButton from '@/shared/components/ui/IconButton/IconButton';
import { TextField } from '@/shared/components/ui/TextField/TextField';
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from '@/shared/components/ui/Button/Button';
import { useAlert } from '@/providers/AlertContext';
import TestimonialCard from './TestimonialCard';
import CreateTestimonialDialog from './CreateTestimonialDialog';
import UpdateTestimonialDialog from './UpdateTestimonialDialog';
import DeleteTestimonialDialog from './DeleteTestimonialDialog';

export interface Testimonial {
  id: string;
  name: string;
  content: string;
  position?: string;
  imageUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ListTestimonialsProps {
  testimonials: Testimonial[];
}

const ListTestimonials: React.FC<ListTestimonialsProps> = ({
  testimonials,
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { success, error } = useAlert();

  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedTestimonial, setSelectedTestimonial] = useState<Testimonial | null>(null);

  useEffect(() => {
    setSearch(searchParams.get("search") || "");
  }, [searchParams]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = e.target.value;
    setSearch(value);
    const params = new URLSearchParams(Array.from(searchParams.entries()));
    if (value) {
      params.set("search", value);
    } else {
      params.delete("search");
    }
    router.replace(`?${params.toString()}`);
  };

  const handleCreateTestimonial = () => {
    setCreateDialogOpen(true);
  };

  const handleEditTestimonial = (testimonial: Testimonial) => {
    setSelectedTestimonial(testimonial);
    setEditDialogOpen(true);
  };

  const handleDeleteTestimonial = (testimonial: Testimonial) => {
    setSelectedTestimonial(testimonial);
    setDeleteDialogOpen(true);
  };

  const handleSuccess = () => {
    router.refresh();
  };

  return (
    <>
      <div className="w-full">
        {/* Primera fila: botón agregar y búsqueda */}
        <div className="flex items-center justify-between mb-6 gap-4">
          <IconButton
            aria-label="Agregar testimonio"
            variant="containedPrimary"
            onClick={handleCreateTestimonial}
            icon="add"
          />
          <div className="flex-1 max-w-md">
            <TextField
              label="Buscar testimonios"
              value={search}
              onChange={handleSearchChange}
              startIcon="search"
              placeholder="Buscar por nombre..."
            />
          </div>
        </div>

        {/* Grid de tarjetas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map(testimonial => (
            <TestimonialCard
              key={testimonial.id}
              testimonial={testimonial}
              onEdit={handleEditTestimonial}
              onDelete={handleDeleteTestimonial}
            />
          ))}
        </div>

        {testimonials.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            No hay testimonios para mostrar.
            {search && (
              <div className="mt-2">
                <Button
                  variant="text"
                  onClick={() => {
                    setSearch('');
                    router.replace('/backOffice/cms/testimonials');
                  }}
                >
                  Limpiar búsqueda
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Dialogs */}
      <CreateTestimonialDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onSuccess={handleSuccess}
      />

      <UpdateTestimonialDialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        onSuccess={handleSuccess}
        testimonial={selectedTestimonial}
      />

      <DeleteTestimonialDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onSuccess={handleSuccess}
        testimonial={selectedTestimonial}
      />
    </>
  );
};

export default ListTestimonials;