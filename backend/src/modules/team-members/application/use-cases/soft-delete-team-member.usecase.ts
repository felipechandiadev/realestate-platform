import { Injectable, NotFoundException } from '@nestjs/common';
import { TeamMemberRepository } from '../../domain/team-member.repository';
import { IsNull } from 'typeorm';

@Injectable()
export class SoftDeleteTeamMemberUseCase {
  constructor(private readonly repo: TeamMemberRepository) {}

  async execute(id: string): Promise<void> {
    const member = await this.repo.findOne({ where: { id, deletedAt: IsNull() } });
    if (!member) throw new NotFoundException('Miembro del equipo no encontrado.');
    await this.repo.softDelete(id);
  }
}
