import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Testimonial } from '../domain/testimonial.entity';
import {
  CreateTestimonialDto,
  UpdateTestimonialDto,
} from '../dto/testimonial.dto';
import { MultimediaService as UploadMultimediaService } from '../../multimedia/application/multimedia.service';
import {
  MultimediaType,
} from '../../multimedia/domain/multimedia.entity';
import type { Express } from 'express';
import { TestimonialRepository } from '../domain/testimonial.repository';
import { ListPublicTestimonialsUseCase } from './use-cases/list-public-testimonials.usecase';
import { CreateTestimonialUseCase } from './use-cases/create-testimonial.usecase';
import { FindAllTestimonialsUseCase } from './use-cases/find-all-testimonials.usecase';
import { GetTestimonialUseCase } from './use-cases/get-testimonial.usecase';
import { UpdateTestimonialUseCase } from './use-cases/update-testimonial.usecase';
import { SoftDeleteTestimonialUseCase } from './use-cases/soft-delete-testimonial.usecase';

@Injectable()
export class TestimonialsService {
  // Listar testimonios públicos (activos y no eliminados)
  async listPublic(): Promise<Testimonial[]> {
    return this.listPublicUseCase.execute();
  }
  constructor(
    @InjectRepository(Testimonial)
    private readonly testimonialRepository: Repository<Testimonial>,
    private readonly uploadMultimediaService: UploadMultimediaService,
    private readonly listPublicUseCase: ListPublicTestimonialsUseCase,
    private readonly createUseCase: CreateTestimonialUseCase,
    private readonly findAllUseCase: FindAllTestimonialsUseCase,
    private readonly getUseCase: GetTestimonialUseCase,
    private readonly updateUseCase: UpdateTestimonialUseCase,
    private readonly softDeleteUseCase: SoftDeleteTestimonialUseCase,
  ) {}

  async create(createTestimonialDto: CreateTestimonialDto, file?: Express.Multer.File): Promise<Testimonial> {
    return this.createUseCase.execute(createTestimonialDto, file);
  }

  async findAll(): Promise<Testimonial[]> {
    return this.findAllUseCase.execute();
  }

  async findOne(id: string): Promise<Testimonial> {
    return this.getUseCase.execute(id);
  }

  async update(id: string, updateTestimonialDto: UpdateTestimonialDto, image?: Express.Multer.File): Promise<Testimonial> {
    return this.updateUseCase.execute(id, updateTestimonialDto, image);
  }

  async softDelete(id: string): Promise<void> {
    await this.softDeleteUseCase.execute(id);
  }
}
