import { VariantType, ImageFormat, FitStrategy } from '../../domain/enums';
import { VariantConfig } from './variant-config.interface';

/**
 * Estrategia de optimización para imágenes de blog
 * - Thumbnails para listados
 * - Hero para artículo completo
 * - OG Image para redes sociales (1200x630)
 */
export const BlogImageStrategy: VariantConfig[] = [
  {
    type: VariantType.THUMBNAIL_SM,
    width: 400,
    height: 225, // 16:9 ratio
    fit: FitStrategy.COVER,
    formats: [ImageFormat.WEBP, ImageFormat.JPEG],
    quality: { webp: 80, jpeg: 85, png: 90 },
  },
  {
    type: VariantType.THUMBNAIL_MD,
    width: 800,
    height: 450,
    fit: FitStrategy.COVER,
    formats: [ImageFormat.WEBP, ImageFormat.JPEG],
    quality: { webp: 80, jpeg: 85, png: 90 },
  },
  {
    type: VariantType.OG_IMAGE,
    width: 1200,
    height: 630, // Open Graph standard
    fit: FitStrategy.COVER,
    formats: [ImageFormat.WEBP, ImageFormat.JPEG],
    quality: { webp: 85, jpeg: 90, png: 90 },
  },
  {
    type: VariantType.HERO,
    width: 1920,
    height: 1080,
    fit: FitStrategy.COVER,
    formats: [ImageFormat.WEBP, ImageFormat.JPEG],
    quality: { webp: 85, jpeg: 90, png: 90 },
  },
];
