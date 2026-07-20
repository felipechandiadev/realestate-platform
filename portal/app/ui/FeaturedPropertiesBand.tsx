'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import FeaturedPropertyCard, { FeaturedProperty } from './FeaturedPropertyCard';

const CARD_GAP_PX = 20;
const MIN_DUPLICATES = 2;

interface PropertyFromAPI {
  id: string;
  title: string;
  description?: string;
  price: number;
  currency: 'CLP' | 'UF';
  operationType: 'RENT' | 'SALE';
  state?: string;
  city?: string;
  mainImageUrl?: string;
  multimedia?: Array<{
    id: string;
    url: string;
    type?: string;
    format?: string;
    variants?: Array<{
      id?: string;
      variantType: string;
      format: 'webp' | 'jpeg' | 'png';
      width: number;
      height: number;
      size: number;
      url: string;
    }>;
  }>;
  bedrooms?: number;
  bathrooms?: number;
  builtSquareMeters?: number;
}

const normalizeVariantType = (value?: string) => (value || '').trim().toLowerCase().replace(/-/g, '_');

const pickBestImageUrl = (property: PropertyFromAPI): string | null => {
  const mediaItems = property.multimedia || [];
  const imageMedia =
    mediaItems.find((item) => item.type === 'PROPERTY_IMG') ||
    mediaItems.find((item) => item.format === 'IMG') ||
    mediaItems[0];

  if (!imageMedia) {
    return property.mainImageUrl ?? null;
  }

  const variants = imageMedia.variants || [];
  const preferredTypes = ['thumbnail_md', 'thumbnail_lg', 'thumbnail_sm', 'full', 'og_image'];

  for (const preferredType of preferredTypes) {
    const webp = variants.find(
      (variant) => normalizeVariantType(variant.variantType) === preferredType && variant.format === 'webp',
    );
    if (webp?.url) return webp.url;

    const jpeg = variants.find(
      (variant) => normalizeVariantType(variant.variantType) === preferredType && variant.format === 'jpeg',
    );
    if (jpeg?.url) return jpeg.url;
  }

  return imageMedia.url || property.mainImageUrl || null;
};

const mapToFeaturedProperty = (property: PropertyFromAPI): FeaturedProperty => ({
  id: property.id,
  title: property.title,
  description: property.description ?? null,
  price: property.price,
  currencyPrice: property.currency,
  operationType: property.operationType === 'SALE' ? 'SALE' : 'RENT',
  mainImageUrl: pickBestImageUrl(property),
  city: property.city ?? null,
  state: property.state ?? null,
  bedrooms: property.bedrooms ?? null,
  bathrooms: property.bathrooms ?? null,
  builtSquareMeters: property.builtSquareMeters ?? null,
  isFeatured: true,
});

interface FeaturedPropertiesBandProps {
  properties: PropertyFromAPI[];
  scrollSpeed?: number; // pixels per second
}

