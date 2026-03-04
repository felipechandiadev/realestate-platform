import { Injectable } from '@nestjs/common';
import { MultimediaRepository } from '../../domain/multimedia.repository';

@Injectable()
export class SoftDeleteMultimediaUseCase {
  constructor(private readonly repo: MultimediaRepository) {}

  async execute(id: string) {
    await this.repo.softDelete(id);
  }
}