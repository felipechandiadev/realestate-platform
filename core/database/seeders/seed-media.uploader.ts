import { promises as fs } from 'fs';
import * as path from 'path';
import { randomUUID } from 'crypto';
import {
  DeleteObjectsCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
  type ObjectIdentifier,
} from '@aws-sdk/client-s3';
import {
  MultimediaFormat,
  MultimediaType,
} from '../../src/modules/multimedia/domain/multimedia.entity';
import {
  ImageFormat,
  VariantType,
} from '../../src/modules/media-optimization/domain/multimedia-variant.entity';
import { FitStrategy } from '../../src/modules/media-optimization/domain/enums';
import { SharpProcessorService } from '../../src/modules/media-optimization/application/services/sharp-processor.service';
import {
  AvatarImageStrategy,
  BlogImageStrategy,
  PropertyImageStrategy,
  SliderImageStrategy,
  TestimonialImageStrategy,
  type VariantConfig,
} from '../../src/modules/media-optimization/infrastructure/strategies';

const SAMPLES_DIR = path.join(
  __dirname,
  '../../test/multimedia/multimediaSamples/images',
);

/** Buckets allowed for full wipe during seed:reset (dev/seed only). */
const DEFAULT_WIPE_ALLOWED_BUCKETS = ['civika', 'bshop'];

export type SeedUploadResult = {
  url: string;
  key: string;
  filename: string;
  fileSize: number;
  format: MultimediaFormat;
  type: MultimediaType;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
  width: number;
  height: number;
  variants: Array<{
    variantType: VariantType;
    format: ImageFormat;
    width: number;
    height: number;
    size: number;
    url: string;
    r2Key: string;
  }>;
};

function resolveProvider(): 'local' | 'r2' | 's3' {
  const raw =
    process.env.STORAGE_PROVIDER ||
    process.env.STORAGE_STRATEGY ||
    'local';
  const normalized = raw.trim().toLowerCase();
  if (normalized === 'cloudflare' || normalized === 'r2') return 'r2';
  if (normalized === 's3' || normalized === 'aws') return 's3';
  return 'local';
}

function createR2Client(): { client: S3Client; bucket: string; publicUrl: string } {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const bucket = process.env.R2_BUCKET_NAME;
  const publicUrl = (process.env.R2_PUBLIC_URL || '').replace(/\/+$/, '');
  const endpoint =
    process.env.R2_ENDPOINT ||
    (accountId ? `https://${accountId}.r2.cloudflarestorage.com` : undefined);

  if (!accountId || !accessKeyId || !secretAccessKey || !bucket || !publicUrl || !endpoint) {
    throw new Error(
      'R2 is selected but env is incomplete (R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME, R2_PUBLIC_URL)',
    );
  }

  const client = new S3Client({
    region: 'auto',
    endpoint,
    forcePathStyle: true,
    credentials: { accessKeyId, secretAccessKey },
  });

  return { client, bucket, publicUrl };
}

function getLocalUploadBase(): string {
  return path.join(__dirname, '../../public');
}

function isTruthyEnv(value: string | undefined): boolean {
  if (!value) return false;
  const normalized = value.trim().toLowerCase();
  return normalized === '1' || normalized === 'true' || normalized === 'yes';
}

