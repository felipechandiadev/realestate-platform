import { Injectable, ConflictException } from '@nestjs/common';
import { ArticleRepository } from '../../domain/article.repository';
import { Article } from '../../domain/article.entity';
import { MultimediaService } from '../../../multimedia/application/multimedia.service';

@Injectable()
export class CreateArticleUseCase {
  constructor(
    private readonly repo: ArticleRepository,
    private readonly multimediaService: MultimediaService,
  ) {}

  async execute(dto: any, file?: Express.Multer.File): Promise<Article> {
    const existing = await this.repo.findOne({ where: { title: dto.title } });
    if (existing) throw new ConflictException('Ya existe un artículo con este título.');

    // allow DTO-provided `multimediaUrl` unless a file is uploaded
    let multimediaUrl: string | undefined = dto.multimediaUrl;
    if (file) {
      multimediaUrl = await this.multimediaService.uploadFileToPath(file, 'web/articles');
    }

    const article = this.repo.create({ ...dto, multimediaUrl });
    return this.repo.save(article);
  }
}
