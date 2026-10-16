import { VariantType, ImageFormat, FitStrategy } from '../../domain/enums';
import { VariantConfig } from './variant-config.interface';

/**
 * Avatars — square crops for UI chrome (sm) and profile (md).
 */
export const AvatarImageStrategy: VariantConfig[] = [
  {
    type: VariantType.AVATAR_SM,
    width: 64,
    height: 64,
    fit: FitStrategy.COVER,
    formats: [ImageFormat.WEBP, ImageFormat.JPEG],
    quality: { webp: 88, jpeg: 92, png: 92 },
  },
  {
    type: VariantType.AVATAR_MD,
    width: 128,
    height: 128,
    fit: FitStrategy.COVER,
    formats: [ImageFormat.WEBP, ImageFormat.JPEG],
    quality: { webp: 90, jpeg: 95, png: 95 },
  },
];
