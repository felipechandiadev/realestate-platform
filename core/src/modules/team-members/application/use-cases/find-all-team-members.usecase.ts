import { Injectable } from '@nestjs/common';
import { TeamMemberRepository } from '../../domain/team-member.repository';
import { TeamMember } from '../../domain/team-member.entity';

@Injectable()
export class FindAllTeamMembersUseCase {
  constructor(private readonly repo: TeamMemberRepository) {}

  async execute(search?: string): Promise<TeamMember[]> {
    const qb = this.repo.createQueryBuilder('team_member').where('team_member.deletedAt IS NULL');
    if (search) {
      const term = `%${search}%`;
      qb.andWhere(
        '(team_member.name LIKE :search OR team_member.position LIKE :search OR team_member.mail LIKE :search)',
        { search: term },
      );
    }
    return qb.getMany();
  }
}
