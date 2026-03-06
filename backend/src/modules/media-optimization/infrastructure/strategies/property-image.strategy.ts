import { VariantType, ImageFormat, FitStrategy } from '../../domain/enums';
import { VariantConfig } from './variant-config.interface';

/**
 * Estrategia de optimización para imágenes de propiedades
 * - Thumbnails para cards (SM, MD, LG)
 * - Full para vista de galería
 * - Crop inteligente desde el centro (cover)
 */
export const PropertyImageStrategy: VariantConfig[] = [
  {
    type: VariantType.THUMBNAIL_SM,
    width: 320,
    height: 240,
    fit: FitStrategy.COVER,
    formats: [ImageFormat.WEBP, ImageFormat.JPEG],
    quality: { webp: 85, jpeg: 90, png: 90 },
  },
  {
    type: VariantType.THUMBNAIL_MD,
    width: 640,
    height: 480,
    fit: FitStrategy.COVER,
    formats: [ImageFormat.WEBP, ImageFormat.JPEG],
    quality: { webp: 85, jpeg: 90, png: 90 },
  },
  {
    type: VariantType.THUMBNAIL_LG,
    width: 1280,
    height: 720,
    fit: FitStrategy.COVER,
    formats: [ImageFormat.WEBP, ImageFormat.JPEG],
    quality: { webp: 85, jpeg: 90, png: 90 },
  },
  {
    type: VariantType.FULL,
    width: 2048,
    height: undefined,
    fit: FitStrategy.INSIDE,
    formats: [ImageFormat.WEBP, ImageFormat.JPEG],
    quality: { webp: 85, jpeg: 90, png: 90 },
  },
];
