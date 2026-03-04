import { Injectable, NotFoundException } from '@nestjs/common';
import { UserRepository } from '../../domain/user.repository';
import { UserRole } from '../../domain/user.entity';
import { AuditService } from '../../../audit/application/audit.service';
import { AuditAction, AuditEntityType } from '../../../../shared/enums/audit.enums';

@Injectable()
export class AssignRoleUseCase {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly auditService: AuditService,
  ) {}

  async execute(id: string, role: UserRole): Promise<any> {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('Usuario no encontrado.');
    const oldRole = user.role;
    user.role = role;
    const updated = await this.userRepo.save(user);
    await this.auditService.createAuditLog({
      userId: id,
      action: AuditAction.ROLE_CHANGED,
      entityType: AuditEntityType.USER,
      entityId: id,
      description: `Rol del usuario cambiado de ${oldRole} a ${role}`,
      oldValues: { role: oldRole },
      newValues: { role },
      success: true,
    });
    return updated;
  }
}
