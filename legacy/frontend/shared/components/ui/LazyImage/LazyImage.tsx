/**
 * LazyImage Component
 * 
 * Componente de imagen lazy-loading que utiliza variantes optimizadas
 * generadas por ImageOptimizationService en el backend.
 * 
 * Soporta:
 * - Responsividad con srcSet
 * - WebP como formato principal (con JPEG fallback)
 * - Lazy loading nativo
 * - Image placeholder dinamico
 * - Fallback a imagen original si variantes no disponibles
 */

'use client';

import React, { ImgHTMLAttributes } from 'react';
import Image from 'next/image';

export interface MultimediaVariant {
  id?: string;
  variantType: string;
  format: 'webp' | 'jpeg' | 'png';
  width: number;
  height: number;
  size: number;
  url: string;
  r2Key?: string;
}

export interface MultimediaWithVariants {
  id: string;
  url: string;
  width?: number;
  height?: number;
  filename: string;
  variants?: MultimediaVariant[];
}

interface LazyImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'srcSet' | 'sizes'> {
  /**
   * Multimedia object con variantes. Si no tiene variantes, usa la URL original
   */
  multimedia: MultimediaWithVariants;

  /**
   * Tipo de uso para determinar cuál variante usar por defecto
   * @default 'thumbnail-md'
   */
  variantType?: 'thumbnail-sm' | 'thumbnail-md' | 'thumbnail-lg' | 'full' | 'og-image' | 'avatar-sm' | 'avatar-md' | 'avatar-lg' | 'slide-mobile' | 'slide-desktop' | 'slide-thumb';

  /**
   * Ancho de la imagen en px para cálculo de aspect ratio
   */
  width?: number;

  /**
   * Alto de la imagen en px para cálculo de aspect ratio
   */
  height?: number;

  /**
   * CSS media queries para determinar tamaño de imagen
   * @default '(max-width: 768px) 320px, (max-width: 1024px) 640px, 1280px'
   */
  sizes?: string;

  /**
   * Usar Next.js Image component (mejor optimización pero requiere conocer dimensiones)
   * @default false
   */
  useNextImage?: boolean;

  /**
   * Blur placeholder (data URL)
   */
  placeholder?: 'blur' | 'empty';

  /**
   * Contenedor CSS para wrapper (si se usa con aspecto ratio)
   */
  containerClassName?: string;

  /**
   * Mantener aspect ratio (útil cuando no se conocen las dimensiones exactas)
   */
  maintainAspectRatio?: boolean;
}

/**
 * Obtiene variante WebP o JPEG según disponibilidad
 */
function normalizeVariantType(value: string): string {
  return value.trim().toLowerCase().replace(/-/g, '_');
}

function getVariant(
  multimedia: MultimediaWithVariants,
  type: string,
  format: 'webp' | 'jpeg' = 'webp'
): MultimediaVariant | undefined {
  const normalizedType = normalizeVariantType(type);
  return multimedia.variants?.find(
    (v) => normalizeVariantType(v.variantType) === normalizedType && v.format.toLowerCase() === format
  );
}

/**
 * Construye srcSet para images responsive
 */
function buildSrcSet(multimedia: MultimediaWithVariants): string | undefined {
  if (!multimedia.variants || multimedia.variants.length === 0) {
    return undefined;
  }

  // Obtener todos los tamaños únicos ordenados por width
  const webpVariants = multimedia.variants.filter((v) => v.format === 'webp');

  if (webpVariants.length === 0) {
    return undefined;
  }

  // Crear srcSet con formatos diferentes
  const srcSet = webpVariants
    .sort((a, b) => a.width - b.width)
    .map((v) => `${v.url} ${v.width}w`)
    .join(', ');

  return srcSet;
}

/**
 * Construye srcSetJPEG para navegadores que no soportan WebP
 */
