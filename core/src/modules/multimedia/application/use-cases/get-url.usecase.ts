import { Injectable, NotFoundException } from '@nestjs/common';
import { MultimediaRepository } from '../../domain/multimedia.repository';

@Injectable()
export class GetUrlUseCase {
  constructor(private readonly repo: MultimediaRepository) {}

  async execute(id: string) {
    const m = await this.repo.findOne({ where: { id } });
    if (!m) throw new NotFoundException('Archivo multimedia no encontrado');
    return m.url;
  }
}