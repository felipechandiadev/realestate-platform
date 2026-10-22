import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-custom';
import { resolveAuthAudience } from '../../application/auth-audience.util';
import { JweService } from '../jwe/jwe.service';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor(private readonly jweService: JweService) {
    super();
  }

  async validate(request: any) {
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    try {
      let decryptedPayload: any;

      if (process.env.NODE_ENV === 'test' && process.env.JWT_SECRET) {
        // Solo en tests: JWT plano firmado con JWT_SECRET (sin secreto por defecto)
        decryptedPayload = jwt.verify(token, process.env.JWT_SECRET);
      } else {
        // Decrypt the JWE token
        decryptedPayload = await this.jweService.decrypt(token);
      }
      if (!decryptedPayload) {
        throw new UnauthorizedException('Invalid token');
      }

      // Check if token is expired
      if (decryptedPayload.exp && decryptedPayload.exp * 1000 < Date.now()) {
        throw new UnauthorizedException('Token expired');
      }

      // Return user information
      return {
        id: decryptedPayload.sub,
        email: decryptedPayload.email,
        role: decryptedPayload.role,
        authAudience: resolveAuthAudience(decryptedPayload),
      };
    } catch (error) {
      this.logger.debug(
        `Token inválido: ${error instanceof Error ? error.message : 'error desconocido'}`,
      );
      throw new UnauthorizedException('Invalid token');
    }
  }

  private extractTokenFromHeader(request: any): string | null {
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    return authHeader.substring(7);
  }
}
