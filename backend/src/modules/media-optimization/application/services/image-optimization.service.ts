import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuid } from 'uuid';
import { SharpProcessorService } from './sharp-processor.service';
import { R2StorageService } from './r2-storage.service';
import { Multimedia } from '../../../multimedia/domain/multimedia.entity';
import { MultimediaVariant } from '../../domain/multimedia-variant.entity';
import { VariantConfig } from '../../infrastructure/strategies';
import {
  PropertyImageStrategy,
  BlogImageStrategy,
  AvatarImageStrategy,
  SliderImageStrategy,
  TestimonialImageStrategy,
} from '../../infrastructure/strategies';
import { ImageFormat } from '../../domain/enums';

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

  /**
   * Procesa y optimiza una imagen, generando todas las variantes necesarias
   * @param file Archivo Multer
   * @param entityType Tipo de entidad (property, blog, etc)
   * @param entityId ID de la entidad
   * @returns Multimedia con variantes creadas
   */
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

    // 1. Obtener metadata original
    const metadata = await this.sharpProcessor.getMetadata(file.buffer);

    // 2. Comprimir original
    const compressedOriginal = await this.sharpProcessor.compressOriginal(
      file.buffer,
      90,
    );

    // 3. Upload original comprimida
    const originalKey = `${entityType}/${entityId}/${imageId}_original.jpg`;
    const { url: originalUrl } = await this.r2Storage.upload(
      compressedOriginal.buffer,
      originalKey,
      'image/jpeg',
    );

    // 4. Generar todas las variantes
    const variants: Partial<MultimediaVariant>[] = [];
    let totalVariantSize = 0;

    for (const config of strategy) {
      for (const format of config.formats) {
        try {
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
            `  ❌ Failed to create ${config.type}.${format}: ${error.message}`,
          );
        }
      }
    }

    // 5. Calcular estadísticas
    const originalSize = file.size;
    const compressedSize = compressedOriginal.size;
    const compressionRatio =
      ((originalSize - compressedSize) / originalSize) * 100;
    const totalSizeSaved = originalSize - compressedSize;

    // 6. Crear registro de Multimedia (esto será manejado por el módulo multimedia existente)
    // Por ahora solo retornamos la información
    const processingTime = Date.now() - startTime;

    this.logger.log(
      `✅ Image processed in ${processingTime}ms - Compression: ${compressionRatio.toFixed(1)}% - Variants: ${variants.length}`,
    );

    return {
      multimedia: {
        url: originalUrl,
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
