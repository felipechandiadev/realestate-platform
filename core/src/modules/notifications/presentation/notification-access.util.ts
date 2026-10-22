import { UserRole } from '../../users/domain/user.entity';

export type NotificationActor = { id?: string; sub?: string; role?: UserRole | string };

export function actorIdOf(actor?: NotificationActor | null): string | undefined {
  if (!actor) return undefined;
  return actor.id ?? (typeof actor.sub === 'string' ? actor.sub : undefined);
}

export function isStaffActor(actor?: NotificationActor | null): boolean {
  return actor?.role === UserRole.ADMIN || actor?.role === UserRole.AGENT;
}

/** Staff (ADMIN/AGENT) o destinatario de la notificación (targetUserIds). */
export function canAccessNotification(
  actor: NotificationActor | null | undefined,
  notification: { targetUserIds?: string[] | null },
): boolean {
  if (isStaffActor(actor)) return true;
  const id = actorIdOf(actor);
  if (!id) return false;
  return Array.isArray(notification?.targetUserIds) && notification.targetUserIds.includes(id);
}
