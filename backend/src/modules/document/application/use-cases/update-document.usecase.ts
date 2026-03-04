import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Document } from '../../domain/document.entity';
import { UpdateDocumentDto } from '../../dto/document.dto';
import { DocumentRepository } from '../../domain/document.repository';
import { DocumentTypeOrmEntity } from '../../../document-types/infrastructure/persistence/document-type.orm-entity';
import { User } from '../../../users/domain/user.entity';
import { PersonOrmEntity } from '../../../person/infrastructure/persistence/person.orm-entity';
import { Multimedia } from '../../../multimedia/domain/multimedia.entity';

@Injectable()
export class UpdateDocumentUseCase {
  constructor(
    private readonly documentRepository: DocumentRepository,
    @InjectRepository(DocumentTypeOrmEntity)
    private readonly documentTypeRepository: Repository<DocumentTypeOrmEntity>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(PersonOrmEntity)
    private readonly personRepository: Repository<PersonOrmEntity>,
    @InjectRepository(Multimedia)
    private readonly multimediaRepository: Repository<Multimedia>,
  ) {}

  async execute(id: string, dto: UpdateDocumentDto): Promise<Document> {
    const document = await this.documentRepository.findOne(id);
    if (!document) {
      throw new NotFoundException('Documento no encontrado');
    }

    const {
      documentTypeId,
      multimediaId,
      uploadedById,
      personId,
      required,
      ...directFields
    } = dto;
    Object.assign(document, directFields);

    if (typeof required === 'boolean') {
      document.required = required;
    }

    if (documentTypeId) {
      const documentType = await this.documentTypeRepository.findOne({ where: { id: documentTypeId } });
      if (!documentType) {
        throw new NotFoundException('Tipo de documento no encontrado');
      }
      document.documentType = documentType;
    }

    if (uploadedById) {
      const uploadedBy = await this.userRepository.findOne({ where: { id: uploadedById } });
      if (!uploadedBy) {
        throw new NotFoundException('Usuario no encontrado');
      }
      document.uploadedBy = uploadedBy;
    }

    if (personId !== undefined) {
      if (personId) {
        const person = await this.personRepository.findOne({ where: { id: personId } });
        if (!person) {
          throw new NotFoundException('Persona no encontrada');
        }
        document.person = person;
      } else {
        document.person = undefined;
      }
    }

    if (multimediaId !== undefined) {
      if (multimediaId) {
        const multimedia = await this.multimediaRepository.findOne({ where: { id: multimediaId } });
        if (!multimedia) {
          throw new NotFoundException('Multimedia no encontrado');
        }
        document.multimedia = multimedia;
      } else {
        document.multimedia = undefined;
      }
    }

    return this.documentRepository.save(document);
  }
}
