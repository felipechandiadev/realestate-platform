import { VariantType, ImageFormat, FitStrategy } from '../../domain/enums';
import { VariantConfig } from './variant-config.interface';

/**
 * Estrategia de optimización para imágenes de slider (SIMPLIFICADA)
 * - Desktop - Full para slider
 * - Thumbnail para admin panel
 */
export const SliderImageStrategy: VariantConfig[] = [
  {
    type: VariantType.SLIDE_DESKTOP,
    width: 1920,
    height: 1080,
    fit: FitStrategy.COVER,
    formats: [ImageFormat.WEBP, ImageFormat.JPEG],
    quality: { webp: 80, jpeg: 85, png: 85 },
  },
  {
    type: VariantType.SLIDE_THUMBNAIL,
    width: 400,
    height: 225,
    fit: FitStrategy.COVER,
    formats: [ImageFormat.WEBP, ImageFormat.JPEG],
    quality: { webp: 80, jpeg: 85, png: 85 },
  },
];
