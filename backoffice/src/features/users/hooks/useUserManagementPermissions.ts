'use client';

import { useSession } from 'next-auth/react';

import { canManageUser, canManageUsers, isAdminRole } from '../permissions';

/**
 * Permisos de gestión de usuarios según el rol de la sesión.
 * Solo ADMIN gestiona otros usuarios; cada uno puede editarse a sí mismo.
 */
export function useUserManagementPermissions() {
  const { data: session } = useSession();
  const actor = {
    id: session?.user?.id ?? null,
    role: session?.user?.role ?? null,
  };
  return {
    isAdmin: isAdminRole(actor.role),
    canManageUsers: canManageUsers(actor),
    canManageUser: (targetUserId?: string | null) => canManageUser(actor, targetUserId),
    currentUserId: actor.id,
  };
}
