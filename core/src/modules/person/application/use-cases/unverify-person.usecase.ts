import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PersonRepository } from '../../domain/person.repository';
import { IsNull } from 'typeorm';

@Injectable()
export class UnverifyPersonUseCase {
  constructor(private readonly personRepository: PersonRepository) {}

  async execute(id: string): Promise<void> {
    const person = await this.personRepository.findOne({ where: { id, deletedAt: IsNull() } });
    if (!person) throw new NotFoundException('Persona no encontrada');
    if (!person.verified) throw new BadRequestException('La persona no está verificada');
    person.verified = false;
    await this.personRepository.save(person);
  }
}
