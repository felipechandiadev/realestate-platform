import { Injectable, NotFoundException } from '@nestjs/common';
import { MultimediaRepository } from '../../domain/multimedia.repository';

@Injectable()
export class HardDeleteMultimediaUseCase {
  constructor(private readonly repo: MultimediaRepository) {}

  async execute(id: string) {
    const m = await this.repo.findOne({ where: { id } });
    if (!m) throw new NotFoundException('Archivo multimedia no encontrado');
    await this.repo.remove(m);
  }
}