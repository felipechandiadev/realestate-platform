import { VariantType, ImageFormat, FitStrategy } from '../../domain/enums';
import { VariantConfig } from './variant-config.interface';

/**
 * Estrategia de optimización para imágenes de propiedades (SIMPLIFICADA)
 * - Thumbnail para cards (MD) - 640x480
 * - Full para galería - 1280x720 (reducido de 2048 para mejor rendimiento)
 */
export const PropertyImageStrategy: VariantConfig[] = [
  {
    type: VariantType.THUMBNAIL_MD,
    width: 640,
    height: 480,
    fit: FitStrategy.COVER,
    formats: [ImageFormat.WEBP, ImageFormat.JPEG],
    quality: { webp: 80, jpeg: 85, png: 85 },
  },
  {
    type: VariantType.FULL,
    width: 1280,
    height: 720,
    fit: FitStrategy.INSIDE,
    formats: [ImageFormat.WEBP, ImageFormat.JPEG],
    quality: { webp: 80, jpeg: 85, png: 85 },
  },
];
