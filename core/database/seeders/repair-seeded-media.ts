/**
 * Completa/optimiza medios creados por versiones antiguas del seed sin resetear datos.
 * Solo agrega/substituye referencias y variantes; no borra objetos del bucket.
 *
 * Uso intencional contra una base no local requiere SEED_ALLOW_ANY_DB=yes-i-know.
 */
import { AppDataSource, initializeDataSource } from './seeder.config';
import { assertSafeToSeed } from './seed-guard';
import { Property } from '../../src/modules/property/domain/property.entity';
import { Multimedia, MultimediaType } from '../../src/modules/multimedia/domain/multimedia.entity';
import { MultimediaVariant } from '../../src/modules/media-optimization/domain/multimedia-variant.entity';
import { Slide } from '../../src/modules/slide/domain/slide.entity';
import { Identity } from '../../src/modules/identities/domain/identity.entity';
import { PortalHeader } from '../../src/modules/portal-header/domain/portal-header.entity';
import {
  SAMPLE_SETS,
  uploadImageBuffer,
  uploadSampleImage,
  type SeedUploadResult,
} from './seed-media.uploader';

async function main() {
  assertSafeToSeed(AppDataSource.options as { host?: string; database?: string }, 'seed:media:repair');
  AppDataSource.setOptions({ logging: false });
  await initializeDataSource();

  try {
    const properties = AppDataSource.getRepository(Property);
    const multimedia = AppDataSource.getRepository(Multimedia);
    const variants = AppDataSource.getRepository(MultimediaVariant);
    const slides = AppDataSource.getRepository(Slide);

    const saveOptimizedMedia = async (
      uploaded: SeedUploadResult,
      values: Partial<Multimedia>,
      existing?: Multimedia,
    ) => {
      const media = multimedia.create({
        ...(existing ?? {}),
        ...values,
        format: uploaded.format,
        type: uploaded.type,
        url: uploaded.url,
        filename: uploaded.filename,
        fileSize: uploaded.fileSize,
        originalSize: uploaded.originalSize,
        compressedSize: uploaded.compressedSize,
        compressionRatio: uploaded.compressionRatio,
        width: uploaded.width,
        height: uploaded.height,
      });
      const saved = await multimedia.save(media);
      await variants.delete({ multimediaId: saved.id });
      if (uploaded.variants.length > 0) {
        await variants.save(
          uploaded.variants.map((variant) => variants.create({ ...variant, multimediaId: saved.id })),
        );
      }
      return saved;
    };

    const allProperties = await properties.find({ order: { code: 'ASC' } });
    let propertiesRepaired = 0;
    for (const property of allProperties) {
      const existingMedia = await multimedia.find({
        where: { propertyId: property.id },
        order: { createdAt: 'ASC' },
      });
      // Never replace real customer uploads; this helper only upgrades seed-generated rows.
      const isSeedMedia = (item: Multimedia) =>
        item.description?.startsWith(`${property.title} — image `) ?? false;
      if (existingMedia.some((item) => !isSeedMedia(item))) continue;
      // A property with no files is only safe to seed when it matches the demo generator's description.
      const isDemoSeedProperty =
        property.description?.includes('Agenda tu visita con nuestro equipo de Bravo Schott Propiedades.') ?? false;
      if (existingMedia.length === 0 && !isDemoSeedProperty) continue;
      if (existingMedia.length > 0 && !existingMedia.some(isSeedMedia)) continue;
      if (
        existingMedia.length >= 3 &&
        existingMedia.filter(isSeedMedia).length >= 3 &&
        existingMedia.filter(isSeedMedia).every((item) => item.originalSize && Number(item.compressionRatio) > 0)
      ) continue;

      const index = allProperties.indexOf(property);
      const files = [
        SAMPLE_SETS.propertyExterior[index % SAMPLE_SETS.propertyExterior.length],
        SAMPLE_SETS.propertyInterior[index % SAMPLE_SETS.propertyInterior.length],
        SAMPLE_SETS.propertyExterior[(index + 7) % SAMPLE_SETS.propertyExterior.length],
      ];
      let mainImageUrl: string | undefined;
      for (let imageIndex = 0; imageIndex < files.length; imageIndex++) {
        const uploaded = await uploadSampleImage(files[imageIndex], 'properties/img', MultimediaType.PROPERTY_IMG);
        const description = `${property.title} — image ${imageIndex + 1}`;
        const existing = existingMedia.find((item) => item.description === description);
        await saveOptimizedMedia(uploaded, {
          propertyId: property.id,
          description,
          seoTitle: property.title,
        }, existing);
        mainImageUrl ??= uploaded.url;
      }
      if (mainImageUrl) {
        await properties.update(property.id, { mainImageUrl });
        propertiesRepaired += 1;
        console.log(`✓ ${property.code ?? property.id}: galería de 3 imágenes optimizadas`);
      }
    }

    const allSlides = await slides.find({ order: { order: 'ASC' } });
    let slidesRepaired = 0;
    for (const [index, slide] of allSlides.entries()) {
      if (!slide.multimediaUrl) continue;
      const existing = await multimedia.findOne({ where: { url: slide.multimediaUrl, type: MultimediaType.SLIDE } });
      if (existing?.originalSize && Number(existing.compressionRatio) > 0) continue;
      const sample = SAMPLE_SETS.propertyExterior[(index * 5) % SAMPLE_SETS.propertyExterior.length];
      const uploaded = await uploadSampleImage(sample, 'web/slides', MultimediaType.SLIDE);
      const media = await saveOptimizedMedia(uploaded, {
        description: `Home slider image — ${slide.title}`,
      }, existing ?? undefined);
      await slides.update(slide.id, { multimediaUrl: media.url });
      slidesRepaired += 1;
    }

    const identities = AppDataSource.getRepository(Identity);
    const identity = (await identities.find({ order: { createdAt: 'ASC' }, take: 1 }))[0];
    if (identity) {
      let logoBuffer: Buffer | undefined;
      if (identity.urlLogo) {
        try {
          const response = await fetch(identity.urlLogo);
          if (response.ok) logoBuffer = Buffer.from(await response.arrayBuffer());
        } catch {
          // Fall back to the bundled brand asset if the existing URL is unreachable.
        }
      }
      const uploadedLogo = logoBuffer
        ? await uploadImageBuffer(logoBuffer, 'bravo-schott-current-logo', 'web/logos', MultimediaType.LOGO)
        : await uploadSampleImage(SAMPLE_SETS.brandLogo, 'web/logos', MultimediaType.LOGO);
      const existingLogo = identity.urlLogo
        ? await multimedia.findOne({ where: { url: identity.urlLogo, type: MultimediaType.LOGO } })
        : null;
      const logoMedia = await saveOptimizedMedia(uploadedLogo, {
        description: 'Bravo Schott Propiedades — logo institucional',
        seoTitle: 'Bravo Schott Propiedades',
      }, existingLogo ?? undefined);
      await identities.update(identity.id, { urlLogo: logoMedia.url });

      const headers = AppDataSource.getRepository(PortalHeader);
      const header = (await headers.find({ order: { createdAt: 'ASC' }, take: 1 }))[0];
      if (header) await headers.update(header.id, { logoUrl: logoMedia.url });
    }

    console.log(`✅ Reparación terminada: ${propertiesRepaired} galerías, ${slidesRepaired} sliders y logo optimizados.`);
  } finally {
    await AppDataSource.destroy().catch(() => undefined);
  }
}

main().catch((error) => {
  console.error('No se pudo reparar el media del seed:', error instanceof Error ? error.message : error);
  process.exit(1);
});
