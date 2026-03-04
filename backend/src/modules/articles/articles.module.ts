import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Article } from './domain/article.entity';
import { ArticlesService } from './application/articles.service';
import { ArticlesController } from './presentation/articles.controller';
import { MultimediaModule } from '../multimedia/multimedia.module';
import { TypeormArticleRepository } from './infrastructure/typeorm-article.repository';
import { ArticleRepository } from './domain/article.repository';
import { CreateArticleUseCase } from './application/use-cases/create-article.usecase';
import { FindAllArticlesUseCase } from './application/use-cases/find-all-articles.usecase';
import { GetArticleUseCase } from './application/use-cases/get-article.usecase';
import { UpdateArticleUseCase } from './application/use-cases/update-article.usecase';
import { SoftDeleteArticleUseCase } from './application/use-cases/soft-delete-article.usecase';
import { ToggleArticleActiveUseCase } from './application/use-cases/toggle-article-active.usecase';
import { FindRelatedArticlesUseCase } from './application/use-cases/find-related-articles.usecase';

@Module({
  imports: [
    TypeOrmModule.forFeature([Article]),
    MultimediaModule,
  ],
  controllers: [ArticlesController],
  providers: [
    ArticlesService,
    {
      provide: ArticleRepository,
      useClass: TypeormArticleRepository,
    },
    CreateArticleUseCase,
    FindAllArticlesUseCase,
    GetArticleUseCase,
    UpdateArticleUseCase,
    SoftDeleteArticleUseCase,
    ToggleArticleActiveUseCase,
    FindRelatedArticlesUseCase,
  ],
  exports: [ArticlesService],
})
export class ArticlesModule {}
