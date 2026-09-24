import { Injectable } from '@nestjs/common';
import { PersonRepository } from '../../domain/person.repository';

@Injectable()
export class SearchPersonsUseCase {
  constructor(
    private readonly personRepository: PersonRepository,
  ) {}

  execute(): Promise<Array<{ id: string; name: string; dni: string }>> {
    return this.personRepository.searchMinimal();
  }
}