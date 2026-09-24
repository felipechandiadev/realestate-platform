import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class JweService implements OnModuleInit {
  private publicKey: any;
  private privateKey: any;
  private jose: any;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    // Use dynamic import to avoid TypeScript converting to require()
    if (process.env.NODE_ENV !== 'test') {
      this.jose = await new Function('specifier', 'return import(specifier)')('jose');
      await this.loadKeys();
    } else {
      // In test environment, avoid loading jose (ESM) to prevent runtime issues.
      this.jose = null;
    }
  }

  private async loadKeys() {
    try {
      let privateKeyPem: string;
      let publicKeyPem: string;

      // Try loading from environment variables first (for production/Render)
      const envPrivateKey = this.configService.get<string>('JWE_PRIVATE_KEY');
      const envPublicKey = this.configService.get<string>('JWE_PUBLIC_KEY');

      if (envPrivateKey && envPublicKey) {
        // Use environment variables - handle both Base64 and PEM formats
        privateKeyPem = this.decodeKeyIfBase64(envPrivateKey);
        publicKeyPem = this.decodeKeyIfBase64(envPublicKey);
      } else {
        // Fall back to file system (for local development)
        const privateKeyPath =
          this.configService.get<string>('JWE_PRIVATE_KEY_PATH') ||
          'keys/private.pem';
        const publicKeyPath =
          this.configService.get<string>('JWE_PUBLIC_KEY_PATH') ||
          'keys/public.pem';

        privateKeyPem = fs.readFileSync(
          path.resolve(privateKeyPath),
          'utf8',
        );
        publicKeyPem = fs.readFileSync(path.resolve(publicKeyPath), 'utf8');
      }

      this.privateKey = await this.jose.importPKCS8(
        privateKeyPem,
        'RSA-OAEP-256',
      );
      this.publicKey = await this.jose.importSPKI(publicKeyPem, 'RSA-OAEP-256');
    } catch (error) {
      throw new Error(`Failed to load JWE keys: ${error.message}`);
    }
  }

  private decodeKeyIfBase64(key: string): string {
    try {
      // Check if the key starts with BEGIN (PEM format)
      if (key.includes('BEGIN') && key.includes('END')) {
        return key; // Already in PEM format
      }

      // Try to decode as Base64
      const decoded = Buffer.from(key, 'base64').toString('utf8');

      // Verify it's valid PEM after decoding
      if (decoded.includes('BEGIN') && decoded.includes('END')) {
        return decoded;
      }

      // If neither format worked, return original
      return key;
    } catch {
      // If decoding fails, assume it's already in correct format
      return key;
    }
  }

  async encrypt(payload: any, expiresIn: string = '12h'): Promise<string> {
    const now = Math.floor(Date.now() / 1000);

    return new this.jose.EncryptJWT(payload)
      .setProtectedHeader({ alg: 'RSA-OAEP-256', enc: 'A256GCM' })
      .setIssuedAt(now)
      .setIssuer('real-estate-platform')
      .setAudience('real-estate-platform-users')
      .setExpirationTime(expiresIn)
      .encrypt(this.publicKey);
  }

  async decrypt(token: string): Promise<any> {
    // Prefer jose-based JWE decryption when available, otherwise fall back to
    // plain JWT verification using `JWT_SECRET` (useful in tests).
    if (this.jose && this.privateKey && typeof this.jose.jwtDecrypt === 'function') {
      try {
        const { payload } = await this.jose.jwtDecrypt(token, this.privateKey, {
          issuer: 'real-estate-platform',
          audience: 'real-estate-platform-users',
        });
        return payload;
      } catch (error) {
        console.error('[JweService] Token decrypt error (jose):', error instanceof Error ? error.message : error);
        throw new Error('Invalid or expired token');
      }
    }

    // Fallback: try plain JWT verification using synchronous jsonwebtoken
    try {
      const secret = this.configService.get<string>('JWT_SECRET') || process.env.JWT_SECRET;
      if (!secret) throw new Error('JWT secret not configured');
      const verified = jwt.verify(token, secret) as any;
      return verified;
    } catch (error) {
      console.error('[JweService] Token decrypt error (fallback):', error instanceof Error ? error.message : error);
      throw new Error('Invalid or expired token');
    }
  }
}
