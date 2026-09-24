import { VariantType, ImageFormat, FitStrategy } from '../../domain/enums';
import { VariantConfig } from './variant-config.interface';

/**
 * Estrategia de optimización para avatares
 * - Único tamaño: 128x128 (optimizado para perfil)
 * - Siempre cuadrado 1:1
 * - Mayor calidad (rostros requieren detalle)
 * - Crop desde el centro
 */
export const AvatarImageStrategy: VariantConfig[] = [
  {
    type: VariantType.AVATAR_MD,
    width: 128,
    height: 128,
    fit: FitStrategy.COVER,
    formats: [ImageFormat.WEBP, ImageFormat.JPEG],
    quality: { webp: 90, jpeg: 95, png: 95 },
  },
];
