'use client';

/**
 * MultimediaGrid Component - Dynamic Layout
 * 
 * Responsable de visualizar la galería de multimedia con layout dinámico.
 * 
 * Layout rules (hasta 4 elementos):
 * - 1 elemento: ancho completo
 * - 2 elementos: 61.8% / 38.2% horizontal
 * - 3 elementos: 61.8% izquierda, derecha dividida vertical 61.8% / 38.2%
 * - 4 elementos: 61.8% izquierda, derecha con 61.8% superior y base 38.2% dividida 61.8% / 38.2%
 * 
 * Props:
 * - mainImageUrl: URL de la imagen/video principal
 * - multimedia: Array de multimedia adicionales
 * - propertyTitle: Título de la propiedad
 */

import React, { useMemo, useState } from 'react';
import FontAwesome from '@/shared/components/ui/FontAwesome/FontAwesome';

interface MediaItem {
  id?: string;
  url: string;
  type?: string;
  format?: string;
}

interface MultimediaGridProps {
  mainImageUrl?: string;
  multimedia?: MediaItem[];
  propertyTitle: string;
}

function isVideoFile(url: string): boolean {
  const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi', '.mkv'];
  const lowerUrl = url.toLowerCase();
  return videoExtensions.some(ext => lowerUrl.includes(ext));
}

function getMediaType(item: MediaItem): 'image' | 'video' {
  if (isVideoFile(item.url)) return 'video';
  if (item.format === 'IMG' || item.type === 'PROPERTY_IMG') return 'image';
  if (item.format === 'VIDEO' || item.type === 'PROPERTY_VIDEO') return 'video';
  return isVideoFile(item.url) ? 'video' : 'image';
}

