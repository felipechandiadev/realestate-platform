import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { ArticleRepository } from '../../domain/article.repository';
import { Article } from '../../domain/article.entity';
import { IsNull } from 'typeorm';
import { MultimediaService } from '../../../multimedia/application/multimedia.service';

@Injectable()
export class UpdateArticleUseCase {
  constructor(
    private readonly repo: ArticleRepository,
    private readonly multimediaService: MultimediaService,
  ) {}

  async execute(id: string, dto: any, file?: Express.Multer.File): Promise<Article> {
    const article = await this.repo.findOne({ where: { id, deletedAt: IsNull() } });
    if (!article) throw new NotFoundException('Artículo no encontrado.');

    if (dto.title && dto.title !== article.title) {
      const existing = await this.repo.findOne({ where: { title: dto.title } });
      if (existing) throw new ConflictException('Ya existe un artículo con este título.');
    }

    let multimediaUrl = article.multimediaUrl;
    if (file) {
      multimediaUrl = await this.multimediaService.uploadFileToPath(file, 'web/articles');
    }

    Object.assign(article, dto, { multimediaUrl });
    return this.repo.save(article);
  }
}
