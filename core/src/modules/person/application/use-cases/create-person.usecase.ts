import { ConflictException, Injectable } from '@nestjs/common';
import { normalizeDni } from '../../domain/dni';
import { PersonRepository } from '../../domain/person.repository';
import { Person } from '../../domain/person.entity';

@Injectable()
export class CreatePersonUseCase {
  constructor(
    private readonly personRepository: PersonRepository,
  ) {}

  async execute(person: Person): Promise<Person> {
    person.dni = normalizeDni(person.dni) as string;
    if (person.dni) {
      const existing = await this.personRepository.findByDni(person.dni);
      if (existing && !existing.deletedAt) {
        throw new ConflictException('Ya existe una persona con ese RUT');
      }
      if (existing) {
        // El RUT es de una ficha eliminada: se restaura con los datos nuevos para
        // conservar su historial (contratos, documentos) en vez de duplicarla.
        const { id: _ignored, createdAt: _created, ...data } = person;
        await this.personRepository.update(existing.id, {
          ...data,
          deletedAt: null,
          updatedAt: new Date(),
        });
        const restored = await this.personRepository.findById(existing.id);
        if (restored) return restored;
      }
    }
    return await this.personRepository.save(person);
  }
}
