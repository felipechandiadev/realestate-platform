import sharp from 'sharp';
import { SharpProcessorService } from './sharp-processor.service';
import { FitStrategy, ImageFormat, VariantType } from '../../domain/enums';
import { VariantConfig } from '../../infrastructure/strategies';
import { PropertyImageStrategy } from '../../infrastructure/strategies';

const quality = { webp: 80, jpeg: 85, png: 85 };

const jpegOf = (width: number, height: number, orientation?: number) => {
  const img = sharp({
    create: {
      width,
      height,
      channels: 3,
      background: { r: 200, g: 50, b: 50 },
    },
  }).jpeg();
  return (orientation ? img.withMetadata({ orientation }) : img).toBuffer();
};

describe('SharpProcessorService', () => {
  const service = new SharpProcessorService();

  it('aplica la orientación EXIF: una foto vertical de celular no queda acostada', async () => {
    // Píxeles guardados en horizontal (4000x3000) + orientación 6 = foto vertical.
    const original = await jpegOf(4000, 3000, 6);
    const full = PropertyImageStrategy.find(
      (c) => c.type === VariantType.FULL,
    )!;

    const source = await service.prepareSource(original, PropertyImageStrategy);
    const variant = await service.processVariant(
      source,
      full,
      ImageFormat.WEBP,
    );

    expect(variant.height).toBeGreaterThan(variant.width);
    expect(variant.height).toBe(900);
  });

  it('no agranda imágenes pequeñas en variantes "inside"', async () => {
    const original = await jpegOf(800, 450);
    const full: VariantConfig = {
      type: VariantType.FULL,
      width: 1600,
      height: 900,
      fit: FitStrategy.INSIDE,
      formats: [ImageFormat.WEBP],
      quality,
    };

    const source = await service.prepareSource(original, [full]);
    const variant = await service.processVariant(
      source,
      full,
      ImageFormat.WEBP,
    );

    expect(variant).toMatchObject({ width: 800, height: 450 });
  });

  it('reduce el original una sola vez sin perder resolución para los recortes "cover"', async () => {
    // Foto vertical: el recorte 960x540 necesita al menos 960 px de ancho.
    const original = await jpegOf(3000, 4000);

    const source = await service.prepareSource(original, PropertyImageStrategy);
    expect(source.info.width).toBeGreaterThanOrEqual(1600);
    expect(source.info.height).toBeGreaterThanOrEqual(900);
    expect(source.info.width).toBeLessThan(3000);

    const md = PropertyImageStrategy.find(
      (c) => c.type === VariantType.THUMBNAIL_MD,
    )!;
    const variant = await service.processVariant(source, md, ImageFormat.WEBP);
    expect(variant).toMatchObject({ width: 960, height: 540 });
  });

  it('genera WebP y JPEG válidos, y el JPEG no falla con transparencia', async () => {
    const png = await sharp({
      create: {
        width: 500,
        height: 500,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      },
    })
      .png()
      .toBuffer();
    const og: VariantConfig = {
      type: VariantType.OG_IMAGE,
      width: 1200,
      height: 630,
      fit: FitStrategy.COVER,
      formats: [ImageFormat.WEBP, ImageFormat.JPEG],
      quality,
    };

    const source = await service.prepareSource(png, [og]);
    const webp = await service.processVariant(source, og, ImageFormat.WEBP);
    const jpeg = await service.processVariant(source, og, ImageFormat.JPEG);

    expect((await sharp(webp.buffer).metadata()).format).toBe('webp');
    expect((await sharp(jpeg.buffer).metadata()).format).toBe('jpeg');
    expect(webp.size).toBe(webp.buffer.length);
  });

  it('las variantes de propiedad se generan solo en WebP', () => {
    for (const config of PropertyImageStrategy) {
      expect(config.formats).toEqual([ImageFormat.WEBP]);
    }
  });
});
