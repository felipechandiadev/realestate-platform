import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TeamMember } from './domain/team-member.entity';
import { TeamMembersService } from './application/team-members.service';
import { TeamMembersController } from './presentation/team-members.controller';
import { MultimediaModule } from '../multimedia/multimedia.module';
import { TeamMemberRepository } from './domain/team-member.repository';
import { TypeormTeamMemberRepository } from './infrastructure/typeorm-team-member.repository';
import { CreateTeamMemberUseCase } from './application/use-cases/create-team-member.usecase';
import { FindAllTeamMembersUseCase } from './application/use-cases/find-all-team-members.usecase';
import { GetTeamMemberUseCase } from './application/use-cases/get-team-member.usecase';
import { UpdateTeamMemberUseCase } from './application/use-cases/update-team-member.usecase';
import { SoftDeleteTeamMemberUseCase } from './application/use-cases/soft-delete-team-member.usecase';

@Module({
  imports: [TypeOrmModule.forFeature([TeamMember]), MultimediaModule],
  controllers: [TeamMembersController],
  providers: [
    TeamMembersService,
    TypeormTeamMemberRepository,
    {
      provide: TeamMemberRepository,
      useExisting: TypeormTeamMemberRepository,
    },
    CreateTeamMemberUseCase,
    FindAllTeamMembersUseCase,
    GetTeamMemberUseCase,
    UpdateTeamMemberUseCase,
    SoftDeleteTeamMemberUseCase,
  ],
  exports: [TeamMembersService],
})
export class TeamMembersModule {}
