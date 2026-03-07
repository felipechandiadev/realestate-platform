import { Injectable } from '@nestjs/common';
import { ArticleRepository } from '../../domain/article.repository';
import { Article } from '../../domain/article.entity';

@Injectable()
export class FindAllArticlesUseCase {
  constructor(private readonly repo: ArticleRepository) {}

  async execute(search?: string, category?: string): Promise<Article[]> {
    const query = this.repo.createQueryBuilder('article')
      .where('article.deletedAt IS NULL')
      .andWhere('article.isActive = :isActive', { isActive: true })
      .orderBy('article.createdAt', 'DESC');

    if (search) {
      query.andWhere(
        '(article.title LIKE :search OR article.subtitle LIKE :search OR article.text LIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (category) {
      query.andWhere('article.category LIKE :category', { category: `%${category}%` });
    }

    const results = await query.getMany();
    return results;
  }
}
