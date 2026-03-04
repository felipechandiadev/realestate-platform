import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { AboutUs } from '../domain/about-us.entity';
import { CreateAboutUsDto, UpdateAboutUsDto } from '../dto/about-us.dto';
import { MultimediaService } from '../../multimedia/application/multimedia.service';
import { StaticFilesService } from '../../multimedia/infrastructure/storage/static-files.service';
import { CreateAboutUsUseCase } from '../application/use-cases/create-about-us.usecase';
import { FindAllAboutUsUseCase } from '../application/use-cases/find-all-about-us.usecase';
import { FindOneAboutUsUseCase } from '../application/use-cases/find-one-about-us.usecase';
import { UpdateAboutUsUseCase } from '../application/use-cases/update-about-us.usecase';
import { SoftDeleteAboutUsUseCase } from '../application/use-cases/soft-delete-about-us.usecase';
import { AboutUsRepository } from '../domain/about-us.repository';

@Injectable()
export class AboutUsService {
  private readonly logger = new Logger(AboutUsService.name);

  constructor(
    private readonly createAboutUs: CreateAboutUsUseCase,
    private readonly findAllAboutUs: FindAllAboutUsUseCase,
    private readonly findOneAboutUs: FindOneAboutUsUseCase,
    private readonly updateAboutUs: UpdateAboutUsUseCase,
    private readonly softDeleteAboutUs: SoftDeleteAboutUsUseCase,
    private readonly multimediaService: MultimediaService,
    private readonly staticFilesService: StaticFilesService,
    private readonly repo: AboutUsRepository,
  ) {}

  async create(createAboutUsDto: CreateAboutUsDto): Promise<AboutUs> {
    try {
      this.logger.log('Creating AboutUs with data:', createAboutUsDto);
      const entity = this.createAboutUs.execute(createAboutUsDto as any);
      const saved = await this.repo.save(entity);
      this.logger.log('AboutUs created successfully:', saved.id);
      return saved;
    } catch (error) {
      this.logger.error('Error in create:', error);
      throw error;
    }
  }

  async findAll(): Promise<AboutUs[]> {
    try {
      this.logger.log('Fetching all AboutUs entries');
      const result = await this.findAllAboutUs.execute();
      this.logger.log('Found AboutUs entries:', result.length);
      return result;
    } catch (error) {
      this.logger.error('Error in findAll:', error);
      throw error;
    }
  }

  async findOne(): Promise<AboutUs> {
    try {
      this.logger.log('Fetching one AboutUs entry');
      const result = await this.findOneAboutUs.execute();
      this.logger.log('Found AboutUs:', result?.id);
      return result;
    } catch (error) {
      this.logger.error('Error in findOne:', error);
      throw error;
    }
  }

  async findById(id: string): Promise<AboutUs> {
    try {
      this.logger.log('Finding AboutUs by id:', id);
      const about = await this.repo.findOne({ where: { id } });
      if (!about || about.deletedAt) {
        this.logger.warn('AboutUs not found:', id);
        throw new NotFoundException('About us not found');
      }
      this.logger.log('Found AboutUs:', id);
      return about;
    } catch (error) {
      this.logger.error('Error in findById:', error);
      throw error;
    }
  }

  async updateById(id: string, updateAboutUsDto: UpdateAboutUsDto): Promise<AboutUs> {
    try {
      this.logger.log('Updating AboutUs by id:', id, 'Data:', updateAboutUsDto);
      const about = await this.repo.findOne({ where: { id } });
      if (!about || about.deletedAt) {
        this.logger.warn('AboutUs not found for update:', id);
        throw new NotFoundException('About us not found');
      }

      Object.assign(about, updateAboutUsDto as any);
      const saved = await this.repo.save(about);
      this.logger.log('AboutUs updated successfully:', id);
      return saved;
    } catch (error) {
      this.logger.error('Error in updateById:', error);
      throw error;
    }
  }

  async softDelete(): Promise<void> {
    try {
      this.logger.log('Soft deleting AboutUs');
      await this.softDeleteAboutUs.execute();
      this.logger.log('AboutUs soft deleted successfully');
    } catch (error) {
      this.logger.error('Error in softDelete:', error);
      throw error;
    }
  }

  async softDeleteById(id: string): Promise<void> {
    try {
      this.logger.log('Soft deleting AboutUs by id:', id);
      await this.repo.softDelete(id);
      this.logger.log('AboutUs soft deleted successfully:', id);
    } catch (error) {
      this.logger.error('Error in softDeleteById:', error);
      throw error;
    }
  }

  async findLatest(): Promise<AboutUs | null> {
    try {
      this.logger.log('Finding latest AboutUs');
      const all = await this.findAll();
      const latest = all.length ? all[0] : null;
      this.logger.log('Found latest AboutUs:', latest?.id);
      return latest;
    } catch (error) {
      this.logger.error('Error in findLatest:', error);
      throw error;
    }
  }
}
