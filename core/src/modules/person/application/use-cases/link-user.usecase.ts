import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PersonRepository } from '../../domain/person.repository';
import { IsNull, Not } from 'typeorm';

@Injectable()
export class LinkUserUseCase {
  constructor(
    private readonly personRepository: PersonRepository,
  ) {}

  async execute(id: string, userId: string): Promise<void> {
    if (!userId) throw new BadRequestException('Debes indicar el usuario a vincular');

    const person = await this.personRepository.findOne({ where: { id, deletedAt: IsNull() }, relations: ['user'] });
    if (!person) throw new NotFoundException('Persona no encontrada');
    if (person.userId || person.user) throw new BadRequestException('La persona ya tiene un usuario vinculado');

    // Un usuario tiene una sola ficha de persona.
    const other = await this.personRepository.findOne({
      where: { userId, id: Not(id), deletedAt: IsNull() },
    });
    if (other) {
      throw new BadRequestException(
        `Ese usuario ya está vinculado a otra persona (${other.name || other.dni || other.id})`,
      );
    }

    await this.personRepository.update(id, { userId });
  }
}
