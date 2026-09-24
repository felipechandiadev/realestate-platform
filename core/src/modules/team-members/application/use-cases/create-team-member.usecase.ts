import { Injectable, ConflictException } from '@nestjs/common';
import { TeamMemberRepository } from '../../domain/team-member.repository';
import { TeamMember } from '../../domain/team-member.entity';

@Injectable()
export class CreateTeamMemberUseCase {
  constructor(private readonly repo: TeamMemberRepository) {}

  async execute(dto: any): Promise<TeamMember> {
    if (dto.mail) {
      const existing = await this.repo.findOne({ where: { mail: dto.mail } });
      if (existing) throw new ConflictException('El correo ya está registrado.');
    }
    const member = this.repo.create(dto);
    return this.repo.save(member);
  }
}
