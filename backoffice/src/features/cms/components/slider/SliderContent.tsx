'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAlert } from '@/providers/AlertContext';
import { TextField, IconButton, Dialog, Button, DotProgress } from '@realestate/ui';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  UniqueIdentifier,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  type Slide,
  getSlides,
  reorderSlides,
} from '@/features/cms/actions/slides.action';
import { updateIdentity } from '@/features/cms/actions/identity.action';
import SortableSliderCard from './SortableSliderCard';
import { HeroBannerPreview } from './HeroBannerPreview';
import CreateSlideForm from './CreateSlideForm';
import DeleteSlideForm from './DeleteSlideForm';
import UpdateSlideForm from './UpdateSlideForm';

interface SliderContentProps {
  initialSlides: Slide[];
  initialSearch?: string;
  identityId?: string;
  initialAutoplaySeconds?: number;
}

/**
 * Slider Content Component
 *
 * Main container for slider/carousel management
 * Preserves card-based UI and drag&drop behavior from previous version
 * 
 * @param initialSlides - Pre-loaded slides from Server Component
 * @param initialSearch - Initial search query from URL
 * @returns {React.ReactNode} Slider management interface
 */
export function SliderContent({
  initialSlides,
  initialSearch = '',
  identityId,
  initialAutoplaySeconds = 6,
}: SliderContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const alert = useAlert();

  const [search, setSearch] = useState(initialSearch);
  const [slides, setSlides] = useState<Slide[]>(initialSlides);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [slideToDelete, setSlideToDelete] = useState<Slide | null>(null);
  const [slideToEdit, setSlideToEdit] = useState<Slide | null>(null);
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [isCreateLoading, setIsCreateLoading] = useState(false);
  const [isUpdateLoading, setIsUpdateLoading] = useState(false);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);
  const [autoplaySeconds, setAutoplaySeconds] = useState(Math.max(3, initialAutoplaySeconds || 6));
  const [autoplaySaving, setAutoplaySaving] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    setSearch(searchParams.get('search') || '');
  }, [searchParams]);

  useEffect(() => {
    const allowedSearch = searchParams.get('search') || '';
    const hasLegacyParams =
      searchParams.has('limit') ||
      searchParams.has('page') ||
      searchParams.has('sort') ||
      searchParams.has('sortField') ||
      searchParams.has('filters') ||
      searchParams.has('filtration');

    if (!hasLegacyParams) {
      return;
    }

    const cleanParams = new URLSearchParams();
    if (allowedSearch.trim()) {
      cleanParams.set('search', allowedSearch.trim());
    }

    router.replace(cleanParams.toString() ? `?${cleanParams.toString()}` : '?');
  }, [router, searchParams]);

  const refreshSlides = async () => {
    setIsLoading(true);
    try {
      const result = await getSlides({
        search: search || undefined,
      });

      if (result.success) {
        setSlides(result.data || []);
      } else {
        alert.error(result.error || 'Error al cargar slides');
      }
    } catch (error) {
      console.error('Error recargando slides:', error);
      alert.error('Error al recargar los slides');
    } finally {
      setIsLoading(false);
    }
  };

  // No longer need initial fetch - data comes from Server Component via props

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = e.target.value;
    setSearch(value);

    const params = new URLSearchParams();
    if (value.trim()) {
      params.set('search', value);
    }

    router.replace(params.toString() ? `?${params.toString()}` : '?');
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = slides.findIndex((slide) => slide.id === active.id);
    const newIndex = slides.findIndex((slide) => slide.id === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      const reorderedSlides = arrayMove(slides, oldIndex, newIndex);
      setSlides(reorderedSlides);

      try {
        const slideIds = reorderedSlides.map((slide) => slide.id);
        const result = await reorderSlides(slideIds);

        if (!result.success) {
          setSlides(slides);
          alert.error(result.error || 'Error al reordenar slides');
        } else {
          alert.success('Slides reordenados exitosamente');
        }
      } catch (error) {
        setSlides(slides);
        alert.error('Error al reordenar slides');
      }
    }
  };

  const handleAddSlide = () => {
    setIsCreateDialogOpen(true);
  };

  const handleCreateSuccess = () => {
    setIsCreateDialogOpen(false);
    refreshSlides();
    alert.success('Slide creado exitosamente');
  };

  const handleCreateCancel = () => {
    setIsCreateDialogOpen(false);
  };

  const handleDeleteSlide = (slide: Slide) => {
    setSlideToDelete(slide);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteSuccess = () => {
    setIsDeleteDialogOpen(false);
    setSlideToDelete(null);
    refreshSlides();
    alert.success('Slide eliminado exitosamente');
  };

  const handleDeleteCancel = () => {
    setIsDeleteDialogOpen(false);
    setSlideToDelete(null);
  };

  const handleEditSlide = (slide: Slide) => {
    setSlideToEdit(slide);
    setIsEditDialogOpen(true);
  };

  const handleEditSuccess = () => {
    setIsEditDialogOpen(false);
    setSlideToEdit(null);
    refreshSlides();
    alert.success('Slide actualizado exitosamente');
  };

  const handleEditCancel = () => {
    setIsEditDialogOpen(false);
    setSlideToEdit(null);
  };

  const filteredSlides = slides.filter(
    (slide) =>
      (slide.title ?? '').toLowerCase().includes(search.toLowerCase()) ||
      (slide.description &&
        slide.description.toLowerCase().includes(search.toLowerCase())),
  );

  const saveAutoplay = async () => {
    if (!identityId) return;
    const seconds = Math.max(3, Math.round(Number(autoplaySeconds)) || 6);
    setAutoplaySeconds(seconds);
    setAutoplaySaving(true);
    try {
      await updateIdentity(identityId, { heroAutoplaySeconds: seconds });
      alert.success('Autoplay actualizado');
    } catch {
      alert.error('No se pudo guardar el autoplay');
    } finally {
      setAutoplaySaving(false);
    }
  };

  return (
    <div className="space-y-6 w-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Slider Principal</h1>
          <p className="text-muted-foreground mt-1">Gestiona las slides del Home</p>
        </div>
        <IconButton
          aria-label="Agregar slide"
          variant="text"
          onClick={handleAddSlide}
          icon="add"
          size={'lg'}
        />
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
        <div className="flex-1 min-w-0 max-w-xs sm:max-w-sm">
          <TextField
            label="Buscar slides"
            value={search}
            onChange={handleSearchChange}
            startIcon="search"
            placeholder="Buscar por título o descripción..."
          />
        </div>
        <div className="flex items-end gap-2 max-w-xs">
          <TextField
            label="Autoplay del carrusel (mín. 3 s)"
            type="number"
            value={String(autoplaySeconds)}
            min={3}
            disabled={!identityId || autoplaySaving}
            onChange={(event) => setAutoplaySeconds(Number(event.target.value))}
            onBlur={() => {
              void saveAutoplay();
            }}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex w-full flex-col gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="bg-background rounded-lg border border-border shadow-sm overflow-hidden"
            >
              <div className="h-[200px] bg-gray-100 animate-pulse md:h-[260px]" />
            </div>
          ))}
        </div>
      ) : filteredSlides.length === 0 ? (
        <div className="text-center py-12 text-muted">
          <IconButton
            icon="photo_library"
            variant="text"
            size="xl"
            className="mb-4 text-muted-foreground"
          />
          <p className="text-lg font-medium mb-2 text-foreground">
            {search ? `No se encontraron slides para "${search}"` : 'No hay slides para mostrar.'}
          </p>
          {search && (
            <p className="text-sm">
              Intenta con otros términos de búsqueda o crea un nuevo slide.
            </p>
          )}
        </div>
      ) : (
        <>
          {!isMounted ? (
            <div className="flex w-full flex-col gap-6">
              {filteredSlides.map((slide) => (
                <div key={slide.id} className="overflow-hidden rounded-xl border border-border shadow-sm">
                  <HeroBannerPreview slide={slide} />
                </div>
              ))}
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={filteredSlides.map((slide) => slide.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="flex w-full flex-col gap-6">
                  {filteredSlides.map((slide, index) => (
                    <SortableSliderCard
                      key={slide.id}
                      slide={slide}
                      position={slide.order >= 1 ? slide.order : index + 1}
                      autoplaySeconds={autoplaySeconds}
                      onDelete={handleDeleteSlide}
                      onEdit={handleEditSlide}
                    />
                  ))}
                </div>
              </SortableContext>

              <DragOverlay>
                {activeId ? (
                  <SortableSliderCard
                    slide={filteredSlides.find((slide) => slide.id === activeId)!}
                    position={filteredSlides.find((slide) => slide.id === activeId)?.order || 1}
                    autoplaySeconds={autoplaySeconds}
                    isDragOverlay
                    onDelete={handleDeleteSlide}
                    onEdit={handleEditSlide}
                  />
                ) : null}
              </DragOverlay>
            </DndContext>
          )}
        </>
      )}

      <Dialog
        open={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        size="lg"
        title="Crear Nuevo Slide"
        description="Completa los campos para agregar un nuevo slide al carrusel"
        actions={
          <>
            <Button variant="outlined" onClick={handleCreateCancel} disabled={isCreateLoading}>
              Cancelar
            </Button>
            <Button variant="primary" type="submit" form="create-slide-form" disabled={isCreateLoading}>
              {isCreateLoading ? <DotProgress size={12} /> : 'Crear Slide'}
            </Button>
          </>
        }
      >
        <CreateSlideForm 
          nested 
          formId="create-slide-form"
          onSuccess={handleCreateSuccess}
          onLoadingChange={setIsCreateLoading}
        />
      </Dialog>

      <Dialog 
        open={isDeleteDialogOpen} 
        onClose={handleDeleteCancel} 
        size="xs" 
        title="Eliminar Slide"
        actions={
          <>
            <Button variant="outlined" onClick={handleDeleteCancel} disabled={isDeleteLoading}>
              Cancelar
            </Button>
            <Button 
              variant="primary" 
              type="submit" 
              form="delete-slide-form"
              disabled={isDeleteLoading}
              className="border border-red-500 text-red-600 bg-white hover:bg-red-50 font-semibold"
            >
              {isDeleteLoading ? <DotProgress size={12} /> : 'Eliminar permanentemente'}
            </Button>
          </>
        }
      >
        {slideToDelete && (
          <DeleteSlideForm
            nested
            formId="delete-slide-form"
            slide={slideToDelete}
            onSuccess={handleDeleteSuccess}
            onLoadingChange={setIsDeleteLoading}
          />
        )}
      </Dialog>

      <Dialog 
        open={isEditDialogOpen} 
        onClose={handleEditCancel} 
        size="lg" 
        title="Editar Slide"
        description="Modifica los campos del slide"
        actions={
          <>
            <Button variant="outlined" onClick={handleEditCancel} disabled={isUpdateLoading}>
              Cancelar
            </Button>
            <Button variant="primary" type="submit" form="update-slide-form" disabled={isUpdateLoading}>
              {isUpdateLoading ? <DotProgress size={12} /> : 'Actualizar Slide'}
            </Button>
          </>
        }
      >
        {slideToEdit && (
          <UpdateSlideForm
            nested
            formId="update-slide-form"
            slide={slideToEdit}
            onSuccess={handleEditSuccess}
            onLoadingChange={setIsUpdateLoading}
          />
        )}
      </Dialog>
    </div>
  );
}
