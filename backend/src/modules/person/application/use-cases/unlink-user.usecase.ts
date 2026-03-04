import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PersonRepository } from '../../domain/person.repository';
import { IsNull } from 'typeorm';

@Injectable()
export class UnlinkUserUseCase {
  constructor(private readonly personRepository: PersonRepository) {}

  async execute(id: string): Promise<void> {
    const person = await this.personRepository.findOne({ where: { id, deletedAt: IsNull() }, relations: ['user'] });
    if (!person) throw new NotFoundException('Persona no encontrada');
    if (!person.user) throw new BadRequestException('No existe usuario vinculado a esta persona');
    person.user = undefined as any;
    await this.personRepository.save(person);
  }
}
