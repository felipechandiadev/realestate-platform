import { SelectQueryBuilder } from 'typeorm';
import { TeamMember } from '../domain/team-member.entity';

export abstract class TeamMemberRepository {
  abstract create(data: Partial<TeamMember>): TeamMember;
  abstract save(teamMember: TeamMember): Promise<TeamMember>;
  abstract find(options?: any): Promise<TeamMember[]>;
  abstract findOne(options?: any): Promise<TeamMember | null>;
  abstract update(id: string, patch: Partial<TeamMember>): Promise<void>;
  abstract softDelete(id: string): Promise<void>;
  abstract createQueryBuilder(alias: string): SelectQueryBuilder<TeamMember>;
}
