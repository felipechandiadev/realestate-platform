/**
 * One-off: attach property sample images to existing blog articles
 * that lack multimediaUrl (without a full seed:reset).
 *
 * Usage (from core/):
 *   npx ts-node database/seeders/patch-article-images.ts
 */
import { AppDataSource, initializeDataSource } from './seeder.config';
import { Article } from '../../src/modules/articles/domain/article.entity';
import {
  Multimedia,
  MultimediaType,
} from '../../src/modules/multimedia/domain/multimedia.entity';
import { SAMPLE_SETS, uploadSampleImage } from './seed-media.uploader';

async function main() {
  await initializeDataSource();
  const articleRepository = AppDataSource.getRepository(Article);
  const multimediaRepository = AppDataSource.getRepository(Multimedia);

  const articles = await articleRepository.find({
    order: { createdAt: 'ASC' },
  });

  if (articles.length === 0) {
    console.log('No articles found. Run seed:reset first.');
    process.exit(0);
  }

  const imagePool = [
    ...SAMPLE_SETS.propertyExterior.slice(0, 6),
    ...SAMPLE_SETS.propertyInterior.slice(0, 2),
  ];

  let updated = 0;
  for (let i = 0; i < articles.length; i++) {
    const article = articles[i];
    if (article.multimediaUrl) {
      console.log(`⏭ skip (already has image): ${article.title}`);
      continue;
    }

    const file = imagePool[i % imagePool.length];
    const uploaded = await uploadSampleImage(
      file,
      'web/articles',
      MultimediaType.PROPERTY_IMG,
    );
    const media = await multimediaRepository.save(
      multimediaRepository.create({
        format: uploaded.format,
        type: uploaded.type,
        url: uploaded.url,
        filename: uploaded.filename,
        fileSize: uploaded.fileSize,
        description: `Article cover: ${article.title}`,
      }),
    );

    article.multimediaUrl = media.url;
    await articleRepository.save(article);
    updated += 1;
    console.log(`✓ ${article.title} → ${media.url}`);
  }

  console.log(`Done. Updated ${updated} / ${articles.length} articles.`);
  await AppDataSource.destroy();
}

main().catch(async (err) => {
  console.error(err);
  try {
    await AppDataSource.destroy();
  } catch {
    // ignore
  }
  process.exit(1);
});
