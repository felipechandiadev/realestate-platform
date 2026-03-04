import { Injectable, NotFoundException } from '@nestjs/common';
import { UserRepository } from '../../domain/user.repository';
import { Permission } from '../../domain/user.entity';
import { AuditService } from '../../../audit/application/audit.service';
import { AuditAction, AuditEntityType } from '../../../../shared/enums/audit.enums';

@Injectable()
export class SetPermissionsUseCase {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly auditService: AuditService,
  ) {}

  async execute(id: string, permissions: Permission[]): Promise<any> {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('Usuario no encontrado.');
    const old = user.permissions;
    user.permissions = permissions;
    const updated = await this.userRepo.save(user);
    await this.auditService.createAuditLog({
      userId: id,
      action: AuditAction.PERMISSIONS_CHANGED,
      entityType: AuditEntityType.USER,
      entityId: id,
      description: `Permisos del usuario actualizados`,
      oldValues: { permissions: old },
      newValues: { permissions },
      success: true,
    });
    return updated;
  }
}
