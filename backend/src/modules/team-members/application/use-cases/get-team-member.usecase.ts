import { Injectable, NotFoundException } from '@nestjs/common';
import { IsNull } from 'typeorm';
import { TeamMemberRepository } from '../../domain/team-member.repository';
import { TeamMember } from '../../domain/team-member.entity';

@Injectable()
export class GetTeamMemberUseCase {
  constructor(private readonly repo: TeamMemberRepository) {}

  async execute(id: string): Promise<TeamMember> {
    const member = await this.repo.findOne({ where: { id, deletedAt: IsNull() } });
    if (!member) throw new NotFoundException('Miembro del equipo no encontrado.');
    return member;
  }
}
