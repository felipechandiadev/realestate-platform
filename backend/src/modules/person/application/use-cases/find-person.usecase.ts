import { Injectable } from '@nestjs/common';
import { PersonRepository } from '../../domain/person.repository';
import { Person } from '../../domain/person.entity';

@Injectable()
export class FindPersonUseCase {
  constructor(
    private readonly personRepository: PersonRepository,
  ) {}

  execute(id: string): Promise<Person | null> {
    return this.personRepository.findById(id);
  }
}