export default function MultimediaGrid({
  mainImageUrl,
  multimedia = [],
  propertyTitle,
}: MultimediaGridProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Build complete media array for modal: mainImageUrl first + all multimedia
  const allMedia = useMemo(() => {
    const items: (MediaItem & { type: 'image' | 'video' })[] = [];
    if (mainImageUrl) {
      items.push({
        id: 'main',
        url: mainImageUrl,
        type: getMediaType({ url: mainImageUrl }),
      });
    }
    if (multimedia && multimedia.length > 0) {
      items.push(
        ...multimedia.map((m) => ({
          id: m.id,
          url: m.url,
          type: getMediaType(m),
        }))
      );
    }
    // Debug log
    console.log('[MultimediaGrid] Debug:', {
      mainImageUrl,
      multimediaCount: multimedia?.length || 0,
      allMediaCount: items.length,
      items: items.map(i => ({ id: i.id, url: i.url?.substring(0, 50) })),
    });
    return items;
  }, [mainImageUrl, multimedia]);

  // Determine layout based on grid image count (max 3)
  const gridMedia = allMedia.slice(0, 4);
  const layoutType = useMemo(() => {
    if (gridMedia.length === 0) return 'empty';
    if (gridMedia.length === 1) return 'single';
    if (gridMedia.length === 2) return 'double';
    if (gridMedia.length === 3) return 'triple';
    if (gridMedia.length === 4) return 'quad';
    return 'empty';
  }, [gridMedia.length]);

  if (layoutType === 'empty') {
    return null;
  }

  const handlePrevious = () => {
    setSelectedIndex((prev) => (prev === 0 ? allMedia.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setSelectedIndex((prev) => (prev === allMedia.length - 1 ? 0 : prev + 1));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') handlePrevious();
    if (e.key === 'ArrowRight') handleNext();
    if (e.key === 'Escape') setIsModalOpen(false);
  };

  const renderMediaItem = (
    media: typeof allMedia[0],
    index: number,
    options?: { showOverlay?: boolean }
  ) => {
    const isVideo = media.type === 'video';
    
    return (
      <div
        key={media.id || index}
        className="relative w-full h-full bg-gray-900 flex items-center justify-center cursor-pointer group overflow-hidden"
        onClick={() => {
          setSelectedIndex(index);
          setIsModalOpen(true);
        }}
      >
        {isVideo ? (
          <video
            src={media.url}
            className="w-full h-full object-cover"
            muted
            autoPlay
            loop
          />
        ) : (
          <img
            src={media.url}
            alt={`${propertyTitle} - ${index}`}
            className="w-full h-full object-cover"
          />
        )}

        {/* Overlay */}
        <div
          className={`absolute inset-0 transition-colors ${
            options?.showOverlay
              ? 'bg-black/45'
              : 'bg-black/0 group-hover:bg-black/30'
          }`}
        />
        {options?.showOverlay && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white pointer-events-none gap-2">
            <span className="material-symbols-outlined text-4xl">more_horiz</span>
            <span className="text-sm font-medium uppercase tracking-wide">Ver más</span>
          </div>
        )}
        {/* No mostrar icono de play en el grid, solo en el modal */}
      </div>
    );
  };

  // LAYOUT SINGLE (1 image - full width)
  if (layoutType === 'single') {
    return (
      <>
        <div className="w-full rounded-lg overflow-hidden bg-gray-900" style={{ aspectRatio: '16/9' }}>
          {renderMediaItem(gridMedia[0], 0)}
        </div>
        {/* Fullscreen Modal */}
        {isModalOpen && (
          <FullscreenModal
            media={allMedia}
            selectedIndex={selectedIndex}
            propertyTitle={propertyTitle}
            onClose={() => setIsModalOpen(false)}
            onPrevious={handlePrevious}
            onNext={handleNext}
            onKeyDown={handleKeyDown}
          />
        )}
      </>
    );
  }

  // LAYOUT DOUBLE (2 images - golden ratio: 61.8% + 38.2%)
  if (layoutType === 'double') {
    return (
      <>
        <div className="w-full rounded-lg overflow-hidden flex gap-2" style={{ height: '400px', background: 'transparent' }}>
          {/* First image: ~61.8% width */}
          <div style={{ width: '61.8%', background: 'white' }} className="rounded-lg overflow-hidden">
            {renderMediaItem(gridMedia[0], 0)}
          </div>
          {/* Second image: ~38.2% width */}
          <div style={{ width: '38.2%', background: 'white' }} className="rounded-lg overflow-hidden">
            {renderMediaItem(gridMedia[1], 1)}
          </div>
        </div>
        {/* Fullscreen Modal */}
        {isModalOpen && (
          <FullscreenModal
            media={allMedia}
            selectedIndex={selectedIndex}
            propertyTitle={propertyTitle}
            onClose={() => setIsModalOpen(false)}
            onPrevious={handlePrevious}
            onNext={handleNext}
            onKeyDown={handleKeyDown}
          />
        )}
      </>
    );
  }

  // LAYOUT TRIPLE (3 images)
  if (layoutType === 'triple') {
    // Golden ratio: left 61.8%, right 38.2% (stacked vertically)
    return (
      <>
        <div className="w-full rounded-lg overflow-hidden flex gap-2" style={{ height: '400px', background: 'transparent' }}>
          {/* First image: ~61.8% width */}
          <div style={{ width: '61.8%', background: 'white' }} className="rounded-lg overflow-hidden">
            {renderMediaItem(gridMedia[0], 0)}
          </div>
          {/* Second and third images stacked vertically: ~38.2% width */}
          <div style={{ width: '38.2%', background: 'white' }} className="flex flex-col gap-2 rounded-lg overflow-hidden">
            <div style={{ height: '61.8%' }} className="rounded-lg overflow-hidden">
              {renderMediaItem(gridMedia[1], 1)}
            </div>
            <div style={{ height: '38.2%' }} className="rounded-lg overflow-hidden">
              {renderMediaItem(gridMedia[2], 2)}
            </div>
          </div>
        </div>
        {/* Fullscreen Modal */}
        {isModalOpen && (
          <FullscreenModal
            media={allMedia}
            selectedIndex={selectedIndex}
            propertyTitle={propertyTitle}
            onClose={() => setIsModalOpen(false)}
            onPrevious={handlePrevious}
            onNext={handleNext}
            onKeyDown={handleKeyDown}
          />
        )}
      </>
    );
  }

  // LAYOUT QUAD (4 images)
  if (layoutType === 'quad') {
    return (
      <>
        <div className="w-full rounded-lg overflow-hidden flex gap-2" style={{ height: '400px', background: 'transparent' }}>
          <div style={{ width: '61.8%', background: 'white' }} className="rounded-lg overflow-hidden">
            {renderMediaItem(gridMedia[0], 0)}
          </div>
          <div style={{ width: '38.2%', background: 'white' }} className="flex flex-col gap-2 rounded-lg overflow-hidden">
            <div style={{ height: '61.8%' }} className="rounded-lg overflow-hidden">
              {renderMediaItem(gridMedia[1], 1)}
            </div>
            <div style={{ height: '38.2%' }} className="flex gap-2">
              <div style={{ width: '61.8%' }} className="rounded-lg overflow-hidden">
                {renderMediaItem(gridMedia[2], 2)}
              </div>
              <div style={{ width: '38.2%' }} className="rounded-lg overflow-hidden">
                {renderMediaItem(gridMedia[3], 3, {
                  showOverlay: allMedia.length >= 4,
                })}
              </div>
            </div>
          </div>
        </div>
        {isModalOpen && (
          <FullscreenModal
            media={allMedia}
            selectedIndex={selectedIndex}
            propertyTitle={propertyTitle}
            onClose={() => setIsModalOpen(false)}
            onPrevious={handlePrevious}
            onNext={handleNext}
            onKeyDown={handleKeyDown}
          />
        )}
      </>
    );
  }

  // Si hay más de 3, mostrar solo los primeros 3 en el grid
  // El modal mostrará todos los elementos
  return null;
}

interface FullscreenModalProps {
  media: (MediaItem & { type: 'image' | 'video' })[];
  selectedIndex: number;
  propertyTitle: string;
  onClose: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
}

function FullscreenModal({
  media,
  selectedIndex,
  propertyTitle,
  onClose,
  onPrevious,
  onNext,
  onKeyDown,
}: FullscreenModalProps) {
  const currentMedia = media[selectedIndex];

  return (
    <div
      className="fixed inset-0 z-[1000] bg-black/95 flex flex-col items-center justify-center p-4"
      onClick={onClose}
      onKeyDown={onKeyDown}
      role="dialog"
      tabIndex={-1}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white hover:text-gray-300 p-2 transition-colors"
        title="Cerrar (ESC)"
      >
        <span className="material-symbols-outlined" style={{ fontSize: '32px' }}>
          close
        </span>
      </button>

      {/* Main content */}
      <div
        className="relative w-full max-w-4xl flex items-center justify-center"
        style={{ maxHeight: '80vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Media display */}
        {currentMedia.type === 'video' ? (
          <video
            src={currentMedia.url}
            className="w-full h-full object-contain"
            autoPlay
            muted
            loop
            controls
          />
        ) : (
          <img
            src={currentMedia.url}
            alt={`${propertyTitle} - ${selectedIndex}`}
            className="w-full h-full object-contain"
          />
        )}

        {/* Navigation arrows */}
        {media.length > 1 && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onPrevious();
              }}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white p-5 rounded-full transition-colors shadow-lg"
              style={{ minWidth: '56px', minHeight: '56px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              title="Anterior"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '32px' }}>
                chevron_left
              </span>
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onNext();
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white p-5 rounded-full transition-colors shadow-lg"
              style={{ minWidth: '56px', minHeight: '56px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              title="Siguiente"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '32px' }}>
                chevron_right
              </span>
            </button>
          </>
        )}
      </div>

      {/* Counter */}
      <div className="mt-4 text-white text-sm">
        {selectedIndex + 1} / {media.length}
      </div>

      {/* Keyboard hint */}
      <div className="absolute bottom-4 left-4 text-gray-400 text-xs">
        <p>← → = Navegar | ESC = Cerrar</p>
      </div>
    </div>
  );
}
