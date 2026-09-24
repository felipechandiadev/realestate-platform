import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Slide } from '../domain/slide.entity';
import { MultimediaService } from '../../multimedia/application/multimedia.service';
import { StaticFilesService } from '../../multimedia/infrastructure/storage/static-files.service';
import { SlideRepository } from '../domain/slide.repository';
import { CreateSlideUseCase } from './use-cases/create-slide.usecase';
import { CreateSlideWithMultimediaUseCase } from './use-cases/create-slide-with-multimedia.usecase';
import { FindAllSlidesUseCase } from './use-cases/find-all-slides.usecase';
import { FindActiveSlidesUseCase } from './use-cases/find-active-slides.usecase';
import { FindPublicActiveSlidesUseCase } from './use-cases/find-public-active-slides.usecase';
import { GetSlideUseCase } from './use-cases/get-slide.usecase';
import { UpdateSlideUseCase } from './use-cases/update-slide.usecase';
import { SoftDeleteSlideUseCase } from './use-cases/soft-delete-slide.usecase';
import { ToggleSlideStatusUseCase } from './use-cases/toggle-slide-status.usecase';
import { ReorderSlidesUseCase } from './use-cases/reorder-slides.usecase';
import { GetMaxOrderUseCase } from './use-cases/get-max-order.usecase';
import { UpdateSlideWithMultimediaUseCase } from './use-cases/update-slide-with-multimedia.usecase';


@Injectable()
export class SlideService {
  constructor(
    @InjectRepository(Slide)
    private slideRepository: Repository<Slide>,
    private multimediaService: MultimediaService,
    private staticFilesService: StaticFilesService,
    private readonly createSlideUseCase: CreateSlideUseCase,
    private readonly createWithMultimediaUseCase: CreateSlideWithMultimediaUseCase,
    private readonly findAllUseCase: FindAllSlidesUseCase,
    private readonly findActiveUseCase: FindActiveSlidesUseCase,
    private readonly findPublicActiveUseCase: FindPublicActiveSlidesUseCase,
    private readonly getSlideUseCase: GetSlideUseCase,
    private readonly updateSlideUseCase: UpdateSlideUseCase,
    private readonly softDeleteUseCase: SoftDeleteSlideUseCase,
    private readonly toggleStatusUseCase: ToggleSlideStatusUseCase,
    private readonly reorderUseCase: ReorderSlidesUseCase,
    private readonly getMaxOrderUseCase: GetMaxOrderUseCase,
    private readonly updateWithMultimediaUseCase: UpdateSlideWithMultimediaUseCase,
  ) {}

  async create(createSlideDto: any): Promise<Slide> {
    return this.createSlideUseCase.execute(createSlideDto);
  }

  async createWithMultimedia(createSlideDto: any, file?: Express.Multer.File): Promise<Slide> {
    return this.createWithMultimediaUseCase.execute(createSlideDto, file);
  }

  async findAll(search?: string): Promise<Slide[]> {
    return this.findAllUseCase.execute(search);
  }

  async findActive(search?: string): Promise<Slide[]> {
    return this.findActiveUseCase.execute(search);
  }

  async findPublicActive(): Promise<Slide[]> {
    return this.findPublicActiveUseCase.execute();
  }

  async findOne(id: string): Promise<Slide> {
    return this.getSlideUseCase.execute(id);
  }

  async update(id: string, updateSlideDto: any): Promise<Slide> {
    return this.updateSlideUseCase.execute(id, updateSlideDto);
  }

  async remove(id: string): Promise<void> {
    await this.softDeleteUseCase.execute(id);
  }

  async toggleStatus(id: string): Promise<Slide> {
    return this.toggleStatusUseCase.execute(id);
  }

  async reorder(slideIds: string[]): Promise<void> {
    await this.reorderUseCase.execute(slideIds);
  }

  async getMaxOrder(): Promise<number> {
    return this.getMaxOrderUseCase.execute();
  }

  async updateWithMultimedia(
    id: string,
    updateSlideDto: any,
    file?: Express.Multer.File,
  ): Promise<Slide> {
    return this.updateWithMultimediaUseCase.execute(id, updateSlideDto, file);
  }
}