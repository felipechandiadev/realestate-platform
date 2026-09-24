import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Testimonial } from './domain/testimonial.entity';
import { TestimonialsService } from './application/testimonials.service';
import { TestimonialsController } from './presentation/testimonials.controller';
import { MultimediaModule } from '../multimedia/multimedia.module';
import { TestimonialRepository } from './domain/testimonial.repository';
import { TypeormTestimonialRepository } from './infrastructure/typeorm-testimonial.repository';
import { ListPublicTestimonialsUseCase } from './application/use-cases/list-public-testimonials.usecase';
import { CreateTestimonialUseCase } from './application/use-cases/create-testimonial.usecase';
import { FindAllTestimonialsUseCase } from './application/use-cases/find-all-testimonials.usecase';
import { GetTestimonialUseCase } from './application/use-cases/get-testimonial.usecase';
import { UpdateTestimonialUseCase } from './application/use-cases/update-testimonial.usecase';
import { SoftDeleteTestimonialUseCase } from './application/use-cases/soft-delete-testimonial.usecase';

@Module({
  imports: [TypeOrmModule.forFeature([Testimonial]), MultimediaModule],
  controllers: [TestimonialsController],
  providers: [
    TestimonialsService,
    TypeormTestimonialRepository,
    {
      provide: TestimonialRepository,
      useExisting: TypeormTestimonialRepository,
    },
    ListPublicTestimonialsUseCase,
    CreateTestimonialUseCase,
    FindAllTestimonialsUseCase,
    GetTestimonialUseCase,
    UpdateTestimonialUseCase,
    SoftDeleteTestimonialUseCase,
  ],
  exports: [TestimonialsService],
})
export class TestimonialsModule {}
