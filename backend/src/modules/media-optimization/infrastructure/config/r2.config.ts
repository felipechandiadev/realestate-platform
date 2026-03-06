import { S3Client } from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';

@Injectable()
export class R2Config {
  private client: S3Client;
  public readonly bucket: string;
  public readonly publicUrl: string;
  public readonly accountId: string;

  constructor(private configService: ConfigService) {
    this.accountId = this.configService.get<string>('R2_ACCOUNT_ID')!;
    this.bucket = this.configService.get<string>('R2_BUCKET_NAME')!;
    this.publicUrl = this.configService.get<string>('R2_PUBLIC_URL')!;

    this.client = new S3Client({
      region: 'auto',
      endpoint: `https://${this.accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: this.configService.get<string>('R2_ACCESS_KEY_ID')!,
        secretAccessKey: this.configService.get<string>(
          'R2_SECRET_ACCESS_KEY',
        )!,
      },
    });
  }

  getClient(): S3Client {
    return this.client;
  }
}
