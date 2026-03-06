import { VariantType, ImageFormat, FitStrategy } from '../../domain/enums';
import { VariantConfig } from './variant-config.interface';

/**
 * Estrategia de optimización para imágenes de testimonios
 * - Avatar del cliente
 * - Thumbnail de proyecto (opcional)
 */
export const TestimonialImageStrategy: VariantConfig[] = [
  {
    type: VariantType.AVATAR_SM,
    width: 80,
    height: 80,
    fit: FitStrategy.COVER,
    formats: [ImageFormat.WEBP, ImageFormat.JPEG],
    quality: { webp: 85, jpeg: 90, png: 90 },
  },
  {
    type: VariantType.AVATAR_MD,
    width: 160,
    height: 160,
    fit: FitStrategy.COVER,
    formats: [ImageFormat.WEBP, ImageFormat.JPEG],
    quality: { webp: 85, jpeg: 90, png: 90 },
  },
  {
    type: VariantType.PROJECT_THUMB,
    width: 400,
    height: 300,
    fit: FitStrategy.COVER,
    formats: [ImageFormat.WEBP, ImageFormat.JPEG],
    quality: { webp: 85, jpeg: 90, png: 90 },
  },
];