export default function FeaturedPropertiesBand({ properties, scrollSpeed }: FeaturedPropertiesBandProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const featuredProperties = useMemo(
    () => properties.map(mapToFeaturedProperty),
    [properties]
  );
  const baseDuplicatesFactor = useMemo(() => {
    if (!featuredProperties.length) return 0;
    // Si hay 8+ propiedades, duplicar solo 2 veces. Si hay menos, duplicar más para llenar la banda.
    if (featuredProperties.length >= 8) return 2;
    return Math.max(MIN_DUPLICATES, Math.ceil(8 / featuredProperties.length));
  }, [featuredProperties.length]);
  const [duplicatesFactor, setDuplicatesFactor] = useState(baseDuplicatesFactor);

  useEffect(() => {
    setDuplicatesFactor(baseDuplicatesFactor);
  }, [baseDuplicatesFactor]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !featuredProperties.length || !baseDuplicatesFactor) return;

    let frameId: number | undefined;

    const recalculateDuplicates = () => {
      const firstCard = container.querySelector('[data-property-card]') as HTMLElement | null;
      if (!firstCard) {
        frameId = requestAnimationFrame(recalculateDuplicates);
        return;
      }

      const cardWidth = firstCard.offsetWidth;
      if (cardWidth <= 0) {
        return;
      }

      const uniqueWidth = (cardWidth + CARD_GAP_PX) * featuredProperties.length;
      if (uniqueWidth <= 0) {
        return;
      }

      const requiredByViewport = Math.ceil(container.clientWidth / uniqueWidth) + 1;
      const nextFactor = Math.max(baseDuplicatesFactor, requiredByViewport, MIN_DUPLICATES);

      setDuplicatesFactor((previous) => (previous === nextFactor ? previous : nextFactor));
    };

    recalculateDuplicates();
    window.addEventListener('resize', recalculateDuplicates);

    return () => {
      if (frameId) {
        cancelAnimationFrame(frameId);
      }
      window.removeEventListener('resize', recalculateDuplicates);
    };
  }, [baseDuplicatesFactor, featuredProperties.length]);

  const loopedProperties = useMemo(() => {
    if (!featuredProperties.length) {
      return [] as FeaturedProperty[];
    }

    const clones: FeaturedProperty[] = [];
    for (let i = 0; i < duplicatesFactor; i += 1) {
      clones.push(...featuredProperties);
    }
    return clones;
  }, [duplicatesFactor, featuredProperties]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !loopedProperties.length || !duplicatesFactor) return;

    let animationFrame: number;
    const speed = scrollSpeed ?? 20;
    let lastTime: number | null = null;
    let paused = false;
    let pauseTimeout: ReturnType<typeof setTimeout> | null = null;

    // Esperar a que el DOM esté listo y las cards renderizadas
    const startAnimation = () => {
      const firstCard = container.querySelector('[data-property-card]') as HTMLElement;
      if (!firstCard) {
        // Si no hay cards aún, reintentar
        requestAnimationFrame(startAnimation);
        return;
      }

      // Calcular el ancho exacto de una sección (todas las propiedades originales una vez)
      const cardWidth = firstCard.offsetWidth;
      const uniqueWidth = (cardWidth + CARD_GAP_PX) * featuredProperties.length;
      let preciseScrollLeft = container.scrollLeft;

      const animate = (timestamp: number) => {
        if (!container) return;
        
        if (paused) {
          lastTime = timestamp;
          preciseScrollLeft = container.scrollLeft;
          animationFrame = requestAnimationFrame(animate);
          return;
        }

        if (lastTime === null) {
          lastTime = timestamp;
        }

        const delta = timestamp - lastTime;
        lastTime = timestamp;
        const advance = (speed * delta) / 1000;
        
        // Incrementar scroll en subpíxel para evitar redondeo a entero en velocidades bajas
        preciseScrollLeft += advance;

        // Loop infinito perfecto usando módulo
        if (preciseScrollLeft >= uniqueWidth) {
          preciseScrollLeft = preciseScrollLeft % uniqueWidth;
        }

        container.scrollLeft = preciseScrollLeft;

        animationFrame = requestAnimationFrame(animate);
      };

      animationFrame = requestAnimationFrame(animate);
    };

    // Pausa el scroll automático por 2s tras interacción del usuario
    const pauseAutoScroll = () => {
      paused = true;
      if (pauseTimeout) clearTimeout(pauseTimeout);
      pauseTimeout = setTimeout(() => {
        paused = false;
      }, 2000);
    };

    container.addEventListener('pointerdown', pauseAutoScroll);
    container.addEventListener('wheel', pauseAutoScroll, { passive: true });
    container.addEventListener('touchstart', pauseAutoScroll, { passive: true });

    // Iniciar desde 0 y comenzar animación

    container.scrollLeft = 0;
    startAnimation();

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
      container.removeEventListener('pointerdown', pauseAutoScroll);
      container.removeEventListener('wheel', pauseAutoScroll);
      container.removeEventListener('touchstart', pauseAutoScroll);
      if (pauseTimeout) clearTimeout(pauseTimeout);
    };
  }, [duplicatesFactor, featuredProperties.length, scrollSpeed]);

  if (!featuredProperties.length) return null;

  return (
    <div className="relative mt-4 h-[335px] sm:h-[340px]">
      <div className="pointer-events-none absolute inset-y-0 left-0 w-16 md:w-24 lg:w-32 bg-gradient-to-r from-card to-transparent" aria-hidden />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-16 md:w-24 lg:w-32 bg-gradient-to-l from-card to-transparent" aria-hidden />
      <div
        ref={containerRef}
        className="relative h-full flex items-stretch gap-5 overflow-x-auto px-2 pb-4 pt-2 scrollbar-hide"
        style={{ WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        role="list"
        aria-label="Propiedades destacadas"
      >
        {loopedProperties.map((property, index) => (
          <div key={`${property.id}-${index}`} data-property-card className="h-full">
            <FeaturedPropertyCard property={property} />
          </div>
        ))}
      </div>
    </div>
  );
}