import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './presentation/users.controller';
import { UsersService } from './application/users.service';
import { User } from './domain/user.entity';
import { PersonOrmEntity } from '../person/infrastructure/persistence/person.orm-entity';
import { Property } from '../property/domain/property.entity';
import { AuditModule } from '../audit/audit.module';
import { ConfigModule } from '@nestjs/config';
import { MultimediaModule } from '../multimedia/multimedia.module';
import { forwardRef } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';

import { UserRepository } from './domain/user.repository';
import { TypeormUserRepository } from './infrastructure/typeorm-user.repository';
import { CreateUserUseCase } from './application/use-cases/create-user.usecase';
import { FindAllUsersUseCase } from './application/use-cases/find-all-users.usecase';
import { FindAdminUsersUseCase } from './application/use-cases/find-admin-users.usecase';
import { FindUserUseCase } from './application/use-cases/find-user.usecase';
import { UpdateUserUseCase } from './application/use-cases/update-user.usecase';
import { SoftDeleteUserUseCase } from './application/use-cases/soft-delete-user.usecase';
import { LoginUseCase } from './application/use-cases/login.usecase';
import { AssignRoleUseCase } from './application/use-cases/assign-role.usecase';
import { SetPermissionsUseCase } from './application/use-cases/set-permissions.usecase';
import { ChangePasswordUseCase } from './application/use-cases/change-password.usecase';
import { SetStatusUseCase } from './application/use-cases/set-status.usecase';
import { GetProfileUseCase } from './application/use-cases/get-profile.usecase';
import { ListAdminsAgentsUseCase } from './application/use-cases/list-admins-agents.usecase';
import { ListAgentsUseCase } from './application/use-cases/list-agents.usecase';
import { UpdateUserAvatarUseCase } from './application/use-cases/update-user-avatar.usecase';
import { GetUserFavoritesUseCase } from './application/use-cases/get-user-favorites.usecase';
import { CheckPropertyFavoriteUseCase } from './application/use-cases/check-property-favorite.usecase';
import { CreateCommunityUserUseCase } from './application/use-cases/create-community-user.usecase';
import { VerifyUserEmailUseCase } from './application/use-cases/verify-user-email.usecase';
import { ResendVerificationEmailUseCase } from './application/use-cases/resend-verification-email.usecase';
import { GridCommunityUsersUseCase } from './application/use-cases/grid-community-users.usecase';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([User, PersonOrmEntity, Property]),
    AuditModule,
    MultimediaModule,
    forwardRef(() => AuthModule),
  ],
  controllers: [UsersController],
  providers: [
    UsersService,
    TypeormUserRepository,
    {
      provide: UserRepository,
      useExisting: TypeormUserRepository,
    },
    CreateUserUseCase,
    FindAllUsersUseCase,
    FindAdminUsersUseCase,
    FindUserUseCase,
    UpdateUserUseCase,
    SoftDeleteUserUseCase,
    LoginUseCase,
    AssignRoleUseCase,
    SetPermissionsUseCase,
    ChangePasswordUseCase,
    SetStatusUseCase,
    GetProfileUseCase,
    ListAdminsAgentsUseCase,
    ListAgentsUseCase,
    UpdateUserAvatarUseCase,
    GetUserFavoritesUseCase,
    CheckPropertyFavoriteUseCase,
    CreateCommunityUserUseCase,
    VerifyUserEmailUseCase,
    ResendVerificationEmailUseCase,
    GridCommunityUsersUseCase,
  ],
  exports: [UsersService],
})
export class UsersModule {}
