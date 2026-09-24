import {
  Injectable,
} from '@nestjs/common';
import { Article } from '../domain/article.entity';
import { CreateArticleDto, UpdateArticleDto } from '../dto/article.dto';
import { CreateArticleUseCase } from './use-cases/create-article.usecase';
import { FindAllArticlesUseCase } from './use-cases/find-all-articles.usecase';
import { GetArticleUseCase } from './use-cases/get-article.usecase';
import { UpdateArticleUseCase } from './use-cases/update-article.usecase';
import { SoftDeleteArticleUseCase } from './use-cases/soft-delete-article.usecase';
import { ToggleArticleActiveUseCase } from './use-cases/toggle-article-active.usecase';
import { FindRelatedArticlesUseCase } from './use-cases/find-related-articles.usecase';

@Injectable()
export class ArticlesService {
  constructor(
    private readonly createUseCase: CreateArticleUseCase,
    private readonly findAllUseCase: FindAllArticlesUseCase,
    private readonly getUseCase: GetArticleUseCase,
    private readonly updateUseCase: UpdateArticleUseCase,
    private readonly softDeleteUseCase: SoftDeleteArticleUseCase,
    private readonly toggleActiveUseCase: ToggleArticleActiveUseCase,
    private readonly findRelatedUseCase: FindRelatedArticlesUseCase,
  ) {}

  async create(createArticleDto: CreateArticleDto, file?: Express.Multer.File): Promise<Article> {
    return this.createUseCase.execute(createArticleDto, file);
  }

  async findAll(search?: string, category?: string): Promise<Article[]> {
    return this.findAllUseCase.execute(search, category);
  }

  async findOne(id: string): Promise<Article> {
    return this.getUseCase.execute(id);
  }

  async update(id: string, updateArticleDto: UpdateArticleDto, file?: Express.Multer.File): Promise<Article> {
    return this.updateUseCase.execute(id, updateArticleDto, file);
  }

  async softDelete(id: string): Promise<void> {
    await this.softDeleteUseCase.execute(id);
  }

  async toggleActive(id: string, isActive: boolean): Promise<Article> {
    return this.toggleActiveUseCase.execute(id, isActive);
  }

  /**
   * Encuentra artículos relacionados basado en múltiples criterios (estrategia robusta)
   * Criterios: categoría (100), palabras clave (75), fecha cercana (50), reciente (10)
   */
  async findRelated(currentArticleId: string, limit: number = 4): Promise<Article[]> {
    return this.findRelatedUseCase.execute(currentArticleId, limit);
  }

  /**
   * Cuenta palabras comunes entre dos strings (palabras > 3 caracteres)
   */
}
