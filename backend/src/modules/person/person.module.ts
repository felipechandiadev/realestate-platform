import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PersonController } from './presentation/person.controller';
import { PersonService } from './application/person.service';
// import of Person entity removed after moving to domain
import { PersonRepository } from './domain/person.repository';
import { PersonOrmEntity } from './infrastructure/persistence/person.orm-entity';
import { User } from '../users/domain/user.entity';
import { TypeormPersonRepository } from './infrastructure/persistence/typeorm-person.repository';
import { CreatePersonUseCase } from './application/use-cases/create-person.usecase';
import { FindAllPersonsUseCase } from './application/use-cases/find-all-persons.usecase';
import { FindPersonUseCase } from './application/use-cases/find-person.usecase';
import { UpdatePersonUseCase } from './application/use-cases/update-person.usecase';
import { RemovePersonUseCase } from './application/use-cases/remove-person.usecase';
import { SearchPersonsUseCase } from './application/use-cases/search-persons.usecase';
import { VerifyPersonUseCase } from './application/use-cases/verify-person.usecase';
import { UnverifyPersonUseCase } from './application/use-cases/unverify-person.usecase';
import { RequestVerificationUseCase } from './application/use-cases/request-verification.usecase';
import { LinkUserUseCase } from './application/use-cases/link-user.usecase';
import { UnlinkUserUseCase } from './application/use-cases/unlink-user.usecase';

@Module({
  imports: [TypeOrmModule.forFeature([PersonOrmEntity, User])],
  controllers: [PersonController],
  providers: [
    PersonService,
    CreatePersonUseCase,
    FindAllPersonsUseCase,
    FindPersonUseCase,
    UpdatePersonUseCase,
    RemovePersonUseCase,
    SearchPersonsUseCase,
    VerifyPersonUseCase,
    UnverifyPersonUseCase,
    RequestVerificationUseCase,
    LinkUserUseCase,
    UnlinkUserUseCase,
    {
      provide: PersonRepository,
      useClass: TypeormPersonRepository,
    },
  ],
  exports: [PersonService],
})
export class PersonModule {}
