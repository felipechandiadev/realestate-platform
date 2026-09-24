'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Slide } from '@/features/backoffice/cms/actions/slides.action'
import SliderCard from './SliderCard'

interface SortableSliderCardProps {
  slide: Slide;
  isDragOverlay?: boolean;
  onDelete?: (slide: Slide) => void;
  onEdit?: (slide: Slide) => void;
}

export default function SortableSliderCard({
  slide,
  isDragOverlay = false,
  onDelete,
  onEdit,
}: SortableSliderCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: slide.id,
    disabled: isDragOverlay,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        ${isDragging ? 'z-50' : ''}
        ${isDragOverlay ? 'rotate-3 shadow-2xl' : ''}
      `}
    >
      <SliderCard
        slide={slide}
        dragAttributes={attributes}
        dragListeners={listeners}
        isDragging={isDragging}
        onDelete={onDelete}
        onEdit={onEdit}
      />
    </div>
  )
}
