import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../../../users/application/users.service';
import { JweService } from '../../infrastructure/jwe/jwe.service';
import { LoginDto } from '../../../users/dto/user.dto';
import { ConfigService } from '@nestjs/config';
import { UserRole } from '../../../users/domain/user.entity';
import type { AuthAudience } from '../../presentation/guards/roles.guard';
import { resolveAuthAudienceForRole } from '../auth-audience.util';

const STAFF_ROLES: UserRole[] = [UserRole.ADMIN, UserRole.AGENT];

@Injectable()
export class SignInUseCase {
  constructor(
    private readonly usersService: UsersService,
    private readonly jweService: JweService,
    private readonly configService: ConfigService,
  ) {}

  async execute(loginDto: LoginDto, audience?: AuthAudience) {
    const user = await this.usersService.login(loginDto);
    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const resolvedAudience = this.resolveAudience(user.role as UserRole, audience);

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      authAudience: resolvedAudience,
    };

    let access_token: string;
    if (this.configService.get<string>('NODE_ENV') === 'test') {
      const jwt = await import('jsonwebtoken');
      access_token = jwt.sign(
        payload,
        this.configService.get<string>('JWT_SECRET') || 'test-secret',
        { expiresIn: '12h' },
      );
    } else {
      access_token = await this.jweService.encrypt(payload, '12h');
    }

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
      },
      access_token,
      audience: resolvedAudience,
    };
  }

  private resolveAudience(
    role: UserRole,
    requested?: AuthAudience,
  ): AuthAudience {
    if (requested === 'staff') {
      if (!STAFF_ROLES.includes(role)) {
        throw new UnauthorizedException(
          'Solo administradores y agentes pueden iniciar sesión en backoffice',
        );
      }
      return 'staff';
    }

    if (requested === 'community') {
      if (role !== UserRole.COMMUNITY) {
        throw new UnauthorizedException(
          'Solo usuarios community pueden iniciar sesión en el portal',
        );
      }
      return 'community';
    }

    // Legacy /auth/sign-in: derive audience from role
    return STAFF_ROLES.includes(role) ? 'staff' : 'community';
  }
}
