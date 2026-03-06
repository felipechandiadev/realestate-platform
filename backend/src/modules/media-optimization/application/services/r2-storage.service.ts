import { Injectable } from '@nestjs/common';
import {
  PutObjectCommand,
  DeleteObjectCommand,
  DeleteObjectsCommand,
} from '@aws-sdk/client-s3';
import { R2Config } from '../../infrastructure/config/r2.config';

export interface UploadResult {
  url: string;
  key: string;
}

@Injectable()
export class R2StorageService {
  constructor(private r2Config: R2Config) {}

  /**
   * Sube un archivo a Cloudflare R2
   * @param buffer Buffer del archivo
   * @param key Ruta/nombre del archivo en R2
   * @param mimeType Tipo MIME del archivo
   * @returns URL pública y key del archivo
   */
  async upload(
    buffer: Buffer,
    key: string,
    mimeType: string,
  ): Promise<UploadResult> {
    const client = this.r2Config.getClient();

    await client.send(
      new PutObjectCommand({
        Bucket: this.r2Config.bucket,
        Key: key,
        Body: buffer,
        ContentType: mimeType,
        CacheControl: 'public, max-age=31536000, immutable', // Cache por 1 año
      }),
    );

    return {
      url: `${this.r2Config.publicUrl}/${key}`,
      key,
    };
  }

  /**
   * Elimina un archivo de R2
   * @param key Key del archivo en R2
   */
  async delete(key: string): Promise<void> {
    const client = this.r2Config.getClient();

    await client.send(
      new DeleteObjectCommand({
        Bucket: this.r2Config.bucket,
        Key: key,
      }),
    );
  }

  /**
   * Elimina múltiples archivos de R2
   * @param keys Array de keys a eliminar
   */
  async deleteMultiple(keys: string[]): Promise<void> {
    if (keys.length === 0) return;

    const client = this.r2Config.getClient();

    await client.send(
      new DeleteObjectsCommand({
        Bucket: this.r2Config.bucket,
        Delete: {
          Objects: keys.map((key) => ({ Key: key })),
          Quiet: true,
        },
      }),
    );
  }

  /**
   * Obtiene la URL pública de un archivo
   * @param key Key del archivo en R2
   * @returns URL pública
   */
  getPublicUrl(key: string): string {
    return `${this.r2Config.publicUrl}/${key}`;
  }
}
