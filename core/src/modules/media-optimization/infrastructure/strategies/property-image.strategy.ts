import { VariantType, ImageFormat, FitStrategy } from '../../domain/enums';
import { VariantConfig } from './variant-config.interface';

/**
 * Property images — sizes match portal display contexts (16:9).
 * - THUMBNAIL_SM: related cards / small thumbs
 * - THUMBNAIL_MD: listing & featured cards (~CSS 380–480 × DPR)
 * - FULL: gallery / property detail
 */
export const PropertyImageStrategy: VariantConfig[] = [
  {
    type: VariantType.THUMBNAIL_SM,
    width: 400,
    height: 225,
    fit: FitStrategy.COVER,
    formats: [ImageFormat.WEBP, ImageFormat.JPEG],
    quality: { webp: 78, jpeg: 82, png: 85 },
  },
  {
    type: VariantType.THUMBNAIL_MD,
    width: 960,
    height: 540,
    fit: FitStrategy.COVER,
    formats: [ImageFormat.WEBP, ImageFormat.JPEG],
    quality: { webp: 80, jpeg: 85, png: 85 },
  },
  {
    type: VariantType.FULL,
    width: 1600,
    height: 900,
    fit: FitStrategy.INSIDE,
    formats: [ImageFormat.WEBP, ImageFormat.JPEG],
    quality: { webp: 82, jpeg: 85, png: 85 },
  },
];
