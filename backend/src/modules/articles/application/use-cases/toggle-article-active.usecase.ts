import { Injectable, NotFoundException } from '@nestjs/common';
import { ArticleRepository } from '../../domain/article.repository';
import { IsNull } from 'typeorm';
import { Article } from '../../domain/article.entity';

@Injectable()
export class ToggleArticleActiveUseCase {
  constructor(private readonly repo: ArticleRepository) {}

  async execute(id: string, isActive: boolean): Promise<Article> {
    const article = await this.repo.findOne({ where: { id, deletedAt: IsNull() } });
    if (!article) throw new NotFoundException('Artículo no encontrado.');
    article.isActive = isActive;
    return this.repo.save(article);
  }
}
