import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Identity } from './domain/identity.entity';
import { IdentitiesService } from './application/identities.service';
import { IdentitiesController } from './presentation/identities.controller';
import { AuthModule } from '../auth/auth.module';
import { AuditModule } from '../audit/audit.module';
import { MultimediaModule } from '../multimedia/multimedia.module';
import { IdentityRepository } from './domain/identity.repository';
import { TypeormIdentityRepository } from './infrastructure/typeorm-identity.repository';
import { CreateIdentityUseCase } from './application/use-cases/create-identity.usecase';
import { FindAllIdentitiesUseCase } from './application/use-cases/find-all-identities.usecase';
import { GetIdentityUseCase } from './application/use-cases/get-identity.usecase';
import { UpdateIdentityUseCase } from './application/use-cases/update-identity.usecase';
import { SoftDeleteIdentityUseCase } from './application/use-cases/soft-delete-identity.usecase';

@Module({
  imports: [
    TypeOrmModule.forFeature([Identity]),
    AuthModule,
    AuditModule,
    MultimediaModule,
  ],
  controllers: [IdentitiesController],
  providers: [
    IdentitiesService,
    TypeormIdentityRepository,
    {
      provide: IdentityRepository,
      useExisting: TypeormIdentityRepository,
    },
    CreateIdentityUseCase,
    FindAllIdentitiesUseCase,
    GetIdentityUseCase,
    UpdateIdentityUseCase,
    SoftDeleteIdentityUseCase,
  ],
  exports: [IdentitiesService],
})
export class IdentitiesModule {}