function getWipeAllowedBuckets(): string[] {
  const fromEnv = (process.env.SEED_WIPE_ALLOWED_BUCKETS || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
  return fromEnv.length > 0 ? fromEnv : DEFAULT_WIPE_ALLOWED_BUCKETS;
}

/**
 * Vacía el bucket R2 usado por el seed (ListObjectsV2 + DeleteObjects).
 * Solo corre si SEED_WIPE_BUCKET=true y el bucket está en la allowlist de dev.
 */
export async function cleanCloudBucketForSeed(): Promise<{
  skipped: boolean;
  deleted: number;
  bucket?: string;
  reason?: string;
}> {
  const provider = resolveProvider();
  if (provider !== 'r2') {
    return {
      skipped: true,
      deleted: 0,
      reason: `provider=${provider} (cloud wipe only applies to r2)`,
    };
  }

  if (!isTruthyEnv(process.env.SEED_WIPE_BUCKET)) {
    return {
      skipped: true,
      deleted: 0,
      reason:
        'SEED_WIPE_BUCKET is not true — set SEED_WIPE_BUCKET=true to empty the R2 bucket on seed:reset',
    };
  }

  const { client, bucket } = createR2Client();
  const allowed = getWipeAllowedBuckets();
  if (!allowed.includes(bucket)) {
    throw new Error(
      `Refusing to wipe R2 bucket "${bucket}". Add it to SEED_WIPE_ALLOWED_BUCKETS (allowed: ${allowed.join(', ')}) or use a dedicated seed/dev bucket.`,
    );
  }

  console.log(`🧹 Wiping R2 bucket "${bucket}" before seed uploads...`);

  let deleted = 0;
  let continuationToken: string | undefined;

  do {
    const listed = await client.send(
      new ListObjectsV2Command({
        Bucket: bucket,
        ContinuationToken: continuationToken,
        MaxKeys: 1000,
      }),
    );

    const keys: ObjectIdentifier[] = (listed.Contents || [])
      .map((object) => object.Key)
      .filter((key): key is string => Boolean(key))
      .map((Key) => ({ Key }));

    if (keys.length > 0) {
      const result = await client.send(
        new DeleteObjectsCommand({
          Bucket: bucket,
          Delete: {
            Objects: keys,
            Quiet: true,
          },
        }),
      );

      const errors = result.Errors || [];
      if (errors.length > 0) {
        const sample = errors
          .slice(0, 3)
          .map((err) => `${err.Key}: ${err.Code} ${err.Message}`)
          .join('; ');
        throw new Error(
          `Failed to delete ${errors.length} object(s) from R2 bucket "${bucket}". Sample: ${sample}`,
        );
      }

      deleted += keys.length;
      console.log(`  … deleted ${deleted} object(s) so far`);
    }

    continuationToken = listed.IsTruncated
      ? listed.NextContinuationToken
      : undefined;
  } while (continuationToken);

  console.log(`✅ R2 bucket "${bucket}" wiped (${deleted} object(s) deleted)`);
  return { skipped: false, deleted, bucket };
}

async function uploadBuffer(
  buffer: Buffer,
  key: string,
  contentType: string,
): Promise<{ url: string; key: string }> {
  const provider = resolveProvider();

  if (provider === 'r2') {
    const { client, bucket, publicUrl } = createR2Client();
    await client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: buffer,
        ContentType: contentType,
        CacheControl: 'public, max-age=31536000, immutable',
      }),
    );
    return { url: `${publicUrl}/${key}`, key };
  }

  // local (and s3 fallback for seed → local write so seed still works)
  const localPath = path.join(getLocalUploadBase(), key);
  await fs.mkdir(path.dirname(localPath), { recursive: true });
  await fs.writeFile(localPath, buffer);
  const baseUrl = (process.env.API_URL || process.env.BACKEND_URL || 'http://localhost:8000').replace(
    /\/+$/,
    '',
  );
  return { url: `${baseUrl}/public/${key}`, key };
}

const sharpProcessor = new SharpProcessorService();

function getImageStrategy(type: MultimediaType): VariantConfig[] {
  switch (type) {
    case MultimediaType.PROPERTY_IMG:
      return PropertyImageStrategy;
    case MultimediaType.SLIDE:
      return SliderImageStrategy;
    case MultimediaType.TESTIMONIAL_IMG:
      return TestimonialImageStrategy;
    case MultimediaType.AGENT_IMG:
    case MultimediaType.STAFF:
      return AvatarImageStrategy;
    case MultimediaType.LOGO:
      return [{
        type: VariantType.FULL,
        width: 800,
        height: 800,
        fit: FitStrategy.INSIDE,
        formats: [ImageFormat.WEBP],
        quality: { webp: 88, jpeg: 90, png: 90 },
      }];
    default:
      return BlogImageStrategy;
  }
}

