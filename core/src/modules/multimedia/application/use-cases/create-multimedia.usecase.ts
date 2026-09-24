import { Injectable } from '@nestjs/common';
import { MultimediaRepository } from '../../domain/multimedia.repository';
import { Multimedia } from '../../domain/multimedia.entity';

@Injectable()
export class CreateMultimediaUseCase {
  constructor(private readonly repo: MultimediaRepository) {}

  async execute(data: Multimedia): Promise<Multimedia> {
    const m = this.repo.create(data as any);
    return this.repo.save(m as any);
  }
}
