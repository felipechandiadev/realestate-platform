import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Document } from '../../domain/document.entity';
import {
  CreateDocumentDto,
} from '../../dto/document.dto';
import { DocumentRepository } from '../../domain/document.repository';
import { ContractRepository } from '../../../contracts/domain/contract.repository';
import { User } from '../../../users/domain/user.entity';
import { PersonOrmEntity } from '../../../person/infrastructure/persistence/person.orm-entity';
import { Multimedia } from '../../../multimedia/domain/multimedia.entity';
import { DocumentTypeOrmEntity } from '../../../document-types/infrastructure/persistence/document-type.orm-entity';
import { Payment } from '../../../contracts/domain/payment.entity';
import { isFinalContractStatus } from '../../domain/contract-status.util';

@Injectable()
export class CreateDocumentUseCase {
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
    private readonly contractRepository: ContractRepository,
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
  ) {}

  async execute(createDocumentDto: CreateDocumentDto): Promise<Document> {
    const {
      documentTypeId,
      multimediaId,
      uploadedById,
      personId,
      paymentId,
      contractId,
      required,
      ...directFields
    } = createDocumentDto;

    const documentType = await this.documentTypeRepository.findOne({ where: { id: documentTypeId } });
    if (!documentType) {
      throw new NotFoundException('Tipo de documento no encontrado');
    }

    const uploadedBy = await this.userRepository.findOne({ where: { id: uploadedById } });
    if (!uploadedBy) {
      throw new NotFoundException('Usuario no encontrado');
    }

    let person: PersonOrmEntity | undefined;
    if (personId) {
      const foundPerson = await this.personRepository.findOne({ where: { id: personId }, withDeleted: false });
      if (!foundPerson) {
        throw new NotFoundException('Persona no encontrada');
      }
      person = foundPerson;
    }

    let multimedia: Multimedia | undefined;
    if (multimediaId) {
      const foundMultimedia = await this.multimediaRepository.findOne({ where: { id: multimediaId } });
      if (!foundMultimedia) {
        throw new NotFoundException('Multimedia no encontrado');
      }
      multimedia = foundMultimedia;
    }

    let resolvedContractId = contractId;
    if (paymentId) {
      const payment = await this.paymentRepository.findOne({ where: { id: paymentId, deletedAt: IsNull() } });
      if (!payment) {
        throw new NotFoundException('Pago no encontrado');
      }
      resolvedContractId ??= payment.contractId;
    }

    if (resolvedContractId) {
      const contract = await this.contractRepository.findOne({ where: { id: resolvedContractId, deletedAt: IsNull() } });
      if (!contract) {
        throw new NotFoundException('Contrato no encontrado');
      }

      const isPlaceholderContractDocument = !paymentId && !multimediaId;
      if (isPlaceholderContractDocument && isFinalContractStatus(contract.status)) {
        throw new BadRequestException('No se pueden registrar nuevos documentos en contratos cerrados o fallidos');
      }
    }

    const document = this.documentRepository.create({
      ...directFields,
      documentType,
      documentTypeId,
      multimedia,
      multimediaId: multimedia?.id ?? multimediaId,
      uploadedBy,
      uploadedById,
      person,
      personId: person?.id ?? personId,
      paymentId,
      contractId: resolvedContractId,
      required: required === true,
    });

    return await this.documentRepository.save(document);
  }
}
