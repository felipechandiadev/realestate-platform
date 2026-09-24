import { Injectable, NotFoundException } from '@nestjs/common';
import { ArticleRepository } from '../../domain/article.repository';
import { IsNull } from 'typeorm';

@Injectable()
export class SoftDeleteArticleUseCase {
  constructor(private readonly repo: ArticleRepository) {}

  async execute(id: string): Promise<void> {
    const article = await this.repo.findOne({ where: { id, deletedAt: IsNull() } });
    if (!article) throw new NotFoundException('Artículo no encontrado.');
    await this.repo.softDelete(id);
  }
}
