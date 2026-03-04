import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { TeamMemberRepository } from '../domain/team-member.repository';
import { TeamMember } from '../domain/team-member.entity';

@Injectable()
export class TypeormTeamMemberRepository extends TeamMemberRepository {
  constructor(
    @InjectRepository(TeamMember)
    private readonly repository: Repository<TeamMember>,
  ) {
    super();
  }

  create(data: Partial<TeamMember>): TeamMember {
    return (this.repository.create(data as any) as unknown) as TeamMember;
  }

  async save(teamMember: TeamMember): Promise<TeamMember> {
    return this.repository.save(teamMember as any);
  }

  async find(options?: any): Promise<TeamMember[]> {
    return this.repository.find(options);
  }

  async findOne(options?: any): Promise<TeamMember | null> {
    const found = await this.repository.findOne(options);
    return found || null;
  }

  async update(id: string, patch: Partial<TeamMember>): Promise<void> {
    await this.repository.update(id, patch as any);
  }

  async softDelete(id: string): Promise<void> {
    await this.repository.softDelete(id);
  }

  createQueryBuilder(alias: string) {
    return this.repository.createQueryBuilder(alias);
  }
}
