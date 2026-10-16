import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { resolveAuthAudience } from '../../application/auth-audience.util';
import { UserRole } from '../../../users/domain/user.entity';

export type AuthAudience = 'staff' | 'community';

const STAFF_ROLES = [UserRole.ADMIN, UserRole.AGENT];

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user as
      | { id?: string; role?: UserRole; authAudience?: AuthAudience }
      | undefined;

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
