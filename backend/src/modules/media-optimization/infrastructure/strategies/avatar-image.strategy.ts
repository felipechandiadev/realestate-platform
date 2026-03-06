import { VariantType, ImageFormat, FitStrategy } from '../../domain/enums';
import { VariantConfig } from './variant-config.interface';

/**
 * Estrategia de optimización para avatares
 * - Siempre cuadrados
 * - Mayor calidad (rostros requieren detalle)
 * - Crop desde el centro
 */
export const AvatarImageStrategy: VariantConfig[] = [
  {
    type: VariantType.AVATAR_SM,
    width: 64,
    height: 64,
    fit: FitStrategy.COVER,
    formats: [ImageFormat.WEBP, ImageFormat.JPEG],
    quality: { webp: 90, jpeg: 95, png: 95 },
  },
  {
    type: VariantType.AVATAR_MD,
    width: 128,
    height: 128,
    fit: FitStrategy.COVER,
    formats: [ImageFormat.WEBP, ImageFormat.JPEG],
    quality: { webp: 90, jpeg: 95, png: 95 },
  },
  {
    type: VariantType.AVATAR_LG,
    width: 256,
    height: 256,
    fit: FitStrategy.COVER,
    formats: [ImageFormat.WEBP, ImageFormat.JPEG],
    quality: { webp: 90, jpeg: 95, png: 95 },
  },
];
