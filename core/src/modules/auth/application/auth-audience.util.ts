import { UserRole } from '../../users/domain/user.entity';
import type { AuthAudience } from '../presentation/guards/roles.guard';

const STAFF_ROLES: UserRole[] = [UserRole.ADMIN, UserRole.AGENT];

type AudiencePayload = {
  authAudience?: unknown;
  aud?: unknown;
  role?: UserRole;
};

function isAuthAudience(value: unknown): value is AuthAudience {
  return value === 'staff' || value === 'community';
}

/**
 * Resolves staff/community audience from token payload.
 * Avoids confusing JWT envelope `aud` (real-estate-platform-users) with app audience.
 */
export function resolveAuthAudience(payload: AudiencePayload): AuthAudience | undefined {
  if (isAuthAudience(payload.authAudience)) {
    return payload.authAudience;
  }

  if (isAuthAudience(payload.aud)) {
    return payload.aud;
  }

  if (payload.role && STAFF_ROLES.includes(payload.role)) {
    return 'staff';
  }

  if (payload.role === UserRole.COMMUNITY) {
    return 'community';
  }

  return undefined;
}

export function resolveAuthAudienceForRole(role: UserRole): AuthAudience {
  return STAFF_ROLES.includes(role) ? 'staff' : 'community';
}
