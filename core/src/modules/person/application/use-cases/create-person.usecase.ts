import { Injectable } from '@nestjs/common';
import { PersonRepository } from '../../domain/person.repository';
import { Person } from '../../domain/person.entity';

@Injectable()
export class CreatePersonUseCase {
  constructor(
    private readonly personRepository: PersonRepository,
  ) {}

  async execute(person: Person): Promise<Person> {
    if (person.dni) {
      const existing = await this.personRepository.findByDni(person.dni);
      if (existing) {
        throw new Error('Ya existe una persona con ese DNI');
      }
    }
    return await this.personRepository.save(person);
  }
}
