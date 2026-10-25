import { BadRequestException, ConflictException } from '@nestjs/common';
import { UserRole, UserStatus } from '../domain/user.entity';

/** Cambio sobre una cuenta que puede dejar sin acceso a alguien. */
export type AccountChange =
  | { kind: 'status'; status: UserStatus }
  | { kind: 'role'; role: UserRole }
  | { kind: 'delete' };

export type AccountChangeContext = {
  actorId?: string;
  target: { id: string; role: UserRole; status: UserStatus };
  /** Administradores activos distintos del usuario afectado. */
  otherActiveAdmins: number;
  /** Propiedades asignadas y contratos en proceso a cargo del usuario. */
  assignedProperties: number;
  activeContracts: number;
};

/**
 * Reglas para desactivar, cambiar el rol o eliminar una cuenta:
 * - nadie puede quitarse acceso a sí mismo;
 * - siempre debe quedar al menos un administrador activo;
 * - un agente con propiedades o contratos en proceso no se desactiva ni elimina
 *   sin reasignarlos antes.
 */
export function assertAccountChangeAllowed(change: AccountChange, ctx: AccountChangeContext): void {
  const removesAccess =
    change.kind === 'delete' ||
    (change.kind === 'status' && change.status !== UserStatus.ACTIVE) ||
    (change.kind === 'role' && change.role !== ctx.target.role);

  if (!removesAccess) return;

  if (ctx.actorId && ctx.actorId === ctx.target.id) {
    throw new BadRequestException(
      'No puedes desactivar, eliminar ni cambiar el rol de tu propia cuenta. Pídeselo a otro administrador.',
    );
  }

  const targetIsActiveAdmin =
    ctx.target.role === UserRole.ADMIN && ctx.target.status === UserStatus.ACTIVE;
  const losesAdmin =
    change.kind === 'delete' ||
    change.kind === 'status' ||
    (change.kind === 'role' && change.role !== UserRole.ADMIN);
  if (targetIsActiveAdmin && losesAdmin && ctx.otherActiveAdmins === 0) {
    throw new BadRequestException('Debe quedar al menos un administrador activo.');
  }

  const leavesWork =
    change.kind === 'delete' || (change.kind === 'status' && change.status === UserStatus.INACTIVE);
  if (leavesWork && (ctx.assignedProperties > 0 || ctx.activeContracts > 0)) {
    throw new ConflictException(
      `El usuario tiene ${ctx.assignedProperties} propiedad(es) asignada(s) y ${ctx.activeContracts} contrato(s) en proceso. Reasígnalos antes de ${change.kind === 'delete' ? 'eliminarlo' : 'desactivarlo'}.`,
    );
  }
}
