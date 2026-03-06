'use client'

import { useState } from 'react'
import { Slide } from '@/features/backoffice/cms/actions/slides.action'
import IconButton from '@/shared/components/ui/IconButton/IconButton'
import LazyImage from '@/shared/components/ui/LazyImage'
import { env } from '@/lib/env'

const normalizeMediaUrl = (u?: string | null): string | undefined => {
  if (!u) return undefined
  const trimmed = u.trim()
  try {
    new URL(trimmed)
    return trimmed
  } catch {
    if (trimmed.startsWith('/')) {
      return `${env.backendApiUrl.replace(/\/$/, '')}${trimmed}`
    }
    return trimmed
  }
}

interface SliderCardProps {
  slide: Slide;
  dragAttributes?: any;
  dragListeners?: any;
  isDragging?: boolean;
  onDelete?: (slide: Slide) => void;
  onEdit?: (slide: Slide) => void;
}

export default function SliderCard({
  slide,
  dragAttributes,
  dragListeners,
  isDragging = false,
  onDelete,
  onEdit,
}: SliderCardProps) {
  const [mediaError, setMediaError] = useState(false)

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'No definida'
    return new Date(dateString).toLocaleDateString('es-CL', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  }

  const handleMediaError = () => {
    setMediaError(true)
  }

  const isVideo = (url: string) => /\.mp4$/i.test(url)

  return (
    <div
      className={`bg-card rounded-lg border border-border shadow-sm hover:shadow-md transition-shadow flex flex-col h-full relative overflow-hidden ${isDragging ? 'opacity-50' : ''}`}
    >
      <div
        className="absolute top-3 left-3 z-10 cursor-move border touch-none bg-white rounded-full p-2 shadow-sm hover:shadow-md transition-shadow flex items-center justify-center"
        {...dragAttributes}
        {...dragListeners}
        title="Arrastra para reordenar"
      >
        <span className="material-symbols-outlined text-muted-foreground leading-none">
          drag_indicator
        </span>
      </div>

      <div className="absolute top-3 right-3 z-10">
        <div
          className={`w-3 h-3 rounded-full border-2 border-white shadow-sm ${slide.isActive ? 'bg-green-500' : 'bg-gray-400'}`}
          title={slide.isActive ? 'Activo' : 'Inactivo'}
        />
      </div>

      <div className="w-full overflow-hidden">
        {slide.multimedia ? (
          <>
            {isVideo(slide.multimedia.url) ? (
              <video
                src={normalizeMediaUrl(slide.multimedia.url)}
                className="w-full aspect-video object-cover"
                muted
                autoPlay
                loop
                playsInline
                onError={handleMediaError}
              />
            ) : (
              <LazyImage
                multimedia={slide.multimedia}
                variantType="slide-desktop"
                alt={slide.title}
                sizes="100vw"
                className="w-full aspect-video object-cover"
                maintainAspectRatio={true}
              />
            )}
          </>
        ) : slide.multimediaUrl && !mediaError ? (
          <>
            {isVideo(slide.multimediaUrl) ? (
              <video
                src={normalizeMediaUrl(slide.multimediaUrl)}
                className="w-full aspect-video object-cover"
                muted
                autoPlay
                loop
                playsInline
                onError={handleMediaError}
              />
            ) : (
              <LazyImage
                multimedia={{
                  id: slide.id || 'slide-' + Date.now(),
                  url: normalizeMediaUrl(slide.multimediaUrl) || '',
                  filename: 'slide-image.jpg',
                  variants: []
                }}
                variantType="slide-desktop"
                alt={slide.title}
                sizes="100vw"
                className="w-full aspect-video object-cover"
                maintainAspectRatio={true}
              />
            )}
          </>
        ) : (
          <div className="w-full aspect-video bg-gray-100 flex items-center justify-center">
            <span className="material-symbols-outlined text-gray-400" style={{ fontSize: '40px' }}>
              {(slide.multimedia?.url || slide.multimediaUrl) && isVideo(slide.multimedia?.url || slide.multimediaUrl) ? 'videocam' : 'image_not_supported'}
            </span>
          </div>
        )}
      </div>

      <div className="space-y-2 flex-1 py-2 px-4">
        <h3 className="text-lg font-semibold text-foreground line-clamp-2">{slide.title}</h3>

        {slide.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {slide.description}
          </p>
        )}

        {slide.linkUrl && (
          <div className="flex items-center gap-1 text-sm">
            <span className="material-symbols-outlined text-muted-foreground text-base">
              link
            </span>
            <a
              href={slide.linkUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:text-primary/80 underline truncate transition-colors"
              title={slide.linkUrl}
            >
              {slide.linkUrl}
            </a>
          </div>
        )}

        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground pt-2">
          <div className="flex items-center gap-1">
            <span className="material-symbols-outlined text-base">schedule</span>
            <span>{slide.duration}s</span>
          </div>

          <div className="flex items-center gap-1">
            <span className="material-symbols-outlined text-base">calendar_today</span>
            <span>{formatDate(slide.startDate)}</span>
          </div>

          <div className="flex items-center gap-1">
            <span className="material-symbols-outlined text-base">event</span>
            <span>{formatDate(slide.endDate)}</span>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center gap-2 mt-2 px-4 pb-2">
        <div className="text-xs border border-border text-muted-foreground px-3 py-1.5 rounded-full bg-card">
          Pos: {slide.order}
        </div>

        <div className="flex gap-2">
          <IconButton
            icon="edit"
            variant="text"
            onClick={() => onEdit?.(slide)}
            aria-label="Editar slide"
          />
          <IconButton
            icon="delete"
            variant="text"
            onClick={() => onDelete?.(slide)}
            className="text-red-500"
            aria-label="Eliminar slide"
          />
        </div>
      </div>
    </div>
  )
}
