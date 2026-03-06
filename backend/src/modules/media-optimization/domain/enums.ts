export enum FitStrategy {
  COVER = 'cover',     // Crop inteligente desde el centro
  CONTAIN = 'contain', // Letterbox (espacios en blanco)
  INSIDE = 'inside',   // Mantener aspect ratio completo
}

export { VariantType, ImageFormat } from './multimedia-variant.entity';
