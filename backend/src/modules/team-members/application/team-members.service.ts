import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { TeamMember } from '../domain/team-member.entity';
import {
  CreateTeamMemberDto,
  UpdateTeamMemberDto,
} from '../dto/team-member.dto';
import { TeamMemberRepository } from '../domain/team-member.repository';
import { CreateTeamMemberUseCase } from './use-cases/create-team-member.usecase';
import { FindAllTeamMembersUseCase } from './use-cases/find-all-team-members.usecase';
import { GetTeamMemberUseCase } from './use-cases/get-team-member.usecase';
import { UpdateTeamMemberUseCase } from './use-cases/update-team-member.usecase';
import { SoftDeleteTeamMemberUseCase } from './use-cases/soft-delete-team-member.usecase';

@Injectable()
export class TeamMembersService {
  constructor(
    @InjectRepository(TeamMember)
    private readonly teamMemberRepository: Repository<TeamMember>,
    private readonly createUseCase: CreateTeamMemberUseCase,
    private readonly findAllUseCase: FindAllTeamMembersUseCase,
    private readonly getUseCase: GetTeamMemberUseCase,
    private readonly updateUseCase: UpdateTeamMemberUseCase,
    private readonly softDeleteUseCase: SoftDeleteTeamMemberUseCase,
  ) {}

  async create(createTeamMemberDto: CreateTeamMemberDto): Promise<TeamMember> {
    return this.createUseCase.execute(createTeamMemberDto);
  }

  async findAll(search?: string): Promise<TeamMember[]> {
    return this.findAllUseCase.execute(search);
  }

  async findOne(id: string): Promise<TeamMember> {
    return this.getUseCase.execute(id);
  }

  async update(
    id: string,
    updateTeamMemberDto: UpdateTeamMemberDto,
  ): Promise<TeamMember> {
    return this.updateUseCase.execute(id, updateTeamMemberDto);
  }

  async softDelete(id: string): Promise<void> {
    await this.softDeleteUseCase.execute(id);
  }
}
