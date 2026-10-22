/**
 * Reglas de gestión de usuarios en el backoffice (espejo de core):
 * solo ADMIN gestiona otros usuarios (editar, estado, rol, permisos,
 * avatar, contraseña, eliminar). Cada usuario puede editar su propio perfil.
 *
 * Módulo puro: se usa tanto en componentes cliente como en server actions.
 */

export const USER_MANAGEMENT_FORBIDDEN_MESSAGE =
  'Solo un administrador puede gestionar usuarios.';

export interface UserManagementActor {
  id?: string | null;
  role?: string | null;
}

export function isAdminRole(role?: string | null): boolean {
  return role === 'ADMIN';
}

/** Puede gestionar a otros usuarios (solo ADMIN). */
export function canManageUsers(actor?: UserManagementActor | null): boolean {
  return isAdminRole(actor?.role);
}

/** ADMIN sobre cualquiera; el resto solo sobre sí mismo. */
export function canManageUser(
  actor: UserManagementActor | null | undefined,
  targetUserId: string | null | undefined,
): boolean {
  if (canManageUsers(actor)) return true;
  return Boolean(actor?.id && targetUserId && actor.id === targetUserId);
}
