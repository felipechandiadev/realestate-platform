import { Injectable, NotFoundException } from '@nestjs/common';
import { ArticleRepository } from '../../domain/article.repository';
import { Article } from '../../domain/article.entity';
import { IsNull } from 'typeorm';

@Injectable()
export class GetArticleUseCase {
  constructor(private readonly repo: ArticleRepository) {}

  async execute(id: string): Promise<Article> {
    const article = await this.repo.findOne({ where: { id, deletedAt: IsNull() } });
    if (!article) throw new NotFoundException('Artículo no encontrado.');
    return article;
  }
}
