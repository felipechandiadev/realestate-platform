import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { TeamMemberRepository } from '../../domain/team-member.repository';
import { TeamMember } from '../../domain/team-member.entity';
import { IsNull } from 'typeorm';

@Injectable()
export class UpdateTeamMemberUseCase {
  constructor(private readonly repo: TeamMemberRepository) {}

  async execute(id: string, dto: any): Promise<TeamMember> {
    const member = await this.repo.findOne({ where: { id, deletedAt: IsNull() } });
    if (!member) throw new NotFoundException('Miembro del equipo no encontrado.');

    if (dto.mail && dto.mail !== member.mail) {
      const existing = await this.repo.findOne({ where: { mail: dto.mail } });
      if (existing) throw new ConflictException('El correo ya está registrado.');
    }

    Object.assign(member, dto);
    return this.repo.save(member);
  }
}
