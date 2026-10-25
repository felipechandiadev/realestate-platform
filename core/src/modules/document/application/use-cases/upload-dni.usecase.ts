import { Injectable, BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { UserRole } from '../../../users/domain/user.entity';
import type { Express } from 'express';
import { UploadDNIDto, CreateDocumentDto } from '../../dto/document.dto';
import { MultimediaService } from '../../../multimedia/application/multimedia.service';
import { DocumentRepository } from '../../domain/document.repository';
import { Document } from '../../domain/document.entity';
import { MultimediaType } from '../../../multimedia/domain/multimedia.entity';
import { DocumentStatus } from '../../domain/document.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { PersonOrmEntity } from '../../../person/infrastructure/persistence/person.orm-entity';
import { DocumentTypeOrmEntity } from '../../../document-types/infrastructure/persistence/document-type.orm-entity';

@Injectable()
export class UploadDniUseCase {
  constructor(
    private readonly multimediaService: MultimediaService,
    private readonly documentRepository: DocumentRepository,
    @InjectRepository(PersonOrmEntity)
    private readonly personRepository: Repository<PersonOrmEntity>,
    @InjectRepository(DocumentTypeOrmEntity)
    private readonly documentTypeRepository: Repository<DocumentTypeOrmEntity>,
  ) {}

  async execute(
    file: Express.Multer.File,
    uploadDto: UploadDNIDto & { uploadedById: string },
    actor?: { id?: string; role?: string },
  ): Promise<Document> {
    if (!file.mimetype.startsWith('image/')) {
      throw new BadRequestException('Solo se permiten archivos de imagen para DNI');
    }

    const person = await this.personRepository.findOne({
      where: { id: uploadDto.personId, deletedAt: IsNull() },
      relations: ['dniCardFront', 'dniCardRear'],
    });
    if (!person) {
      throw new NotFoundException('Persona no encontrada');
    }
    // Un cliente del portal solo puede cambiar el carnet de su propia ficha.
    if (actor?.role === UserRole.COMMUNITY && person.userId !== actor.id) {
      throw new ForbiddenException('Solo puedes subir el carnet de tu propia ficha');
    }

    const multimediaType = uploadDto.dniSide === 'FRONT' ? MultimediaType.DNI_FRONT : MultimediaType.DNI_REAR;
    const sideLabel = uploadDto.dniSide === 'FRONT' ? 'Frontal' : 'Trasero';
    const documentTypeQuery = uploadDto.dniSide === 'FRONT' ? 'DNI Frontal' : 'DNI Trasero';
    const title = `DNI ${sideLabel}`;

    const multimediaMetadata = {
      type: multimediaType,
      seoTitle: title,
    };

    const multimedia = await this.multimediaService.uploadFile(
      file,
      multimediaMetadata,
      uploadDto.uploadedById,
    );

    const dniDocumentType = await this.documentTypeRepository.findOne({ where: { name: documentTypeQuery } });
    if (!dniDocumentType) {
      throw new NotFoundException(`Tipo de documento "${documentTypeQuery}" no encontrado en el sistema. Por favor, ejecute los seeders.`);
    }

    const createDocumentDto: CreateDocumentDto = {
      title,
      documentTypeId: dniDocumentType.id,
      multimediaId: multimedia.id,
      uploadedById: uploadDto.uploadedById,
      personId: uploadDto.personId,
      status: uploadDto.status || DocumentStatus.UPLOADED,
    };

    const document = this.documentRepository.create({
      ...createDocumentDto as any,
      multimedia,
    });

    // update person record with dni
    if (uploadDto.dniSide === 'FRONT') {
      person.dniCardFront = multimedia;
    } else {
      person.dniCardRear = multimedia;
    }
    await this.personRepository.save(person);

    return await this.documentRepository.save(document);
  }
}
