import { Injectable, NotFoundException } from '@nestjs/common';
import { MultimediaRepository } from '../../domain/multimedia.repository';

@Injectable()
export class SetSeoTitleUseCase {
  constructor(private readonly repo: MultimediaRepository) {}

  async execute(id: string, seoTitle: string) {
    const m = await this.repo.findOne({ where: { id } });
    if (!m) throw new NotFoundException('Archivo multimedia no encontrado');
    m.seoTitle = seoTitle;
    return await this.repo.save(m);
  }
}