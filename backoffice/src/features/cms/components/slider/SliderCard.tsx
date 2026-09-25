'use client'

import { GripVertical } from 'lucide-react'
import { Slide } from '@/features/cms/actions/slides.action'
import { IconButton } from '@realestate/ui'
import { HeroBannerPreview } from './HeroBannerPreview'

interface SliderCardProps {
  slide: Slide;
  position: number;
  autoplaySeconds: number;
  dragAttributes?: any;
  dragListeners?: any;
  isDragging?: boolean;
  onDelete?: (slide: Slide) => void;
  onEdit?: (slide: Slide) => void;
}

export default function SliderCard({
  slide,
  position,
  autoplaySeconds,
  dragAttributes,
  dragListeners,
  isDragging = false,
  onDelete,
  onEdit,
}: SliderCardProps) {
  const statusLabel = slide.isActive ? 'Activo' : 'Inactivo';

  return (
    <article
      className={`relative overflow-hidden rounded-xl border border-border shadow-sm ${
        isDragging ? 'opacity-60 ring-2 ring-primary/40' : ''
      }`}
    >
      <HeroBannerPreview slide={slide} />
      <div className="pointer-events-none absolute left-3 top-3 z-20 rounded-md border border-white/30 bg-black/45 px-2 py-1 text-xs font-medium text-white backdrop-blur-sm">
        {statusLabel} · Posición {position} · {autoplaySeconds}s
      </div>
      <div
        role="button"
        tabIndex={0}
        className="absolute right-3 top-3 z-20 flex h-9 w-9 cursor-grab items-center justify-center rounded-md border border-white/30 bg-black/45 text-white backdrop-blur-sm active:cursor-grabbing"
        title="Arrastra para reordenar"
        {...dragAttributes}
        {...dragListeners}
      >
        <GripVertical className="h-5 w-5" />
      </div>
      <div className="absolute bottom-3 right-3 z-20 flex items-center gap-2">
        <IconButton
          icon="edit"
          variant="text"
          onClick={() => onEdit?.(slide)}
          aria-label="Editar slide"
          className="rounded-md bg-white/90 text-foreground"
        />
        <IconButton
          icon="delete"
          variant="text"
          onClick={() => onDelete?.(slide)}
          className="rounded-md bg-white/90 text-red-500"
          aria-label="Eliminar slide"
        />
      </div>
    </article>
  )
}
