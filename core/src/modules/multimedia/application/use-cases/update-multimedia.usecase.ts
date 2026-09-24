import { Injectable, NotFoundException } from '@nestjs/common';
import { MultimediaRepository } from '../../domain/multimedia.repository';
import { Multimedia } from '../../domain/multimedia.entity';

@Injectable()
export class UpdateMultimediaUseCase {
  constructor(private readonly repo: MultimediaRepository) {}

  async execute(id: string, patch: Partial<any>) {
    const m = await this.repo.findOne({ where: { id } });
    if (!m) throw new NotFoundException('Archivo multimedia no encontrado');
    await this.repo.update(id, patch as any);
    const updated = await this.repo.findOne({ where: { id } });
    return updated as Multimedia;
  }
}
