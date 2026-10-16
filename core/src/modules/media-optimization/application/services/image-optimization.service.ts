import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuid } from 'uuid';
import { SharpProcessorService } from './sharp-processor.service';
import { R2StorageService } from './r2-storage.service';
import { Multimedia } from '../../../multimedia/domain/multimedia.entity';
import { MultimediaVariant, VariantType, ImageFormat } from '../../domain/multimedia-variant.entity';
import { VariantConfig } from '../../infrastructure/strategies';
import {
  PropertyImageStrategy,
  BlogImageStrategy,
  AvatarImageStrategy,
  SliderImageStrategy,
  TestimonialImageStrategy,
} from '../../infrastructure/strategies';

export type EntityType =
  | 'property'
  | 'blog'
  | 'avatar'
  | 'slider'
  | 'testimonial';

export interface OptimizationResult {
  multimedia: Multimedia;
  compressionRatio: number;
  variantsCreated: number;
  totalSizeSaved: number;
  variants: Partial<MultimediaVariant>[];
}

@Injectable()
export class ImageOptimizationService {
  private readonly logger = new Logger(ImageOptimizationService.name);

  constructor(
    private sharpProcessor: SharpProcessorService,
    private r2Storage: R2StorageService,
    @InjectRepository(Multimedia)
    private multimediaRepository: Repository<Multimedia>,
    @InjectRepository(MultimediaVariant)
    private variantRepository: Repository<MultimediaVariant>,
  ) {}

  async processAndUpload(
    file: Express.Multer.File,
    entityType: EntityType,
    entityId: string,
  ): Promise<OptimizationResult> {
    const imageId = uuid();
    const strategy = this.getStrategy(entityType);
    const startTime = Date.now();

    this.logger.log(
      `🎨 Processing image for ${entityType}:${entityId} - Size: ${(file.size / 1024).toFixed(2)}KB`,
    );

    try {
      // 1. Obtener metadata original
      const metadata = await this.sharpProcessor.getMetadata(file.buffer);

      // 2. Generar todas las variantes (SIN almacenar original)
      const variants: Partial<MultimediaVariant>[] = [];
      let totalVariantSize = 0;
      const primaryVariantPreference = this.getPrimaryVariantPreference(entityType);

      for (const config of strategy) {
        for (const format of config.formats) {
          try {
            this.logger.debug(`⏳ Creating ${config.type}.${format}...`);
            const processed = await this.sharpProcessor.processVariant(
              file.buffer,
              config,
              format,
            );

            const key = `${entityType}/${entityId}/${imageId}_${config.type}.${format}`;
            const { url } = await this.r2Storage.upload(
              processed.buffer,
              key,
              `image/${format}`,
            );

            variants.push({
              variantType: config.type,
              format,
              width: processed.width,
              height: processed.height,
              size: processed.size,
              url,
              r2Key: key,
            });

            totalVariantSize += processed.size;

            this.logger.debug(
              `  ✅ Created ${config.type}.${format} - ${processed.width}x${processed.height} - ${(processed.size / 1024).toFixed(2)}KB`,
            );
          } catch (error) {
            this.logger.error(
              `  ❌ Failed to create ${config.type}.${format}: ${error?.message || String(error)}`,
            );
            // Continuar con las demás variantes incluso si una falla
          }
        }
      }

      if (variants.length === 0) {
        this.logger.warn(`⚠️ No variants were created`);
        throw new Error('No variants were successfully created');
      }

      const fullVariantUrl = this.resolvePrimaryUrl(variants, primaryVariantPreference);
      if (!fullVariantUrl) {
        throw new Error('No primary URL could be resolved from variants');
      }

      // 3. Calcular estadísticas (sin original almacenado)
      const originalSize = file.size;
      const compressedSize = totalVariantSize;
      const compressionRatio =
        ((originalSize - compressedSize) / originalSize) * 100;
      const totalSizeSaved = originalSize - compressedSize;

      const processingTime = Date.now() - startTime;

      this.logger.log(
        `✅ Image processed in ${processingTime}ms - Only variants stored - Space saved: ${compressionRatio.toFixed(1)}% - Variants: ${variants.length}`,
      );

      return {
        multimedia: {
          url: fullVariantUrl!,
          filename: file.originalname,
          fileSize: compressedSize,
          originalSize,
          compressedSize,
          compressionRatio,
          width: metadata.width || 0,
          height: metadata.height || 0,
        } as Multimedia,
        compressionRatio,
        variantsCreated: variants.length,
        totalSizeSaved,
        variants,
      };
    } catch (error) {
      this.logger.error(`❌ Image processing failed: ${error?.message || String(error)}`);
      throw new Error(`Image optimization failed: ${error?.message || 'Unknown error'}`);
    }
  }

  /**
   * Elimina todas las variantes de una imagen
   * @param multimediaId ID del multimedia
   */
  async deleteVariants(multimediaId: string): Promise<void> {
    const variants = await this.variantRepository.find({
      where: { multimediaId },
    });

    if (variants.length === 0) return;

    const keys = variants.map((v) => v.r2Key);
    await this.r2Storage.deleteMultiple(keys);
    await this.variantRepository.delete({ multimediaId });

    this.logger.log(`🗑️ Deleted ${variants.length} variants for ${multimediaId}`);
  }

  /**
   * Preferred primary URL per entity (largest "default" display asset).
   */
  private getPrimaryVariantPreference(entityType: EntityType): VariantType[] {
    const map: Record<EntityType, VariantType[]> = {
      property: [VariantType.FULL, VariantType.THUMBNAIL_MD, VariantType.THUMBNAIL_SM],
      blog: [VariantType.OG_IMAGE, VariantType.THUMBNAIL_MD, VariantType.HERO],
      avatar: [VariantType.AVATAR_MD, VariantType.AVATAR_SM, VariantType.AVATAR_LG],
      slider: [
        VariantType.SLIDE_DESKTOP,
        VariantType.SLIDE_TABLET,
        VariantType.SLIDE_MOBILE,
        VariantType.SLIDE_THUMBNAIL,
      ],
      testimonial: [VariantType.AVATAR_MD, VariantType.AVATAR_SM, VariantType.PROJECT_THUMB],
    };
    return map[entityType] || [VariantType.FULL, VariantType.THUMBNAIL_MD];
  }

  private resolvePrimaryUrl(
    variants: Partial<MultimediaVariant>[],
    preferredTypes: VariantType[],
  ): string | null {
    for (const type of preferredTypes) {
      const webp = variants.find(
        (v) => v.variantType === type && v.format === ImageFormat.WEBP && v.url,
      );
      if (webp?.url) return webp.url;
      const jpeg = variants.find(
        (v) => v.variantType === type && v.format === ImageFormat.JPEG && v.url,
      );
      if (jpeg?.url) return jpeg.url;
    }
    return variants.find((v) => !!v.url)?.url ?? null;
  }

  /**
   * Obtiene la estrategia de optimización según el tipo de entidad
   */
  private getStrategy(entityType: EntityType): VariantConfig[] {
    const strategies: Record<EntityType, VariantConfig[]> = {
      property: PropertyImageStrategy,
      blog: BlogImageStrategy,
      avatar: AvatarImageStrategy,
      slider: SliderImageStrategy,
      testimonial: TestimonialImageStrategy,
    };

    return strategies[entityType] || PropertyImageStrategy;
  }
}
