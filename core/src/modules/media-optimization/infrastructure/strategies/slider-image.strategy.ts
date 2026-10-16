import { VariantType, ImageFormat, FitStrategy } from '../../domain/enums';
import { VariantConfig } from './variant-config.interface';

/**
 * Home slider — mobile vs desktop hero + admin thumb.
 */
export const SliderImageStrategy: VariantConfig[] = [
  {
    type: VariantType.SLIDE_MOBILE,
    width: 1080,
    height: 608,
    fit: FitStrategy.COVER,
    formats: [ImageFormat.WEBP, ImageFormat.JPEG],
    quality: { webp: 78, jpeg: 82, png: 85 },
  },
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
    quality: { webp: 78, jpeg: 82, png: 85 },
  },
];
