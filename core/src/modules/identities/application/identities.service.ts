import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Identity } from '../domain/identity.entity';
import { CreateIdentityDto, UpdateIdentityDto } from '../dto/identity.dto';
import { MultimediaService } from '../../multimedia/application/multimedia.service';
import { StaticFilesService } from '../../multimedia/infrastructure/storage/static-files.service';
import { IdentityRepository } from '../domain/identity.repository';
import { CreateIdentityUseCase } from './use-cases/create-identity.usecase';
import { FindAllIdentitiesUseCase } from './use-cases/find-all-identities.usecase';
import { GetIdentityUseCase } from './use-cases/get-identity.usecase';
import { UpdateIdentityUseCase } from './use-cases/update-identity.usecase';
import { SoftDeleteIdentityUseCase } from './use-cases/soft-delete-identity.usecase';
import { ListPublicTestimonialsUseCase } from '../../testimonials/application/use-cases/list-public-testimonials.usecase';

@Injectable()
export class IdentitiesService {
  constructor(
    @InjectRepository(Identity)
    private readonly identityRepository: Repository<Identity>,
    private readonly multimediaService: MultimediaService,
    private readonly staticFilesService: StaticFilesService,
    private readonly createUseCase: CreateIdentityUseCase,
    private readonly findAllUseCase: FindAllIdentitiesUseCase,
    private readonly getUseCase: GetIdentityUseCase,
    private readonly updateUseCase: UpdateIdentityUseCase,
    private readonly softDeleteUseCase: SoftDeleteIdentityUseCase,
  ) {}

  async create(
    createIdentityDto: CreateIdentityDto,
    files?: {
      logo?: Express.Multer.File[];
      partnershipLogos?: Express.Multer.File[];
    },
  ): Promise<Identity> {
    return this.createUseCase.execute(createIdentityDto, files);
  }

  async findAll(): Promise<Identity[]> {
    return this.findAllUseCase.execute();
  }

  async findOne(id: string): Promise<Identity> {
    return this.getUseCase.execute(id);
  }

  async update(
    id: string,
    updateIdentityDto: UpdateIdentityDto,
    files?: {
      logo?: Express.Multer.File[];
      partnershipLogos?: Express.Multer.File[];
    },
  ): Promise<Identity> {
    return this.updateUseCase.execute(id, updateIdentityDto, files);
  }

  async findLast(): Promise<Identity | null> {
    // reuse findAll and take first
    const list = await this.findAll();
    return list.length ? list[0] : null;
  }

  async softDelete(id: string): Promise<void> {
    await this.softDeleteUseCase.execute(id);
  }

  async getLogoUrl(): Promise<{ logoUrl: string | null }> {
    const last = await this.findLast();
    return { logoUrl: last?.urlLogo ?? null };
  }
}
