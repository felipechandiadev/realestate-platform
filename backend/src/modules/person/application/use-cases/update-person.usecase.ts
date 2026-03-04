import { Injectable } from '@nestjs/common';
import { PersonRepository } from '../../domain/person.repository';
import { Person } from '../../domain/person.entity';

@Injectable()
export class UpdatePersonUseCase {
  constructor(
    private readonly personRepository: PersonRepository,
  ) {}

  async execute(id: string, patch: Partial<Person>): Promise<Person> {
    const existing = await this.personRepository.findById(id);
    if (!existing) {
      throw new Error('Persona no encontrada');
    }
    if (patch.dni && patch.dni !== existing.dni) {
      const other = await this.personRepository.findByDni(patch.dni);
      if (other) {
        throw new Error('Ya existe una persona con ese DNI');
      }
    }
    const updated = { ...existing, ...patch } as Person;
    return await this.personRepository.save(updated);
  }
}