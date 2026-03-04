import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PersonRepository } from '../../domain/person.repository';
import { User } from '../../../users/domain/user.entity';
import { IsNull } from 'typeorm';

@Injectable()
export class LinkUserUseCase {
  constructor(
    private readonly personRepository: PersonRepository,
  ) {}

  async execute(id: string, userId: string): Promise<void> {
    const person = await this.personRepository.findOne({ where: { id, deletedAt: IsNull() }, relations: ['user'] });
    if (!person) throw new NotFoundException('Persona no encontrada');
    if (person.user) throw new BadRequestException('La persona ya tiene un usuario vinculado');
    person.user = { id } as User; // only set id
    await this.personRepository.save(person);
  }
}