function getPrimaryVariant(type: MultimediaType): VariantType {
  if (type === MultimediaType.SLIDE) return VariantType.SLIDE_DESKTOP;
  if (type === MultimediaType.AGENT_IMG || type === MultimediaType.STAFF) {
    return VariantType.AVATAR_MD;
  }
  if (type === MultimediaType.TESTIMONIAL_IMG) return VariantType.AVATAR_MD;
  if (type === MultimediaType.LOGO) return VariantType.FULL;
  if (type === MultimediaType.PROPERTY_IMG) return VariantType.FULL;
  return VariantType.OG_IMAGE;
}

/** Optimize a source image with the same Sharp strategies used by normal uploads. */
export async function uploadImageBuffer(
  originalBuffer: Buffer,
  originalName: string,
  uploadDir: string,
  type: MultimediaType,
): Promise<SeedUploadResult> {
  const strategy = getImageStrategy(type);
  const metadata = await sharpProcessor.getMetadata(originalBuffer);
  const source = await sharpProcessor.prepareSource(originalBuffer, strategy);
  const imageId = randomUUID();
  const variants: SeedUploadResult['variants'] = [];

  for (const config of strategy) {
    for (const format of config.formats) {
      const processed = await sharpProcessor.processVariant(source, config, format);
      const extension = format === ImageFormat.JPEG ? 'jpg' : format;
      const key = path.posix.join(
        uploadDir.replace(/^\/+/, ''),
        imageId,
        `${config.type}.${extension}`,
      );
      const uploaded = await uploadBuffer(processed.buffer, key, `image/${format}`);
      variants.push({
        variantType: config.type,
        format,
        width: processed.width,
        height: processed.height,
        size: processed.size,
        url: uploaded.url,
        r2Key: uploaded.key,
      });
    }
  }

  const primaryType = getPrimaryVariant(type);
  const primary = variants.find((variant) => variant.variantType === primaryType) ?? variants[0];
  if (!primary) throw new Error(`No optimized variants generated for ${originalName}`);

  const compressedSize = variants.reduce((total, variant) => total + variant.size, 0);
  const originalSize = originalBuffer.length;
  const compressionRatio = originalSize > 0
    ? Number((((originalSize - compressedSize) / originalSize) * 100).toFixed(2))
    : 0;
  const filename = path.posix.basename(primary.r2Key);

  return {
    url: primary.url,
    key: primary.r2Key,
    filename,
    fileSize: compressedSize,
    format: MultimediaFormat.IMG,
    type,
    originalSize,
    compressedSize,
    compressionRatio,
    width: ((metadata.orientation ?? 1) >= 5 ? metadata.height : metadata.width) || primary.width,
    height: ((metadata.orientation ?? 1) >= 5 ? metadata.width : metadata.height) || primary.height,
    variants,
  };
}

export async function uploadSampleImage(
  sampleFileName: string,
  uploadDir: string,
  type: MultimediaType,
): Promise<SeedUploadResult> {
  const sourcePath = path.join(SAMPLES_DIR, sampleFileName);
  const buffer = await fs.readFile(sourcePath);
  return uploadImageBuffer(buffer, sampleFileName, uploadDir, type);
}

export const SAMPLE_SETS = {
  propertyExterior: Array.from({ length: 18 }, (_, i) =>
    `property-img-${String(i + 1).padStart(2, '0')}.jpg`,
  ),
  propertyInterior: Array.from({ length: 10 }, (_, i) =>
    `property-interior-${String(i + 1).padStart(2, '0')}.jpg`,
  ),
  people: Array.from({ length: 10 }, (_, i) =>
    `people-${String(i + 1).padStart(2, '0')}.jpg`,
  ),
  brandLogo: 'bravo-schott-logo.png',
};

export function getSeedStorageProviderLabel(): string {
  return resolveProvider();
}
