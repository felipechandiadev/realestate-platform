import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { resolveAuthAudience } from '../../application/auth-audience.util';
import { UserRole } from '../../../users/domain/user.entity';

export type AuthAudience = 'staff' | 'community';

const STAFF_ROLES = [UserRole.ADMIN, UserRole.AGENT];

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Solo aplica a HTTP (los gateways WebSocket tienen su propia autenticación)
    if (context.getType() !== 'http') {
      return true;
    }

    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user as
      | { id?: string; role?: UserRole; authAudience?: AuthAudience }
      | undefined;

    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Deny-by-default: sin @Roles basta con estar autenticado.
    if (!requiredRoles || requiredRoles.length === 0) {
      if (!user?.id) {
        throw new UnauthorizedException('Autenticación requerida');
      }
      return true;
    }

    if (!user?.role) {
      throw new ForbiddenException('User role not found');
    }

    if (!requiredRoles.includes(user.role)) {
      throw new ForbiddenException(
        `Role ${user.role} is not allowed for this resource`,
      );
    }

    const authAudience = resolveAuthAudience(user);
    const isStaffUser = STAFF_ROLES.includes(user.role);
    const isCommunityUser = user.role === UserRole.COMMUNITY;

    // Audience checks follow the caller's role, so mixed @Roles(staff, COMMUNITY)
    // still work for both audiences.
    if (isStaffUser && authAudience && authAudience !== 'staff') {
      throw new ForbiddenException('Staff audience required');
    }

    if (isCommunityUser && authAudience && authAudience !== 'community') {
      throw new ForbiddenException('Community audience required');
    }

    return true;
  }
}
