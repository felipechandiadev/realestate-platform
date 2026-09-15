'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import FeaturedPropertyCard, { FeaturedProperty } from './FeaturedPropertyCard';

const DEFAULT_SPEED_PX_PER_SEC = 30;
const GAP_CLASS = 'gap-5'; // 1.25rem = 20px — must match set measurement

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
}

const normalizeVariantType = (value?: string) =>
  (value || '').trim().toLowerCase().replace(/-/g, '_');

const pickBestImageUrl = (property: PropertyFromAPI): string | null => {
  const mediaItems = property.multimedia || [];
  const imageMedia =
    mediaItems.find((item) => (item.type || '').toUpperCase() === 'PROPERTY_IMG') ||
    mediaItems.find((item) => (item.format || '').toUpperCase() === 'IMG') ||
    mediaItems[0];

  if (!imageMedia) {
    return property.mainImageUrl ?? null;
  }

  const variants = imageMedia.variants || [];
  const preferredTypes = ['thumbnail_md', 'thumbnail_lg', 'thumbnail_sm', 'full', 'og_image'];

  for (const preferredType of preferredTypes) {
    const webp = variants.find(
      (variant) =>
        normalizeVariantType(variant.variantType) === preferredType && variant.format === 'webp',
    );
    if (webp?.url) return webp.url;

    const jpeg = variants.find(
      (variant) =>
        normalizeVariantType(variant.variantType) === preferredType && variant.format === 'jpeg',
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
  currencyPrice: property.currencyPrice ?? property.currency ?? 'CLP',
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
  /** Pixels per second */
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
  scrollSpeed = DEFAULT_SPEED_PX_PER_SEC,
}: FeaturedPropertiesBandProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const setARef = useRef<HTMLDivElement>(null);

  const featuredProperties = useMemo(
    () => properties.map(mapToFeaturedProperty),
    [properties],
  );

  const prefersReducedMotion = usePrefersReducedMotion();
  const [hovered, setHovered] = useState(false);
  const [tabHidden, setTabHidden] = useState(false);
  const [setWidth, setSetWidth] = useState(0);

  const offsetRef = useRef(0);
  const lastTimeRef = useRef<number | null>(null);
  const setWidthRef = useRef(0);
  const pausedRef = useRef(false);
  const animatingRef = useRef(false);

  useEffect(() => {
    const onVisibility = () => setTabHidden(document.hidden);
    onVisibility();
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);

  useEffect(() => {
    pausedRef.current = prefersReducedMotion || hovered || tabHidden;
    if (pausedRef.current) {
      lastTimeRef.current = null;
      if (trackRef.current) {
        trackRef.current.style.willChange = 'auto';
      }
    } else if (trackRef.current && !prefersReducedMotion) {
      trackRef.current.style.willChange = 'transform';
    }
  }, [hovered, tabHidden, prefersReducedMotion]);

  useEffect(() => {
    const setA = setARef.current;
    if (!setA || !featuredProperties.length) return;

    const measure = () => {
      const setB = setA.nextElementSibling as HTMLElement | null;
      // Distance from start of set A to start of set B (= setA width + track gap)
      const width = setB
        ? setB.offsetLeft - setA.offsetLeft
        : setA.getBoundingClientRect().width;
      if (width > 0) {
        setWidthRef.current = width;
        setSetWidth(width);
        if (offsetRef.current >= width) {
          offsetRef.current = offsetRef.current % width;
          if (trackRef.current) {
            trackRef.current.style.transform = `translate3d(${-offsetRef.current}px, 0, 0)`;
          }
        }
      }
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(setA);
    const track = trackRef.current;
    if (track) ro.observe(track);
    return () => ro.disconnect();
  }, [featuredProperties]);

  useEffect(() => {
    if (prefersReducedMotion || !featuredProperties.length) return;

    let frameId = 0;
    animatingRef.current = true;

    const tick = (timestamp: number) => {
      if (!animatingRef.current) return;

      const track = trackRef.current;
      const width = setWidthRef.current;

      if (!track || width <= 0) {
        frameId = requestAnimationFrame(tick);
        return;
      }

      if (pausedRef.current) {
        lastTimeRef.current = null;
        frameId = requestAnimationFrame(tick);
        return;
      }

      if (lastTimeRef.current === null) {
        lastTimeRef.current = timestamp;
      }

      const delta = timestamp - lastTimeRef.current;
      lastTimeRef.current = timestamp;
      // Cap delta to avoid huge jumps after long pauses / background tabs
      const cappedDelta = Math.min(delta, 64);
      offsetRef.current += (scrollSpeed * cappedDelta) / 1000;

      if (offsetRef.current >= width) {
        offsetRef.current -= width;
      }

      track.style.transform = `translate3d(${-offsetRef.current}px, 0, 0)`;
      frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);

    return () => {
      animatingRef.current = false;
      cancelAnimationFrame(frameId);
      lastTimeRef.current = null;
    };
  }, [featuredProperties.length, prefersReducedMotion, scrollSpeed]);

  if (!featuredProperties.length) return null;

  const renderSet = (inertClone: boolean) =>
    featuredProperties.map((property, index) => (
      <FeaturedPropertyCard
        key={`${inertClone ? 'b' : 'a'}-${property.id}`}
        property={property}
        inertClone={inertClone}
        priorityImage={!inertClone && index < 4}
      />
    ));

  return (
    <section
      className="relative mt-4 w-full bg-card py-3"
      role="region"
      aria-label="Propiedades destacadas"
      aria-roledescription={prefersReducedMotion ? undefined : 'carrusel'}
      data-test-id="featured-properties-band"
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
    >
      <div
        className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-card to-transparent sm:w-16 md:w-24 lg:w-32"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-card to-transparent sm:w-16 md:w-24 lg:w-32"
        aria-hidden
      />

      <div ref={viewportRef} className="relative overflow-x-hidden overflow-y-visible px-2">
        {prefersReducedMotion ? (
          <div className={`flex ${GAP_CLASS} overflow-x-auto pb-2`} data-test-id="featured-properties-static">
            {renderSet(false)}
          </div>
        ) : (
          <div
            ref={trackRef}
            className={`flex w-max ${GAP_CLASS}`}
            style={{ transform: 'translate3d(0, 0, 0)' }}
            data-test-id="featured-properties-track"
          >
            <div ref={setARef} className={`flex ${GAP_CLASS}`} data-marquee-set="a">
              {renderSet(false)}
            </div>
            {/* Gap between sets equals flex gap on parent track via margin — track is flex with gap-5 between setA and setB */}
            <div className={`flex ${GAP_CLASS}`} data-marquee-set="b" aria-hidden="true">
              {renderSet(true)}
            </div>
          </div>
        )}
      </div>

      {/* Screen-reader hint for animated band */}
      {!prefersReducedMotion && setWidth > 0 ? (
        <p className="absolute h-px w-px overflow-hidden whitespace-nowrap p-0 [clip:rect(0,0,0,0)]">
          El listado se desplaza automáticamente. Pasa el cursor por encima para pausarlo.
        </p>
      ) : null}
    </section>
  );
}
