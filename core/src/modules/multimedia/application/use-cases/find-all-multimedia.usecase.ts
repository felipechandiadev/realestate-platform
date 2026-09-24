import { Injectable } from '@nestjs/common';
import { MultimediaRepository } from '../../domain/multimedia.repository';
import { IsNull } from 'typeorm';
import { Multimedia } from '../../domain/multimedia.entity';

@Injectable()
export class FindAllMultimediaUseCase {
  constructor(private readonly repo: MultimediaRepository) {}

  async execute(): Promise<Multimedia[]> {
    return this.repo.find({ where: { deletedAt: IsNull() } });
  }
}
