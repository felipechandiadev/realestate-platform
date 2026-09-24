import { SelectQueryBuilder } from 'typeorm';
import { Article } from './article.entity';

export abstract class ArticleRepository {
  abstract create(data: Partial<Article>): Article;
  abstract save(article: Article): Promise<Article>;
  abstract find(options?: any): Promise<Article[]>;
  abstract findOne(options?: any): Promise<Article | null>;
  abstract update(id: string, patch: Partial<Article>): Promise<void>;
  abstract softDelete(id: string): Promise<void>;
  abstract createQueryBuilder(alias: string): SelectQueryBuilder<Article>;
}
