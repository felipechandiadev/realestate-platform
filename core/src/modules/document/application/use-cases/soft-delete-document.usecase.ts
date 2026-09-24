import { Injectable, BadRequestException } from '@nestjs/common';
import { DocumentRepository } from '../../domain/document.repository';
import { ContractRepository } from '../../../contracts/domain/contract.repository';
import { isFinalContractStatus } from '../../domain/contract-status.util';

@Injectable()
export class SoftDeleteDocumentUseCase {
  constructor(
    private readonly documentRepository: DocumentRepository,
    private readonly contractRepository: ContractRepository,
  ) {}

  async execute(id: string): Promise<void> {
    const doc = await this.documentRepository.findOne(id);
    if (!doc) {
      throw new BadRequestException('Documento no encontrado');
    }

    if (doc.contractId) {
      const contract = await this.contractRepository.findOne({ where: { id: doc.contractId } });
      const contractStatus = (contract as any)?.status;
      if (isFinalContractStatus(contractStatus)) {
        throw new BadRequestException('No se pueden eliminar documentos asociados a contratos cerrados o fallidos');
      }
    }

    await this.documentRepository.softDelete(id);
  }
}
