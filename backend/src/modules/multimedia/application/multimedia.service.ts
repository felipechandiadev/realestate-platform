import { Injectable, NotFoundException } from '@nestjs/common';
import { Multimedia } from '../domain/multimedia.entity';
import { CreateMultimediaDto, UpdateMultimediaDto } from '../dto/multimedia.dto';
import { MultimediaUploadMetadata } from '../interfaces/multimedia.interface';
// use-cases
import { CreateMultimediaUseCase } from './use-cases/create-multimedia.usecase';
import { FindAllMultimediaUseCase } from './use-cases/find-all-multimedia.usecase';
import { GetMultimediaUseCase } from './use-cases/get-multimedia.usecase';
import { UpdateMultimediaUseCase } from './use-cases/update-multimedia.usecase';
import { SoftDeleteMultimediaUseCase } from './use-cases/soft-delete-multimedia.usecase';
import { HardDeleteMultimediaUseCase } from './use-cases/hard-delete-multimedia.usecase';
import { GetUrlUseCase } from './use-cases/get-url.usecase';
import { SetSeoTitleUseCase } from './use-cases/set-seo-title.usecase';
import { MultimediaStorageService } from '../infrastructure/storage/multimedia-storage.service';

@Injectable()
export class MultimediaService {
  constructor(
    private readonly createUseCase: CreateMultimediaUseCase,
    private readonly findAllUseCase: FindAllMultimediaUseCase,
    private readonly getUseCase: GetMultimediaUseCase,
    private readonly updateUseCase: UpdateMultimediaUseCase,
    private readonly softDeleteUseCase: SoftDeleteMultimediaUseCase,
    private readonly hardDeleteUseCase: HardDeleteMultimediaUseCase,
    private readonly getUrlUseCase: GetUrlUseCase,
    private readonly setSeoTitleUseCase: SetSeoTitleUseCase,
    // legacy upload provider (contains helper methods used across the codebase)
    private readonly uploadProvider: MultimediaStorageService,
  ) {}

  async create(createMultimediaDto: CreateMultimediaDto): Promise<Multimedia> {
    const m: Multimedia = {
      id: undefined as any,
      filename: createMultimediaDto.filename,
      url: createMultimediaDto.url,
      type: createMultimediaDto.type,
      format: createMultimediaDto.format,
      fileSize: createMultimediaDto.fileSize,
      seoTitle: createMultimediaDto.seoTitle,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    } as any;
    return this.createUseCase.execute(m);
  }

  async findAll(): Promise<Multimedia[]> {
    return await this.findAllUseCase.execute();
  }

  async findOne(id: string): Promise<Multimedia> {
    return this.getUseCase.execute(id);
  }

  async update(
    id: string,
    updateMultimediaDto: UpdateMultimediaDto,
  ): Promise<Multimedia> {
    return this.updateUseCase.execute(id, updateMultimediaDto as any);
  }

  async softDelete(id: string): Promise<void> {
    await this.softDeleteUseCase.execute(id);
  }

  async hardDelete(id: string): Promise<void> {
    await this.hardDeleteUseCase.execute(id);
  }

  async getUrl(id: string): Promise<string> {
    return this.getUrlUseCase.execute(id);
  }

  async setSeoTitle(id: string, seoTitle: string): Promise<Multimedia> {
    return this.setSeoTitleUseCase.execute(id, seoTitle);
  }

  async uploadFile(
    file: Express.Multer.File,
    metadata: MultimediaUploadMetadata,
    userId?: string,
  ): Promise<Multimedia> {
    return this.uploadProvider.uploadFile(file, metadata, userId);
  }

  // Backwards-compatible helpers delegating to the legacy upload provider
  async uploadFileToPath(file: Express.Multer.File, uploadPath: string): Promise<string> {
    return await this.uploadProvider.uploadFileToPath(file, uploadPath);
  }

  async deleteFileByUrl(publicUrl: string): Promise<void> {
    return await this.uploadProvider.deleteFileByUrl(publicUrl);
  }

  async deleteFile(id: string): Promise<void> {
    return await this.uploadProvider.deleteFile(id);
  }

  // TODO: Implement linkToEntity and unlinkFromEntity methods
}
