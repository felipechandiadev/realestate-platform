import { Injectable } from '@nestjs/common';
import { PersonRepository } from '../../domain/person.repository';
import { Person } from '../../domain/person.entity';

@Injectable()
export class RemovePersonUseCase {
  constructor(
    private readonly personRepository: PersonRepository,
  ) {}

  async execute(id: string): Promise<void> {
    const existing = await this.personRepository.findById(id);
    if (!existing) {
      throw new Error('Persona no encontrada');
    }
    await this.personRepository.softRemove(existing);
  }
}