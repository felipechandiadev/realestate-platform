import { Injectable } from '@nestjs/common';
import sharp from 'sharp';
import { VariantConfig } from '../../infrastructure/strategies';
import { ImageFormat, FitStrategy } from '../../domain/enums';

export interface ProcessedImage {
  buffer: Buffer;
  size: number;
  width: number;
  height: number;
}

@Injectable()
export class SharpProcessorService {
  /**
   * Procesa una variante de imagen según la configuración
   * @param buffer Buffer de la imagen original
   * @param config Configuración de la variante
   * @param format Formato de salida (webp, jpeg, png)
   * @returns Imagen procesada con metadata
   */
  async processVariant(
    buffer: Buffer,
    config: VariantConfig,
    format: ImageFormat,
  ): Promise<ProcessedImage> {
    let pipeline = sharp(buffer);

    // Resize según estrategia de fit
    pipeline = pipeline.resize(config.width, config.height, {
      fit: this.mapFitStrategy(config.fit),
      position: 'center', // Crop desde el centro para cover
      withoutEnlargement: true, // No agrandar imágenes pequeñas
    });

    // Aplicar formato y compresión
    switch (format) {
      case ImageFormat.WEBP:
        pipeline = pipeline.webp({
          quality: config.quality.webp,
          effort: 6, // Balance entre velocidad y compresión (0-6)
        });
        break;
      case ImageFormat.JPEG:
        pipeline = pipeline.jpeg({
          quality: config.quality.jpeg,
          mozjpeg: true, // Mejor compresión
        });
        break;
      case ImageFormat.PNG:
        pipeline = pipeline.png({
          quality: config.quality.png,
          compressionLevel: 9,
        });
        break;
    }

    const processedBuffer = await pipeline.toBuffer();
    const metadata = await sharp(processedBuffer).metadata();

    return {
      buffer: processedBuffer,
      size: processedBuffer.length,
      width: metadata.width!,
      height: metadata.height!,
    };
  }

  /**
   * Obtiene metadata de una imagen sin procesarla
   * @param buffer Buffer de la imagen
   * @returns Metadata de la imagen (width, height, format, etc)
   */
  async getMetadata(buffer: Buffer) {
    return sharp(buffer).metadata();
  }

  /**
   * Comprime imagen original sin cambiar dimensiones
   * @param buffer Buffer de la imagen
   * @param quality Calidad de compresión (80-95)
   * @returns Imagen comprimida
   */
  async compressOriginal(
    buffer: Buffer,
    quality: number = 90,
  ): Promise<ProcessedImage> {
    const metadata = await sharp(buffer).metadata();

    let pipeline = sharp(buffer);

    // Mantener dimensiones originales
    pipeline = pipeline.resize(metadata.width, metadata.height, {
      fit: 'inside',
      withoutEnlargement: true,
    });

    // Comprimir según formato original
    if (
      metadata.format === 'jpeg' ||
      metadata.format === 'jpg' ||
      !metadata.format
    ) {
      pipeline = pipeline.jpeg({ quality, mozjpeg: true });
    } else if (metadata.format === 'png') {
      pipeline = pipeline.png({ quality, compressionLevel: 9 });
    } else if (metadata.format === 'webp') {
      pipeline = pipeline.webp({ quality });
    }

    const processedBuffer = await pipeline.toBuffer();
    const processedMetadata = await sharp(processedBuffer).metadata();

    return {
      buffer: processedBuffer,
      size: processedBuffer.length,
      width: processedMetadata.width!,
      height: processedMetadata.height!,
    };
  }

  /**
   * Mapea FitStrategy a sharp fit string
   */
  private mapFitStrategy(fit: FitStrategy): keyof sharp.FitEnum {
    const map: Record<FitStrategy, keyof sharp.FitEnum> = {
      [FitStrategy.COVER]: 'cover',
      [FitStrategy.CONTAIN]: 'contain',
      [FitStrategy.INSIDE]: 'inside',
    };
    return map[fit];
  }
}
