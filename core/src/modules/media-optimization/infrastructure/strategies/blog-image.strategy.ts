import { VariantType, ImageFormat, FitStrategy } from '../../domain/enums';
import { VariantConfig } from './variant-config.interface';

/**
 * Estrategia de optimización para imágenes de blog (SIMPLIFICADA)
 * - Thumbnail para listados
 * - OG Image para redes sociales y preview
 */
export const BlogImageStrategy: VariantConfig[] = [
  {
    type: VariantType.THUMBNAIL_MD,
    width: 640,
    height: 360, // 16:9 ratio
    fit: FitStrategy.COVER,
    formats: [ImageFormat.WEBP, ImageFormat.JPEG],
    quality: { webp: 80, jpeg: 85, png: 85 },
  },
  {
    type: VariantType.OG_IMAGE,
    width: 1200,
    height: 630, // Open Graph standard
    fit: FitStrategy.COVER,
    formats: [ImageFormat.WEBP, ImageFormat.JPEG],
    quality: { webp: 80, jpeg: 85, png: 85 },
  },
];
