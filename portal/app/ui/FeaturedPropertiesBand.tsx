'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import FeaturedPropertyCard, { FeaturedProperty } from './FeaturedPropertyCard';
import { pickImageVariant } from '@/shared/lib/pick-image-variant';

const GAP_CLASS = 'gap-5';
const AUTO_SCROLL_MS = 4500;
const SCROLL_STEP_RATIO = 0.85;

interface PropertyFromAPI {
  id: string;
  title: string;
  description?: string;
  price: number;
  currency?: 'CLP' | 'UF';
  currencyPrice?: 'CLP' | 'UF';
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
  otherFeatures?: string[];
}

const pickBestImageUrl = (property: PropertyFromAPI): string | null => {
  const mediaItems = property.multimedia || [];
  const imageMedia =
    mediaItems.find((item) => (item.type || '').toUpperCase() === 'PROPERTY_IMG') ||
    mediaItems.find((item) => (item.format || '').toUpperCase() === 'IMG') ||
    mediaItems[0];

  if (!imageMedia) {
    return property.mainImageUrl ?? null;
  }

  return (
    pickImageVariant(imageMedia, 'card', imageMedia.url || property.mainImageUrl) ??
    property.mainImageUrl ??
    null
  );
};

const mapToFeaturedProperty = (property: PropertyFromAPI): FeaturedProperty => ({
  id: property.id,
  title: property.title,
  description: property.description ?? null,
  price: property.price,
  currencyPrice: property.currencyPrice ?? property.currency ?? 'CLP',
  operationType: property.operationType === 'SALE' ? 'SALE' : 'RENT',
  mainImageUrl: pickBestImageUrl(property),
  city: property.city ?? null,
  state: property.state ?? null,
  bedrooms: property.bedrooms ?? null,
  bathrooms: property.bathrooms ?? null,
  builtSquareMeters: property.builtSquareMeters ?? null,
  otherFeatures: Array.isArray(property.otherFeatures) ? property.otherFeatures : [],
  isFeatured: true,
});

interface FeaturedPropertiesBandProps {
  properties: PropertyFromAPI[];
  /** @deprecated kept for call-site compat; native scroll replaces px/s marquee */
  scrollSpeed?: number;
}

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setReduced(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  return reduced;
}

export default function FeaturedPropertiesBand({
  properties,
}: FeaturedPropertiesBandProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const featuredProperties = useMemo(
    () => properties.map(mapToFeaturedProperty),
    [properties],
  );
  const prefersReducedMotion = usePrefersReducedMotion();
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (prefersReducedMotion || paused || featuredProperties.length < 2) return;
    const scroller = scrollerRef.current;
    if (!scroller) return;

    const id = window.setInterval(() => {
      const el = scrollerRef.current;
      if (!el) return;
      const maxScroll = el.scrollWidth - el.clientWidth;
      if (maxScroll <= 0) return;
      const step = Math.max(el.clientWidth * SCROLL_STEP_RATIO, 240);
      const next = el.scrollLeft + step;
      if (next >= maxScroll - 8) {
        el.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        el.scrollBy({ left: step, behavior: 'smooth' });
      }
    }, AUTO_SCROLL_MS);

    return () => window.clearInterval(id);
  }, [featuredProperties.length, paused, prefersReducedMotion]);

  if (!featuredProperties.length) return null;

  return (
    <section
      className="relative mt-4 w-full bg-card py-3"
      role="region"
      aria-label="Propiedades destacadas"
      aria-roledescription="carrusel"
      data-test-id="featured-properties-band"
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
          setPaused(false);
        }
      }}
    >
      <div
        className="pointer-events-none absolute inset-y-0 left-0 z-10 w-8 bg-gradient-to-r from-card to-transparent sm:w-12 md:w-16"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-y-0 right-0 z-10 w-8 bg-gradient-to-l from-card to-transparent sm:w-12 md:w-16"
        aria-hidden
      />

      <div
        ref={scrollerRef}
        className={`flex ${GAP_CLASS} overflow-x-auto scroll-smooth px-3 pb-2 [scrollbar-width:thin] snap-x snap-mandatory`}
        data-test-id="featured-properties-track"
        onPointerDown={() => setPaused(true)}
        onWheel={() => setPaused(true)}
        onTouchStart={() => setPaused(true)}
      >
        {featuredProperties.map((property, index) => (
          <div key={property.id} className="snap-start shrink-0">
            <FeaturedPropertyCard
              property={property}
              priorityImage={index < 4}
            />
          </div>
        ))}
      </div>

      <p className="absolute h-px w-px overflow-hidden whitespace-nowrap p-0 [clip:rect(0,0,0,0)]">
        Desplaza horizontalmente para ver más propiedades destacadas.
      </p>
    </section>
  );
}
