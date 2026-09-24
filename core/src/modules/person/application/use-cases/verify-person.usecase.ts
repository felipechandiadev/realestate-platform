import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PersonRepository } from '../../domain/person.repository';
import { IsNull } from 'typeorm';

@Injectable()
export class VerifyPersonUseCase {
  constructor(private readonly personRepository: PersonRepository) {}

  async execute(id: string): Promise<void> {
    const person = await this.personRepository.findOne({ where: { id, deletedAt: IsNull() } });
    if (!person) throw new NotFoundException('Persona no encontrada');
    if (person.verified) throw new BadRequestException('La persona ya está verificada');
    person.verified = true;
    await this.personRepository.save(person);
  }
}
