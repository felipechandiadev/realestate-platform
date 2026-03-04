'use client';

import React, { useEffect, useMemo, useRef } from 'react';
import FeaturedPropertyCard, { FeaturedProperty } from './FeaturedPropertyCard';

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
  bedrooms?: number;
  bathrooms?: number;
  builtSquareMeters?: number;
}

const mapToFeaturedProperty = (property: PropertyFromAPI): FeaturedProperty => ({
  id: property.id,
  title: property.title,
  description: property.description ?? null,
  price: property.price,
  currencyPrice: property.currency,
  operationType: property.operationType === 'SALE' ? 'SALE' : 'RENT',
  mainImageUrl: property.mainImageUrl ?? null,
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
  const duplicatesFactor = useMemo(() => {
    if (!featuredProperties.length) return 0;
    return Math.max(2, Math.ceil(8 / featuredProperties.length));
  }, [featuredProperties.length]);

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
    const speed = scrollSpeed ?? 70.4;
    let lastTime: number | null = null;
    let paused = false;
    let pauseTimeout: ReturnType<typeof setTimeout> | null = null;

    const animate = (timestamp: number) => {
      if (!container) return;
      if (paused) {
        animationFrame = requestAnimationFrame(animate);
        return;
      }
      const uniqueWidth = container.scrollWidth / duplicatesFactor;
      if (uniqueWidth <= 0) {
        animationFrame = requestAnimationFrame(animate);
        return;
      }
      if (lastTime === null) {
        lastTime = timestamp;
      }
      const delta = timestamp - lastTime;
      lastTime = timestamp;
      const advance = (speed * delta) / 1000;
      container.scrollLeft += advance;
      if (container.scrollLeft >= uniqueWidth) {
        container.scrollLeft -= uniqueWidth;
        lastTime = timestamp;
      }
      animationFrame = requestAnimationFrame(animate);
    };

    // Pausa el scroll automático por 2s tras interacción del usuario
    const pauseAutoScroll = () => {
      paused = true;
      if (pauseTimeout) clearTimeout(pauseTimeout);
      pauseTimeout = setTimeout(() => {
        paused = false;
        lastTime = null;
      }, 2000);
    };

    container.addEventListener('pointerdown', pauseAutoScroll);
    container.addEventListener('wheel', pauseAutoScroll, { passive: true });
    container.addEventListener('touchstart', pauseAutoScroll, { passive: true });

    container.scrollLeft = 0;
    animationFrame = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrame);
      container.removeEventListener('pointerdown', pauseAutoScroll);
      container.removeEventListener('wheel', pauseAutoScroll);
      container.removeEventListener('touchstart', pauseAutoScroll);
      if (pauseTimeout) clearTimeout(pauseTimeout);
    };
  }, [duplicatesFactor, loopedProperties.length, scrollSpeed]);

  if (!featuredProperties.length) return null;

  return (
    <div className="relative mt-4">
      <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-card to-transparent" aria-hidden />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-card to-transparent" aria-hidden />
      <div
        ref={containerRef}
        className="relative flex items-stretch gap-5 overflow-x-auto px-2 pb-4 pt-2 scroll-smooth scrollbar-hide"
        style={{ WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        role="list"
        aria-label="Propiedades destacadas"
      >
        {loopedProperties.map((property, index) => (
          <FeaturedPropertyCard key={`${property.id}-${index}`} property={property} />
        ))}
      </div>
    </div>
  );
}