import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PersonRepository } from '../../domain/person.repository';
import { IsNull } from 'typeorm';

@Injectable()
export class RequestVerificationUseCase {
  constructor(private readonly personRepository: PersonRepository) {}

  async execute(id: string): Promise<void> {
    const person = await this.personRepository.findOne({ where: { id, deletedAt: IsNull() } });
    if (!person) throw new NotFoundException('Persona no encontrada');
    if (person.verificationRequest) {
      throw new BadRequestException('Ya existe una solicitud de verificación pendiente');
    }
    person.verificationRequest = new Date();
    await this.personRepository.save(person);
  }
}
