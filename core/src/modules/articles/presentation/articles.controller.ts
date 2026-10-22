import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ValidationPipe,
  UseInterceptors,
  UploadedFile,
  Query,
  Req,
  NotFoundException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
  ApiQuery,
  ApiConsumes,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { DEFAULT_UPLOAD_OPTIONS } from '../../../shared/upload/upload-limits';
import { ArticlesService } from '../application/articles.service';
import { CreateArticleDto, UpdateArticleDto } from '../dto/article.dto';
import { Roles, Public } from '../../auth/guards/jwt-auth.guard';
import { UserRole } from '../../users/domain/user.entity';

const isStaffRequest = (req?: { user?: { role?: string } }): boolean =>
  req?.user?.role === UserRole.ADMIN || req?.user?.role === UserRole.AGENT;

/** Para visitantes (no staff) solo se muestran artículos activos. */
export function filterArticlesForAudience<T extends { isActive?: boolean }>(
  articles: T[],
  isStaff: boolean,
): T[] {
  if (isStaff || !Array.isArray(articles)) return articles;
  return articles.filter((a) => Boolean(a?.isActive));
}

@Roles(UserRole.ADMIN, UserRole.AGENT)
@Controller('articles')
@ApiTags('Articles')
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  /**
   * Create a new article with optional image
   */
  @Post()
  @ApiOperation({ summary: 'Create new article' })
  @ApiResponse({
    status: 201,
    description: 'Article created successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        content: { type: 'string' },
        category: { type: 'string' },
        image: { type: 'string', format: 'binary' },
      },
    },
  })
  @UseInterceptors(FileInterceptor('image', DEFAULT_UPLOAD_OPTIONS))
  create(
    @Body(ValidationPipe) createArticleDto: CreateArticleDto,
    @UploadedFile() image?: Express.Multer.File,
  ) {
    return this.articlesService.create(createArticleDto, image);
  }

  /**
   * Get all articles with optional filters
   */
  @Public()
  @Get()
  @ApiOperation({ summary: 'Get all articles' })
  @ApiResponse({
    status: 200,
    description: 'List of articles',
  })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'category', required: false })
  async findAll(
    @Query('search') search?: string,
    @Query('category') category?: string,
    @Req() req?: any,
  ) {
    const articles = await this.articlesService.findAll(search, category);
    return filterArticlesForAudience(articles, isStaffRequest(req));
  }

  /**
   * Get article by ID with related articles
   */
  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get article by ID with related articles' })
  @ApiResponse({
    status: 200,
    description: 'Article details with related articles',
  })
  @ApiResponse({
    status: 404,
    description: 'Article not found',
  })
  @ApiParam({ name: 'id', type: String })
  async findOne(@Param('id') id: string, @Req() req?: any) {
    const isStaff = isStaffRequest(req);
    const article = await this.articlesService.findOne(id);
    if (!isStaff && !article?.isActive) {
      throw new NotFoundException('Artículo no encontrado');
    }
    const relatedArticles = filterArticlesForAudience(
      await this.articlesService.findRelated(id, 4),
      isStaff,
    );

    return {
      ...article,
      relatedArticles,
    };
  }

  /**
   * Update article with optional image
   */
  @Patch(':id')
  @ApiOperation({ summary: 'Update article' })
  @ApiResponse({
    status: 200,
    description: 'Article updated successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Article not found',
  })
  @ApiParam({ name: 'id', type: String })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        content: { type: 'string' },
        category: { type: 'string' },
        image: { type: 'string', format: 'binary' },
      },
    },
  })
  @UseInterceptors(FileInterceptor('image', DEFAULT_UPLOAD_OPTIONS))
  update(
    @Param('id') id: string,
    @Body(ValidationPipe) updateArticleDto: UpdateArticleDto,
    @UploadedFile() image?: Express.Multer.File,
  ) {
    return this.articlesService.update(id, updateArticleDto, image);
  }

  /**
   * Delete article (soft delete)
   */
  @Delete(':id')
  @ApiOperation({ summary: 'Delete article' })
  @ApiResponse({
    status: 200,
    description: 'Article deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Article not found',
  })
  @ApiParam({ name: 'id', type: String })
  softDelete(@Param('id') id: string) {
    return this.articlesService.softDelete(id);
  }

  /**
   * Toggle article active status
   */
  @Patch(':id/toggle-active')
  @ApiOperation({ summary: 'Toggle article active status' })
  @ApiResponse({
    status: 200,
    description: 'Active status toggled',
  })
  @ApiParam({ name: 'id', type: String })
  @ApiBody({
    schema: {
      example: { isActive: true },
    },
  })
  toggleActive(
    @Param('id') id: string,
    @Body() body: { isActive: boolean },
  ) {
    return this.articlesService.toggleActive(id, body.isActive);
  }
}
