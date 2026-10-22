import { ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { UserRole } from '../domain/user.entity';
import { UpdateUserDto } from '../dto/user.dto';

/** Usuario autenticado tal como lo deja JwtAuthGuard en `req.user`. */
export interface AuthenticatedActor {
  id?: string;
  role?: UserRole | string;
}

/**
 * Permite el acceso si el actor es el dueño del recurso (`actor.id === targetUserId`)
 * o si su rol está en `allowedRoles`. En otro caso lanza ForbiddenException.
 */
export function assertSelfOrRoles(
  actor: AuthenticatedActor | undefined,
  targetUserId: string,
  allowedRoles: UserRole[],
): void {
  if (!actor?.id) {
    throw new UnauthorizedException('Autenticación requerida');
  }
  if (actor.id === targetUserId) return;
  if (actor.role && allowedRoles.includes(actor.role as UserRole)) return;
  throw new ForbiddenException('No tienes permiso para acceder a este usuario');
}

/** Campos de UpdateUserDto que solo un ADMIN puede modificar. */
export const ADMIN_ONLY_USER_FIELDS = [
  'role',
  'status',
  'permissions',
] as const;

/**
 * Un usuario que no es ADMIN (p. ej. editando su propio perfil) no puede
 * cambiar rol, estado ni permisos: esos campos se descartan.
 */
export function sanitizeUserUpdateForActor(
  actor: AuthenticatedActor | undefined,
  dto: UpdateUserDto,
): UpdateUserDto {
  if (actor?.role === UserRole.ADMIN) return dto;
  const clean: UpdateUserDto = { ...dto };
  for (const field of ADMIN_ONLY_USER_FIELDS) {
    delete (clean as Record<string, unknown>)[field];
  }
  return clean;
}
