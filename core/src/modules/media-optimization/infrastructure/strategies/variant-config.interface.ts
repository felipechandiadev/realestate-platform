import { VariantType, ImageFormat, FitStrategy } from '../../domain/enums';

export interface VariantConfig {
  type: VariantType;
  width: number;
  height?: number;
  fit: FitStrategy;
  formats: ImageFormat[];
  quality: Record<ImageFormat, number>;
}
