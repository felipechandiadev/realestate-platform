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

/**
 * Imagen ya decodificada, orientada y reducida, lista para generar variantes
 * sin volver a decodificar el original.
 */
export interface PreparedSource {
  data: Buffer;
  info: sharp.OutputInfo;
}

@Injectable()
export class SharpProcessorService {
  /**
   * Decodifica el original una sola vez: aplica la orientación EXIF (fotos de
   * celular) y lo reduce al mínimo que necesitan las variantes, sin agrandarlo.
   */
  async prepareSource(
    buffer: Buffer,
    configs: VariantConfig[],
  ): Promise<PreparedSource> {
    const maxWidth = Math.max(...configs.map((c) => c.width));
    const maxHeight = Math.max(...configs.map((c) => c.height ?? c.width));

    const { data, info } = await sharp(buffer)
      .rotate()
      // 'outside': ambos lados quedan >= al máximo pedido, así un recorte 'cover' no pierde resolución.
      .resize(maxWidth, maxHeight, { fit: 'outside', withoutEnlargement: true })
      .raw()
      .toBuffer({ resolveWithObject: true });

    return { data, info };
  }

  /**
   * Genera una variante desde la imagen preparada.
   */
  async processVariant(
    source: PreparedSource,
    config: VariantConfig,
    format: ImageFormat,
  ): Promise<ProcessedImage> {
    let pipeline = sharp(source.data, {
      raw: {
        width: source.info.width,
        height: source.info.height,
        channels: source.info.channels,
      },
    }).resize(config.width, config.height, {
      fit: this.mapFitStrategy(config.fit),
      position: 'center',
      // 'inside' muestra la foto completa: nunca se estira una imagen pequeña.
      withoutEnlargement: config.fit === FitStrategy.INSIDE,
    });

    switch (format) {
      case ImageFormat.WEBP:
        pipeline = pipeline.webp({ quality: config.quality.webp, effort: 4 });
        break;
      case ImageFormat.JPEG:
        pipeline = pipeline.flatten({ background: '#ffffff' }).jpeg({
          quality: config.quality.jpeg,
          mozjpeg: true,
        });
        break;
      case ImageFormat.PNG:
        pipeline = pipeline.png({
          quality: config.quality.png,
          compressionLevel: 9,
        });
        break;
    }

    const { data, info } = await pipeline.toBuffer({ resolveWithObject: true });

    return {
      buffer: data,
      size: data.length,
      width: info.width,
      height: info.height,
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
      width: processedMetadata.width,
      height: processedMetadata.height,
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
