import { VariantType, ImageFormat, FitStrategy } from '../../domain/enums';
import { VariantConfig } from './variant-config.interface';

/**
 * Estrategia de optimización para imágenes de slider
 * - Variantes responsive (mobile, tablet, desktop)
 * - Thumbnail para admin panel
 */
export const SliderImageStrategy: VariantConfig[] = [
  {
    type: VariantType.SLIDE_MOBILE,
    width: 768,
    height: 432,
    fit: FitStrategy.COVER,
    formats: [ImageFormat.WEBP, ImageFormat.JPEG],
    quality: { webp: 85, jpeg: 90, png: 90 },
  },
  {
    type: VariantType.SLIDE_TABLET,
    width: 1024,
    height: 576,
    fit: FitStrategy.COVER,
    formats: [ImageFormat.WEBP, ImageFormat.JPEG],
    quality: { webp: 85, jpeg: 90, png: 90 },
  },
  {
    type: VariantType.SLIDE_DESKTOP,
    width: 1920,
    height: 1080,
    fit: FitStrategy.COVER,
    formats: [ImageFormat.WEBP, ImageFormat.JPEG],
    quality: { webp: 85, jpeg: 90, png: 90 },
  },
  {
    type: VariantType.SLIDE_THUMBNAIL,
    width: 400,
    height: 225,
    fit: FitStrategy.COVER,
    formats: [ImageFormat.WEBP, ImageFormat.JPEG],
    quality: { webp: 80, jpeg: 85, png: 90 },
  },
];
