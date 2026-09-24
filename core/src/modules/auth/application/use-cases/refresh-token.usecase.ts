import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserRole } from '../../../users/domain/user.entity';
import {
  resolveAuthAudience,
  resolveAuthAudienceForRole,
} from '../auth-audience.util';
import { JweService } from '../../infrastructure/jwe/jwe.service';

@Injectable()
export class RefreshTokenUseCase {
  constructor(private readonly jweService: JweService) {}

  async execute(authorizationHeader?: string) {
    if (!authorizationHeader) {
      throw new UnauthorizedException('Token requerido');
    }

    const token = authorizationHeader.replace(/^Bearer\s+/i, '').trim();
    if (!token) {
      throw new UnauthorizedException('Token inválido');
    }

    try {
      const payload = await this.jweService.decrypt(token);
      const authAudience =
        resolveAuthAudience(payload) ??
        (payload.role ? resolveAuthAudienceForRole(payload.role as UserRole) : undefined);

      const newToken = await this.jweService.encrypt(
        {
          sub: payload.sub,
          email: payload.email,
          role: payload.role,
          name: payload.name,
          ...(authAudience ? { authAudience } : {}),
        },
        '12h',
      );
      return { access_token: newToken, expires_in: 12 * 60 * 60 };
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
