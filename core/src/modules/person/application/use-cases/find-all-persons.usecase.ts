import { Injectable } from '@nestjs/common';
import { PersonRepository } from '../../domain/person.repository';
import { Person } from '../../domain/person.entity';

@Injectable()
export class FindAllPersonsUseCase {
  constructor(
    private readonly personRepository: PersonRepository,
  ) {}

  execute(): Promise<Person[]> {
    return this.personRepository.findAll();
  }
}
