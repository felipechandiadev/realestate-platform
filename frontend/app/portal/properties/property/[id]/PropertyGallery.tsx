'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import FontAwesome from '@/shared/components/ui/FontAwesome/FontAwesome';

interface MediaItem {
  id?: string;
  url: string;
  type?: string;
  format?: string;
}

// Gallery Modal Component
function GalleryModal({
  mediaList,
  initialIndex,
  propertyTitle,
  onClose,
}: {
  mediaList: MediaItem[];
  initialIndex: number;
  propertyTitle: string;
  onClose: () => void;
}) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        setCurrentIndex((prev) => (prev === 0 ? mediaList.length - 1 : prev - 1));
      } else if (e.key === 'ArrowRight') {
        setCurrentIndex((prev) => (prev === mediaList.length - 1 ? 0 : prev + 1));
      }
    };

    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, [mediaList.length, onClose]);

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev === 0 ? mediaList.length - 1 : prev - 1));
  }, [mediaList.length]);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev === mediaList.length - 1 ? 0 : prev + 1));
  }, [mediaList.length]);

  const handleThumbnailClick = (index: number) => {
    setCurrentIndex(index);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 flex flex-col"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {/* Top Bar */}
      <div className="flex items-center justify-between px-6 py-4 bg-black/50 backdrop-blur-sm border-b border-white/10">
        <div className="text-white text-sm font-medium">
          {currentIndex + 1} de {mediaList.length}
        </div>

        <button
          onClick={onClose}
          className="text-white hover:bg-white/10 p-2 rounded-lg transition-colors"
          title="Cerrar (ESC)"
        >
          <FontAwesome icon="xmark" className="text-2xl" />
        </button>
      </div>

      {/* Main Image Container */}
      <div className="flex-1 flex items-center justify-center px-6 py-8">
        <div className="relative w-full max-w-5xl flex items-center justify-center overflow-hidden rounded-xl bg-black/40 border border-white/10 min-h-[320px]">
          {mediaList[currentIndex]?.url ? (
            <img
              src={mediaList[currentIndex].url}
              alt={`${propertyTitle} - ${currentIndex + 1}`}
              className="max-w-full max-h-full object-contain"
            />
          ) : (
            <div className="flex items-center justify-center text-white">
              <FontAwesome icon="image-not-supported" className="text-6xl text-muted-foreground" />
            </div>
          )}
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="px-6 pb-4">
        <div className="flex items-center gap-4 w-full max-w-5xl mx-auto">
          <button
            onClick={goToPrevious}
            className="flex h-12 w-12 flex-none items-center justify-center rounded-full border border-white/30 text-white hover:bg-white/20 transition-colors"
            title="Anterior (Flecha izquierda)"
            aria-label="Anterior"
          >
            <FontAwesome icon="chevron-left" className="text-2xl" />
          </button>

          <div className="flex-1 px-6 py-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 text-white text-sm font-medium text-center truncate">
            {propertyTitle}
          </div>

          <button
            onClick={goToNext}
            className="flex h-12 w-12 flex-none items-center justify-center rounded-full border border-white/30 text-white hover:bg-white/20 transition-colors"
            title="Siguiente (Flecha derecha)"
            aria-label="Siguiente"
          >
            <FontAwesome icon="chevron-right" className="text-2xl" />
          </button>
        </div>
      </div>

      {/* Bottom Thumbnails Bar */}
      <div className="bg-black/50 backdrop-blur-sm border-t border-white/10 px-4 py-4 overflow-x-auto">
        <div className="flex gap-2 pb-2">
          {mediaList.map((item, idx) => (
            <button
              key={`${item.url}-${idx}`}
              onClick={() => handleThumbnailClick(idx)}
              className={`flex-shrink-0 rounded-lg overflow-hidden transition-all ${
                idx === currentIndex
                  ? 'ring-2 ring-primary h-20 w-32'
                  : 'opacity-60 hover:opacity-100 h-16 w-24'
              }`}
            >
              {item.url ? (
                <img
                  src={item.url}
                  alt={`Miniatura ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <FontAwesome icon="image-not-supported" className="text-muted-foreground" />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// Property Gallery Component
interface PropertyGalleryProps {
  mainImageUrl?: string;
  multimedia?: MediaItem[];
  propertyTitle: string;
}

export default function PropertyGallery({
  mainImageUrl,
  multimedia = [],
  propertyTitle,
}: PropertyGalleryProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const mediaList = useMemo(() => {
    const list: MediaItem[] = [];

    if (mainImageUrl) {
      list.push({ url: mainImageUrl, type: 'MAIN_IMAGE' });
    }

    if (multimedia && multimedia.length > 0) {
      multimedia.forEach((item) => {
        if (item.url !== mainImageUrl) {
          list.push(item);
        }
      });
    }

    return list;
  }, [mainImageUrl, multimedia]);

  const goldenRatio = 1.618;
  const mainWidthPercent = (goldenRatio / (1 + goldenRatio)) * 100;
  const thumbWidthPercent = (1 / (1 + goldenRatio)) * 100;

  const maxVisibleImages = 4; // 1 principal + 3 miniaturas
  const displayedMedia = mediaList.slice(0, maxVisibleImages);
  const hasMoreImages = mediaList.length > maxVisibleImages;

  const handleMainImageClick = () => {
    setSelectedIndex(0);
    setIsModalOpen(true);
  };

  const handleThumbnailClick = (index: number) => {
    setSelectedIndex(index);
    setIsModalOpen(true);
  };

  if (mediaList.length === 0) {
    return (
      <div className="w-full aspect-video rounded-lg flex items-center justify-center border border-border">
        <FontAwesome
          icon="image-not-supported"
          className="text-muted-foreground text-4xl"
        />
      </div>
    );
  }

  // Usar ancho completo si hay solo una imagen, sino usar proporción dorada
  const isSingleImage = mediaList.length === 1;
  const mainWidth = isSingleImage ? '100%' : `${mainWidthPercent}%`;
  const thumbWidth = isSingleImage ? '0%' : `${thumbWidthPercent}%`;

  return (
    <>
      <div className={`flex flex-col ${isSingleImage ? '' : 'md:flex-row'} gap-4 h-96 w-full`}>
        {/* Main Image - Left on desktop */}
        <div
          className="overflow-hidden rounded-lg shadow-md cursor-pointer group flex-shrink-0"
          style={{ width: mainWidth, height: '100%' }}
          onClick={handleMainImageClick}
        >
          {displayedMedia[0]?.url ? (
            <img
              src={displayedMedia[0].url}
              alt={propertyTitle}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center border border-border">
              <FontAwesome
                icon="image-not-supported"
                className="text-muted-foreground text-3xl"
              />
            </div>
          )}
        </div>

        {/* Thumbnail Strip - Right on desktop, bottom on mobile */}
        {!isSingleImage && (
        <div
          className="flex flex-row md:flex-col gap-4 overflow-x-auto md:overflow-y-auto md:overflow-x-visible flex-1"
          style={{ width: isSingleImage ? '0%' : 'auto' }}
        >
          {displayedMedia.slice(1).map((item, idx) => {
            // 3 miniaturas para distribuir en el espacio disponible (38.2% ancho, 100% alto)
            const numThumbnails = displayedMedia.length - 1; // Cantidad de miniaturas reales
            const totalThumbnails = hasMoreImages ? 3 : numThumbnails; // Si hay más, mostrar 3 espacios; si no, los que hay
            const gapSize = 16; // gap-4 = 16px
            const thumbHeight = `calc((100% - ${(totalThumbnails - 1) * gapSize}px) / ${totalThumbnails})`;
            
            return (
            <div
              key={`${item.url}-${idx}`}
              className="flex-shrink-0 rounded-lg shadow-md cursor-pointer group overflow-hidden"
              style={{
                width: '100%',
                height: thumbHeight,
              }}
              onClick={() => handleThumbnailClick(idx + 1)}
            >
              {item.url ? (
                <img
                  src={item.url}
                  alt={`${propertyTitle} - ${idx + 1}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center border border-border">
                  <FontAwesome
                    icon="image-not-supported"
                    className="text-muted-foreground text-lg"
                  />
                </div>
              )}
            </div>
            );
          })}

          {hasMoreImages && (() => {
            const totalThumbnails = 3;
            const numThumbnails = displayedMedia.length - 1;
            const gapSize = 16;
            const thumbHeight = `calc((100% - ${(totalThumbnails - 1) * gapSize}px) / ${totalThumbnails})`;
            
            return (
            <button
              onClick={() => {
                setSelectedIndex(0);
                setIsModalOpen(true);
              }}
              className="flex-shrink-0 rounded-lg shadow-md bg-black/50 hover:bg-black/70 transition-colors flex items-center justify-center text-white font-semibold text-sm cursor-pointer"
              style={{
                width: '100%',
                height: thumbHeight,
              }}
            >
              <div className="text-center">
                <div className="text-2xl font-bold">+{mediaList.length - maxVisibleImages}</div>
                <div className="text-xs">Ver más</div>
              </div>
            </button>
            );
          })()}
        </div>
        )}
      </div>

      {isModalOpen && (
        <GalleryModal
          mediaList={mediaList}
          initialIndex={selectedIndex}
          propertyTitle={propertyTitle}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  );
}
