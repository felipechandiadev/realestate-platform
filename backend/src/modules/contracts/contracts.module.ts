import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContractsService } from './application/contracts.service';
import { ContractsController } from './presentation/contracts.controller';
import { Contract } from './domain/contract.entity';
import { Payment } from './domain/payment.entity';
import { Document } from '../document/domain/document.entity';
import { PersonOrmEntity } from '../person/infrastructure/persistence/person.orm-entity';
import { User } from '../users/domain/user.entity';
import { Multimedia } from '../multimedia/domain/multimedia.entity';
import { Property } from '../property/domain/property.entity';
import { ContractRepository } from './domain/contract.repository';
import { ContractOrmEntity } from './infrastructure/persistence/contract.orm-entity';
import { TypeormContractRepository } from './infrastructure/persistence/typeorm-contract.repository';
import { ChangeContractStatusUseCase } from './application/use-cases/change-contract-status.usecase';
import { CreateContractUseCase } from './application/use-cases/create-contract.usecase';
import { FindContractUseCase } from './application/use-cases/find-contract.usecase';
import { DeleteContractUseCase } from './application/use-cases/delete-contract.usecase';
import { UpdateContractUseCase } from './application/use-cases/update-contract.usecase';
import { CloseContractUseCase } from './application/use-cases/close-contract.usecase';
import { FailContractUseCase } from './application/use-cases/fail-contract.usecase';
import { FindAllContractsUseCase } from './application/use-cases/find-all-contracts.usecase';
import { AddPaymentUseCase } from './application/use-cases/add-payment.usecase';
import { AddPersonUseCase } from './application/use-cases/add-person.usecase';
import { GetPeopleByRoleUseCase } from './application/use-cases/get-people-by-role.usecase';
import { ValidateRequiredRolesUseCase } from './application/use-cases/validate-required-roles.usecase';
import { DocumentTypesModule } from '../document-types/document-types.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ContractOrmEntity, Payment, Document, PersonOrmEntity, User, Multimedia, Property]),
    DocumentTypesModule,
    NotificationsModule,
    AuditModule,
  ],
  controllers: [ContractsController],
  providers: [
    ContractsService,
    CreateContractUseCase,
    FindContractUseCase,
    ChangeContractStatusUseCase,
    DeleteContractUseCase,
    UpdateContractUseCase,
    CloseContractUseCase,
    FailContractUseCase,
    FindAllContractsUseCase,
    AddPaymentUseCase,
    AddPersonUseCase,
    GetPeopleByRoleUseCase,
    ValidateRequiredRolesUseCase,
    {
      provide: ContractRepository,
      useClass: TypeormContractRepository,
    },
  ],
  exports: [ContractsService, ContractRepository],
})
export class ContractsModule {}
