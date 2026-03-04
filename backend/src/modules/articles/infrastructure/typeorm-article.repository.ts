import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { ArticleRepository } from '../domain/article.repository';
import { Article } from '../domain/article.entity';

@Injectable()
export class TypeormArticleRepository extends ArticleRepository {
  constructor(
    @InjectRepository(Article)
    private readonly repository: Repository<Article>,
  ) {
    super();
  }

  create(data: Partial<Article>): Article {
    return (this.repository.create(data as any) as unknown) as Article;
  }

  async save(article: Article): Promise<Article> {
    return this.repository.save(article as any);
  }

  async find(options?: any): Promise<Article[]> {
    return this.repository.find(options);
  }

  async findOne(options?: any): Promise<Article | null> {
    const found = await this.repository.findOne(options);
    return found || null;
  }

  async update(id: string, patch: Partial<Article>): Promise<void> {
    await this.repository.update(id, patch as any);
  }

  async softDelete(id: string): Promise<void> {
    await this.repository.softDelete(id);
  }

  createQueryBuilder(alias: string) {
    return this.repository.createQueryBuilder(alias);
  }
}
