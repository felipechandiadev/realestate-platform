import { Injectable, NotFoundException } from '@nestjs/common';
import { UserRepository } from '../../domain/user.repository';
import { UserStatus } from '../../domain/user.entity';
import { AuditService } from '../../../audit/application/audit.service';
import { AuditAction, AuditEntityType } from '../../../../shared/enums/audit.enums';

@Injectable()
export class SetStatusUseCase {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly auditService: AuditService,
  ) {}

  async execute(id: string, status: UserStatus): Promise<any> {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('Usuario no encontrado');
    const oldStatus = user.status;
    user.status = status;
    const updated = await this.userRepo.save(user);
    await this.auditService.createAuditLog({
      userId: id,
      action: AuditAction.STATUS_CHANGED,
      entityType: AuditEntityType.USER,
      entityId: id,
      description: `Estado del usuario cambiado de ${oldStatus} a ${status}`,
      oldValues: { status: oldStatus },
      newValues: { status },
      success: true,
    });
    return updated;
  }
}