function buildSrcSetJpeg(multimedia: MultimediaWithVariants): string | undefined {
  if (!multimedia.variants || multimedia.variants.length === 0) {
    return undefined;
  }

  const jpegVariants = multimedia.variants.filter((v) => v.format === 'jpeg');

  if (jpegVariants.length === 0) {
    return undefined;
  }

  return jpegVariants
    .sort((a, b) => a.width - b.width)
    .map((v) => `${v.url} ${v.width}w`)
    .join(', ');
}

/**
 * LazyImage Component
 * 
 * @example
 * // Con variantes optimizadas
 * <LazyImage
 *   multimedia={multimedia}
 *   variantType="thumbnail-md"
 *   alt="Property"
 *   sizes="(max-width: 768px) 320px, 640px"
 * />
 * 
 * @example
 * // Imagen sin variantes (fallback a URL original)
 * <LazyImage
 *   multimedia={{ url: 'https://...' }}
 *   alt="Image"
 * />
 */
const LazyImage = React.forwardRef<HTMLImageElement, LazyImageProps>(
  (
    {
      multimedia,
      variantType = 'thumbnail-md',
      alt = 'Image',
      sizes = '(max-width: 768px) 320px, (max-width: 1024px) 640px, 1280px',
      useNextImage = false,
      placeholder = 'empty',
      containerClassName = '',
      maintainAspectRatio = false,
      width: propWidth,
      height: propHeight,
      className = '',
      loading = 'lazy',
      ...props
    },
    ref
  ) => {
    // Obtener variante principal
    const primaryVariant = getVariant(multimedia, variantType, 'webp');
    const fallbackVariant = getVariant(multimedia, variantType, 'jpeg');
    const firstWebpVariant = multimedia.variants?.find((v) => v.format === 'webp');
    const firstJpegVariant = multimedia.variants?.find((v) => v.format === 'jpeg');

    // URL principal (variante o original)
    const src =
      primaryVariant?.url ||
      fallbackVariant?.url ||
      firstWebpVariant?.url ||
      firstJpegVariant?.url ||
      multimedia.url;

    // Dimensiones
    const displayWidth =
      propWidth || primaryVariant?.width || fallbackVariant?.width || firstWebpVariant?.width || multimedia.width || 640;
    const displayHeight =
      propHeight || primaryVariant?.height || fallbackVariant?.height || firstWebpVariant?.height || multimedia.height || 480;

    // Aspect ratio para mantener proporciones
    const aspectRatio = displayHeight && displayWidth ? displayHeight / displayWidth : undefined;

    // Si se usa Next.js Image
    if (useNextImage && displayWidth && displayHeight) {
      return (
        <Image
          ref={ref as any}
          src={src}
          alt={alt}
          width={displayWidth}
          height={displayHeight}
          sizes={sizes}
          loading={loading as any}
          placeholder={placeholder}
          className={className}
          {...props}
        />
      );
    }

    // Usar img nativa con picture para soporte WebP + JPEG
    const srcSetWebp = buildSrcSet(multimedia);
    const srcSetJpeg = buildSrcSetJpeg(multimedia);

    return (
      <div
        className={containerClassName}
        style={
          maintainAspectRatio && aspectRatio
            ? {
                position: 'relative',
                width: '100%',
                paddingBottom: `${aspectRatio * 100}%`,
                overflow: 'hidden',
              }
            : undefined
        }
      >
        <picture>
          {/* WebP para navegadores modernos */}
          {srcSetWebp && (
            <source srcSet={srcSetWebp} type="image/webp" sizes={sizes} />
          )}

          {/* JPEG fallback */}
          {srcSetJpeg && (
            <source srcSet={srcSetJpeg} type="image/jpeg" sizes={sizes} />
          )}

          {/* img nativa */}
          <img
            ref={ref}
            src={src}
            alt={alt}
            sizes={sizes}
            loading={loading === 'lazy' ? 'lazy' : 'eager'}
            className={className}
            width={maintainAspectRatio ? '100%' : displayWidth}
            height={maintainAspectRatio ? 'auto' : displayHeight}
            style={
              maintainAspectRatio
                ? {
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }
                : {}
            }
            {...props}
          />
        </picture>
      </div>
    );
  }
);

LazyImage.displayName = 'LazyImage';

export default LazyImage;
