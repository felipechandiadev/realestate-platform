/** Solo para uso en servidor (server actions / services). */
import { getServerSession } from 'next-auth';

import { authOptions } from '@/lib/auth';
import {
  USER_MANAGEMENT_FORBIDDEN_MESSAGE,
  canManageUser,
  canManageUsers,
  type UserManagementActor,
} from '../permissions';

/** Actor de la sesión actual (id y rol), o null si no hay sesión. */
export async function getUserManagementActor(): Promise<UserManagementActor | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;
  return {
    id: session.user.id ?? null,
    role: session.user.role ?? (session as { role?: string }).role ?? null,
  };
}

/**
 * Devuelve el error a retornar si el usuario de la sesión NO puede realizar
 * la operación; null si puede. Sin targetUserId: operación solo-ADMIN.
 */
export async function userManagementDenial(
  targetUserId?: string,
): Promise<{ success: false; error: string } | null> {
  const actor = await getUserManagementActor();
  const allowed =
    targetUserId === undefined ? canManageUsers(actor) : canManageUser(actor, targetUserId);
  return allowed ? null : { success: false, error: USER_MANAGEMENT_FORBIDDEN_MESSAGE };
}

/** Variante que lanza (para la capa services/, que propaga errores). */
export async function assertUserManagementAllowed(targetUserId?: string): Promise<void> {
  const denial = await userManagementDenial(targetUserId);
  if (denial) throw new Error(denial.error);
}
