import { Injectable, NotFoundException } from '@nestjs/common';
import { UserRepository } from '../../domain/user.repository';
import { AuditService } from '../../../audit/application/audit.service';
import { AuditAction, AuditEntityType } from '../../../../shared/enums/audit.enums';
import { ConfigService } from '@nestjs/config';
import { plainToInstance } from 'class-transformer';
import { UserProfileResponseDto } from '../../dto/user-profile-response.dto';

@Injectable()
export class GetProfileUseCase {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly auditService: AuditService,
    private readonly configService: ConfigService,
  ) {}

  async execute(id: string): Promise<UserProfileResponseDto> {
    const user = await this.userRepo.findOne({
      where: { id, deletedAt: null },
      relations: ['person', 'person.dniCardFront', 'person.dniCardRear'],
    });
    if (!user) throw new NotFoundException('Usuario no encontrado');

    await this.auditService.createAuditLog({
      userId: id,
      action: AuditAction.PROFILE_VIEWED,
      entityType: AuditEntityType.USER,
      entityId: id,
      description: `Perfil del usuario ${user.email} visualizado`,
      success: true,
    });

    const backendUrl = this.configService.get<string>('BACKEND_PUBLIC_URL') || 'http://localhost:3000';

    const profile: any = {
      id: user.id,
      username: user.username,
      email: user.email,
      personalInfo: {
        ...user.personalInfo,
        avatarUrl: user.personalInfo?.avatarUrl,
      },
      permissions: user.permissions || [],
      person: user.person ? {
        id: user.person.id,
        dni: user.person.dni,
        address: user.person.address,
        phone: user.person.phone,
        email: user.person.email,
        verified: user.person.verified,
        dniCardFrontUrl: user.person.dniCardFront?.url || undefined,
        dniCardRearUrl: user.person.dniCardRear?.url || undefined,
      } : undefined,
      role: user.role,
      status: user.status,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    return plainToInstance(UserProfileResponseDto, profile, { excludeExtraneousValues: true });
  }
}
