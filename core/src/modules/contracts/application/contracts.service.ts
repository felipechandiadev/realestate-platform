import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as ExcelJS from 'exceljs';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, IsNull, Repository } from 'typeorm';
import { runInTransaction } from '../../../shared/database/run-in-transaction';
import { ContractRepository } from '../domain/contract.repository';
import { Contract, ContractStatus } from '../domain/contract.entity';
import {
  assertContractTransition,
  defaultPaymentCurrency,
  propertyStatusForContract,
} from '../domain/contract-rules';
import { PropertyStatus } from '../../../shared/enums/property-status.enum';
import { CreateContractUseCase } from './use-cases/create-contract.usecase';
import { FindContractUseCase } from './use-cases/find-contract.usecase';
import { ChangeContractStatusUseCase } from './use-cases/change-contract-status.usecase';
import { DeleteContractUseCase } from './use-cases/delete-contract.usecase';
import { UpdateContractUseCase } from './use-cases/update-contract.usecase';
import { CloseContractUseCase } from './use-cases/close-contract.usecase';
import { FailContractUseCase } from './use-cases/fail-contract.usecase';
import { FindAllContractsUseCase } from './use-cases/find-all-contracts.usecase';
import { AddPaymentUseCase } from './use-cases/add-payment.usecase';
import { AddPersonUseCase } from './use-cases/add-person.usecase';
import { GetPeopleByRoleUseCase } from './use-cases/get-people-by-role.usecase';
import { ValidateRequiredRolesUseCase } from './use-cases/validate-required-roles.usecase';
import { Payment, PaymentStatus, PaymentType } from '../domain/payment.entity';
import {
  AddPaymentDto,
  AddPersonDto,
  CloseContractDto,
  CreateContractDto,
  UpdateContractAgentDto,
  UpdateContractDto,
  UploadContractDocumentDto,
  UploadPaymentDocumentDto,
} from '../dto/contract.dto';
import { Person } from '../../person/domain/person.entity';
import { PersonOrmEntity } from '../../person/infrastructure/persistence/person.orm-entity';
import { User } from '../../users/domain/user.entity';
import { Property } from '../../property/domain/property.entity';
import { NotificationsService } from '../../notifications/application/notifications.service';
import {
  Document as DocumentEntity,
  DocumentStatus,
} from '../../document/domain/document.entity';
import { MultimediaService } from '../../multimedia/application/multimedia.service';
import { MultimediaType } from '../../multimedia/domain/multimedia.entity';
import { DocumentTypeOrmEntity } from '../../document-types/infrastructure/persistence/document-type.orm-entity';
import { ContractRole } from '../domain/contract.entity';
import { ContractPerson } from '../domain/contract.entity';
import { AuditService } from '../../audit/application/audit.service';
import {
  AuditAction,
  AuditEntityType,
  RequestSource,
} from '../../../shared/enums/audit.enums';

@Injectable()
export class ContractsService {
  constructor(
    private readonly contractRepository: ContractRepository,
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    private readonly createContract: CreateContractUseCase,
    private readonly findContract: FindContractUseCase,
    private readonly changeContractStatus: ChangeContractStatusUseCase,
    private readonly deleteContract: DeleteContractUseCase,
    private readonly updateContract: UpdateContractUseCase,
    private readonly closeContract: CloseContractUseCase,
    private readonly failContract: FailContractUseCase,
    private readonly findAllContracts: FindAllContractsUseCase,
    private readonly addPaymentUseCase: AddPaymentUseCase,
    private readonly addPersonUseCase: AddPersonUseCase,
    private readonly getPeopleByRoleUseCase: GetPeopleByRoleUseCase,
    private readonly validateRequiredRolesUseCase: ValidateRequiredRolesUseCase,
    @InjectRepository(DocumentEntity)
    private readonly documentRepository: Repository<DocumentEntity>,
    @InjectRepository(PersonOrmEntity)
    private readonly personRepository: Repository<PersonOrmEntity>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Property)
    private readonly propertyRepository: Repository<Property>,
    private readonly notificationsService: NotificationsService,
    private readonly auditService: AuditService,
    private readonly multimediaService: MultimediaService,
    private readonly dataSource: DataSource,
  ) {}

  /** Escritura de contrato + auditoría en una sola transacción. */
  private transaction<T>(
    work: (manager: EntityManager) => Promise<T>,
  ): Promise<T> {
    return runInTransaction(this.dataSource, work);
  }

  /**
   * Refleja el contrato en la propiedad (en proceso → "Contrato en progreso",
   * cerrado → vendida/arrendada). `onlyIf` evita pisar un estado que otro
   * proceso ya cambió (p. ej. al fallar, solo se libera si seguía en contrato).
   */
  private async syncPropertyStatus(
    manager: EntityManager,
    propertyId: string | null | undefined,
    status: PropertyStatus,
    onlyIf?: PropertyStatus,
  ): Promise<void> {
    if (!propertyId) return;
    const properties = manager.getRepository(Property);
    const property = await properties.findOne({ where: { id: propertyId }, select: ['id', 'status'] });
    if (!property || property.status === status) return;
    if (onlyIf && property.status !== onlyIf) return;
    await properties.update(propertyId, { status, lastModifiedAt: new Date() });
  }

  async create(dto: CreateContractDto, actorId?: string): Promise<Contract> {
    return this.transaction(async (manager) => {
      if (dto.propertyId) {
        const active = await this.contractRepository.withManager(manager).findOne({
          where: { propertyId: dto.propertyId, status: ContractStatus.IN_PROCESS, deletedAt: IsNull() },
        });
        if (active) {
          throw new ConflictException(
            `La propiedad ya tiene un contrato en proceso (${active.code}). Ciérralo o márcalo como fallido antes de crear otro.`,
          );
        }
      }

      // Los pagos van a la tabla `payments` (la que permite marcarlos pagados y adjuntar
      // comprobantes), no a la columna JSON del contrato.
      const { payments = [], ...contractData } = dto;
      const contract = await this.createContract.execute(
        { ...contractData, payments: [] } as any,
        manager,
      );

      if (payments.length > 0) {
        const paymentRepo = manager.getRepository(Payment);
        await paymentRepo.save(
          payments.map((payment) =>
            paymentRepo.create({
              ...payment,
              date: new Date(payment.date),
              paidAt: payment.paidAt ? new Date(payment.paidAt) : null,
              currency: payment.currency ?? defaultPaymentCurrency(payment.type, contract.currency),
              contractId: contract.id,
            }),
          ),
        );
      }

      await this.syncPropertyStatus(
        manager,
        contract.propertyId,
        propertyStatusForContract(contract.operation, contract.status ?? ContractStatus.IN_PROCESS),
      );

      // Create audit log
      await this.auditService.createAuditLog(
        {
          userId: actorId,
          action: AuditAction.CREATE,
          entityType: AuditEntityType.CONTRACT,
          entityId: contract.id,
          description: 'Contrato creado',
          newValues: {
            code: contract.code,
            operation: contract.operation,
            propertyId: contract.property?.id,
            endDate: contract.endDate,
            amount: contract.amount,
            commissionPercent: contract.commissionPercent,
            commissionAmount: contract.commissionAmount,
            status: contract.status,
          },
          source: RequestSource.USER,
        },
        manager,
      );

      return contract;
    });
  }

  async findAll(query?: any): Promise<any> {
    return this.contractRepository.findForGrid(query ?? {});
  }

  async exportExcel(query?: any): Promise<Buffer> {
    const result = await this.findAll({
      ...(query ?? {}),
      pagination: 'false',
    });
    const rows = Array.isArray(result) ? result : (result.data ?? []);

    const columns = [
      { key: 'code', header: 'Código' },
      { key: 'status', header: 'Estado' },
      { key: 'propertyTitle', header: 'Propiedad' },
      { key: 'clientName', header: 'Cliente' },
      { key: 'amount', header: 'Monto' },
      { key: 'commissionAmount', header: 'Comisión' },
      { key: 'agentName', header: 'Agente' },
      { key: 'createdAt', header: 'Fecha creación' },
      { key: 'endDate', header: 'Fecha término' },
    ];

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Contratos');
    sheet.columns = columns.map((col) => ({
      key: col.key,
      header: col.header,
      width: 22,
    }));

    for (const contract of rows) {
      const people = Array.isArray(contract.people) ? contract.people : [];
      const client = people.find(
        (person: { role?: string }) =>
          person?.role === 'BUYER' || person?.role === 'TENANT',
      );
      const agent = contract.user as
        | {
            personalInfo?: { firstName?: string; lastName?: string };
            username?: string;
            email?: string;
          }
        | undefined;
      const agentName = agent
        ? `${agent.personalInfo?.firstName || ''} ${agent.personalInfo?.lastName || ''}`.trim() ||
          agent.username ||
          agent.email ||
          ''
        : '';

      sheet.addRow({
        code: contract.code ?? '',
        status: contract.status ?? '',
        propertyTitle: contract.property?.title ?? '',
        clientName: client?.personName || client?.person?.name || '',
        amount: contract.amount ?? '',
        commissionAmount: contract.commissionAmount ?? '',
        agentName,
        createdAt: contract.createdAt ?? '',
        endDate: contract.endDate ?? '',
      });
    }

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  async findOne(id: string): Promise<Contract> {
    const result = await this.findContract.execute(id);
    if (!result) {
      throw new NotFoundException();
    }
    return this.hydratePayments(result);
  }

  private async hydratePayments(contract: Contract): Promise<Contract> {
    const payments = await this.paymentRepository.find({
      where: { contractId: contract.id },
      order: { date: 'ASC', createdAt: 'ASC' },
    });
    if (!payments.length) {
      return contract;
    }

    const documents = await this.documentRepository.find({
      where: { contractId: contract.id },
      relations: ['multimedia', 'documentType'],
    });
    const byPayment = new Map<string, any[]>();
    for (const doc of documents) {
      if (!doc.paymentId) continue;
      const list = byPayment.get(doc.paymentId) ?? [];
      list.push({
        id: doc.id,
        documentId: doc.id,
        title: doc.title,
        status: doc.status,
        uploaded:
          doc.status === DocumentStatus.UPLOADED ||
          doc.status === DocumentStatus.RECIBIDO,
        multimedia: doc.multimedia,
        url: doc.multimedia?.url,
        documentTypeId: doc.documentTypeId,
        createdAt: doc.createdAt,
      });
      byPayment.set(doc.paymentId, list);
    }

    (contract as any).payments = payments.map((payment) => ({
      id: payment.id,
      amount: Number(payment.amount),
      date: payment.date,
      description: payment.description,
      type: payment.type,
      status: payment.status,
      currency: payment.currency,
      paidAt: payment.paidAt,
      isAgencyRevenue: payment.isAgencyRevenue,
      documents: byPayment.get(payment.id) ?? [],
    }));
    return contract;
  }

  async update(
    id: string,
    dto: UpdateContractDto,
    actorId?: string,
  ): Promise<Contract> {
    return this.transaction(async (manager) => {
      const contracts = this.contractRepository.withManager(manager);
      // Get old contract state for audit
      const oldContract = await contracts.findById(id);
      if (!oldContract) {
        throw new NotFoundException();
      }

      await this.updateContract.execute(id, dto, manager);
      const updated = await contracts.findById(id);
      if (!updated) {
        throw new NotFoundException();
      }

      // Create audit log with old and new values
      await this.auditService.createAuditLog(
        {
          userId: actorId,
          action: AuditAction.UPDATE,
          entityType: AuditEntityType.CONTRACT,
          entityId: id,
          description: 'Contrato actualizado',
          oldValues: {
            endDate: oldContract.endDate,
            amount: oldContract.amount,
            commissionPercent: oldContract.commissionPercent,
            commissionAmount: oldContract.commissionAmount,
            status: oldContract.status,
            description: oldContract.description,
          },
          newValues: {
            endDate: updated.endDate,
            amount: updated.amount,
            commissionPercent: updated.commissionPercent,
            commissionAmount: updated.commissionAmount,
            status: updated.status,
            description: updated.description,
          },
          source: RequestSource.USER,
        },
        manager,
      );

      return updated;
    });
  }

  async updateAgent(
    id: string,
    dto: UpdateContractAgentDto,
    actorId?: string,
  ): Promise<Contract> {
    return this.transaction(async (manager) => {
      const contracts = this.contractRepository.withManager(manager);
      const oldContract = await contracts.findById(id);
      if (!oldContract) {
        throw new NotFoundException();
      }

      await contracts.update(id, { userId: dto.userId } as any);

      const updated = await contracts.findById(id);
      if (!updated) {
        throw new NotFoundException();
      }

      await this.auditService.createAuditLog(
        {
          userId: actorId,
          action: AuditAction.UPDATE,
          entityType: AuditEntityType.CONTRACT,
          entityId: id,
          description: 'Agente del contrato actualizado',
          oldValues: { userId: oldContract.userId ?? null },
          newValues: { userId: updated.userId ?? null },
          source: RequestSource.USER,
        },
        manager,
      );

      return updated;
    });
  }

  async softDelete(id: string, actorId?: string): Promise<void> {
    return this.transaction(async (manager) => {
      const contract = await this.contractRepository.withManager(manager).findById(id);
      await this.deleteContract.execute(id, manager);

      if (contract?.status === ContractStatus.IN_PROCESS) {
        await this.syncPropertyStatus(
          manager,
          contract.propertyId,
          PropertyStatus.PUBLISHED,
          PropertyStatus.CONTRACT_IN_PROGRESS,
        );
      }

      // Create audit log
      await this.auditService.createAuditLog(
        {
          userId: actorId,
          action: AuditAction.DELETE,
          entityType: AuditEntityType.CONTRACT,
          entityId: id,
          description: 'Contrato eliminado (soft delete)',
          source: RequestSource.USER,
        },
        manager,
      );
    });
  }

  async close(
    id: string,
    dto: CloseContractDto,
    actorId?: string,
  ): Promise<Contract> {
    return this.transaction(async (manager) => {
      const contracts = this.contractRepository.withManager(manager);
      // Get old status for audit
      const oldContract = await contracts.findById(id);
      if (!oldContract) {
        throw new NotFoundException();
      }
      const oldStatus = oldContract.status;
      assertContractTransition(oldStatus, ContractStatus.CLOSED);

      const roles = this.validateRequiredRolesUseCase.execute(oldContract);
      if (!roles.valid) {
        throw new BadRequestException(
          `No se puede cerrar: faltan participantes con rol ${roles.missingRoles.join(', ')}.`,
        );
      }

      await this.closeContract.execute(id, dto, manager);
      const updated = await contracts.findById(id);
      if (!updated) {
        throw new NotFoundException();
      }

      // Create audit log
      await this.auditService.createAuditLog(
        {
          userId: actorId,
          action: AuditAction.UPDATE,
          entityType: AuditEntityType.CONTRACT,
          entityId: id,
          description: 'Contrato cerrado',
          oldValues: { status: oldStatus },
          newValues: { status: updated.status, endDate: updated.endDate },
          source: RequestSource.USER,
        },
        manager,
      );

      await this.syncPropertyStatus(
        manager,
        updated.propertyId,
        propertyStatusForContract(updated.operation, ContractStatus.CLOSED),
      );

      return updated;
    });
  }

  async fail(id: string, endDate: Date, actorId?: string): Promise<Contract> {
    return this.transaction(async (manager) => {
      const contracts = this.contractRepository.withManager(manager);
      // Get old status for audit
      const oldContract = await contracts.findById(id);
      if (!oldContract) {
        throw new NotFoundException();
      }
      const oldStatus = oldContract.status;
      assertContractTransition(oldStatus, ContractStatus.FAILED);

      await this.failContract.execute(id, endDate, manager);
      const updated = await contracts.findById(id);
      if (!updated) {
        throw new NotFoundException();
      }

      // Create audit log
      await this.auditService.createAuditLog(
        {
          userId: actorId,
          action: AuditAction.UPDATE,
          entityType: AuditEntityType.CONTRACT,
          entityId: id,
          description: 'Contrato marcado como fallido',
          oldValues: { status: oldStatus },
          newValues: { status: updated.status, endDate: updated.endDate },
          source: RequestSource.USER,
        },
        manager,
      );

      // La propiedad vuelve a estar disponible, si seguía tomada por este contrato.
      await this.syncPropertyStatus(
        manager,
        updated.propertyId,
        propertyStatusForContract(updated.operation, ContractStatus.FAILED),
        PropertyStatus.CONTRACT_IN_PROGRESS,
      );

      return updated;
    });
  }

  // stubs for endpoints still in controller
  async addPayment(
    id: string,
    dto: AddPaymentDto,
    actorId?: string,
  ): Promise<any> {
    return this.transaction(async (manager) => {
      const contract = await this.contractRepository.withManager(manager).findById(id);
      if (!contract) throw new NotFoundException('Contrato no encontrado');
      const payment = await this.addPaymentUseCase.execute(
        id,
        { ...dto, currency: dto.currency ?? defaultPaymentCurrency(dto.type, contract.currency) },
        manager,
      );

      // Create audit log
      await this.auditService.createAuditLog(
        {
          userId: actorId,
          action: AuditAction.UPDATE,
          entityType: AuditEntityType.CONTRACT,
          entityId: id,
          description: 'Pago agregado al contrato',
          metadata: {
            paymentId: payment?.id,
            paymentAmount: dto.amount,
            paymentType: dto.type,
            paymentDate: dto.date,
          },
          source: RequestSource.USER,
        },
        manager,
      );

      return payment;
    });
  }
  async addPerson(
    id: string,
    dto: AddPersonDto,
    actorId?: string,
  ): Promise<any> {
    return this.transaction(async (manager) => {
      await this.addPersonUseCase.execute(id, dto, manager);
      const contract = await this.contractRepository
        .withManager(manager)
        .findById(id);
      if (!contract) throw new NotFoundException();

      // Create audit log
      await this.auditService.createAuditLog(
        {
          userId: actorId,
          action: AuditAction.UPDATE,
          entityType: AuditEntityType.CONTRACT,
          entityId: id,
          description: 'Participante agregado al contrato',
          metadata: {
            personId: dto.personId,
            role: dto.role,
          },
          source: RequestSource.USER,
        },
        manager,
      );

      return contract;
    });
  }
  async getPeopleByRole(id: string, role: ContractRole): Promise<any[]> {
    return this.getPeopleByRoleUseCase.execute(id, role);
  }
  async validateRequiredRoles(contract: Contract): Promise<any> {
    return this.validateRequiredRolesUseCase.execute(contract);
  }
  async uploadContractDocument(
    file: Express.Multer.File,
    dto: UploadContractDocumentDto,
    actorId?: string,
  ): Promise<any> {
    if (!file) {
      throw new BadRequestException('Selecciona un archivo para adjuntar.');
    }

    const contract = await this.contractRepository.findById(dto.contractId);
    if (!contract) {
      throw new NotFoundException('contract not found');
    }

    let paymentId = dto.paymentId;
    if (paymentId) {
      const payment = await this.paymentRepository.findOne({
        where: { id: paymentId },
      });
      if (!payment) {
        throw new NotFoundException('payment not found');
      }
      if (payment.contractId !== dto.contractId) {
        throw new BadRequestException('El pago no pertenece a este contrato.');
      }
    }

    const docTypeRepo = this.documentRepository.manager.getRepository(
      DocumentTypeOrmEntity as any,
    );
    const docType = await docTypeRepo.findOne({
      where: { id: dto.documentTypeId },
    });
    if (!docType) {
      throw new NotFoundException('document type not found');
    }

    const uploadedById = actorId || dto.uploadedById;
    if (!uploadedById) {
      throw new BadRequestException('Usuario no autenticado');
    }

    const multimedia = await this.multimediaService.uploadFile(
      file,
      {
        type: MultimediaType.DOCUMENT,
        seoTitle: dto.seoTitle || dto.title,
      },
      uploadedById,
    );

    // La subida del archivo queda FUERA de la transacción (el storage no se puede
    // revertir). Documento + resumen JSON del contrato + auditoría van juntos.
    const { document, documentId, existingDocuments, txContract } =
      await this.transaction(async (manager) => {
        const documents = manager.getRepository(DocumentEntity);
        const contracts = this.contractRepository.withManager(manager);
        // Bloquea la fila del contrato: read-modify-write del JSON `documents`.
        const txContract =
          (await contracts.findOne({
            where: { id: dto.contractId },
            lock: { mode: 'pessimistic_write' },
          })) ?? contract;
        let documentId = dto.documentId;
        if (documentId) {
          const existing = await documents.findOne({
            where: { id: documentId },
          });
          if (!existing) {
            throw new NotFoundException('document not found');
          }
          existing.title = dto.title;
          existing.documentTypeId = dto.documentTypeId;
          existing.notes = dto.notes ?? existing.notes ?? '';
          existing.status = DocumentStatus.UPLOADED;
          existing.multimedia = multimedia;
          existing.multimediaId = multimedia.id;
          existing.contractId = dto.contractId;
          existing.uploadedById = uploadedById;
          if (paymentId) existing.paymentId = paymentId;
          if (dto.personId) existing.personId = dto.personId;
          await documents.save(existing);
        } else {
          const created = await documents.save(
            documents.create({
              title: dto.title,
              documentTypeId: dto.documentTypeId,
              uploadedById,
              contractId: dto.contractId,
              ...(paymentId ? { paymentId } : {}),
              personId: dto.personId,
              status: DocumentStatus.UPLOADED,
              required: false,
              notes: dto.notes || '',
              multimedia,
              multimediaId: multimedia.id,
            }),
          );
          documentId = created.id;
        }

        const document = await documents.findOne({
          where: { id: documentId },
          relations: ['multimedia', 'documentType'],
        });

        const existingDocuments = Array.isArray((txContract as any).documents)
          ? [...(txContract as any).documents]
          : [];
        const summary = {
          documentTypeId: dto.documentTypeId,
          documentId,
          id: documentId,
          title: document?.title ?? dto.title,
          required: document?.required ?? false,
          uploaded: true,
          status: document?.status ?? DocumentStatus.UPLOADED,
          uploadedById,
          paymentId: paymentId ?? null,
          createdAt: document?.createdAt,
          multimedia: document?.multimedia ?? multimedia,
          url: document?.multimedia?.url ?? multimedia.url,
        };
        const summaryIndex = existingDocuments.findIndex(
          (row: any) =>
            row?.documentId === documentId || row?.id === documentId,
        );
        if (summaryIndex >= 0) {
          existingDocuments[summaryIndex] = {
            ...existingDocuments[summaryIndex],
            ...summary,
          };
        } else {
          existingDocuments.push(summary);
        }
        await contracts.update(dto.contractId, {
          documents: existingDocuments,
        } as any);

        await this.auditService.createAuditLog(
          {
            userId: actorId,
            action: AuditAction.UPDATE,
            entityType: AuditEntityType.CONTRACT,
            entityId: dto.contractId,
            description: paymentId
              ? 'Comprobante cargado al pago'
              : 'Documento cargado al contrato',
            metadata: {
              documentId,
              documentTitle: dto.title,
              documentTypeId: dto.documentTypeId,
              paymentId: paymentId ?? null,
              fileName: file.originalname,
              multimediaId: multimedia.id,
            },
            source: RequestSource.USER,
          },
          manager,
        );

        return { document, documentId, existingDocuments, txContract };
      });

    const hydrated = await this.hydratePayments({
      ...(txContract as any),
      documents: existingDocuments,
    });
    return {
      contract: hydrated,
      document: document ?? { id: documentId, multimedia },
      multimedia: document?.multimedia ?? multimedia,
    };
  }

  async associateDocumentToPayment(
    paymentId: string,
    documentId: string,
  ): Promise<any> {
    const payment = await this.paymentRepository.findOne({
      where: { id: paymentId },
    });
    if (!payment) throw new NotFoundException('payment not found');
    const document = await this.documentRepository.findOne({
      where: { id: documentId },
    });
    if (!document) throw new NotFoundException('document not found');
    document.paymentId = paymentId;
    document.contractId = payment.contractId;
    await this.documentRepository.save(document);
    return this.getPaymentDocuments(paymentId);
  }

  async getPaymentDocuments(paymentId: string): Promise<any> {
    const payment = await this.paymentRepository.findOne({
      where: { id: paymentId },
    });
    if (!payment) throw new NotFoundException('payment not found');
    return this.documentRepository.find({
      where: { paymentId },
      relations: ['multimedia', 'documentType'],
      order: { createdAt: 'DESC' },
    });
  }

  async validatePaymentWithDocuments(paymentId: string): Promise<any> {
    const docs = await this.getPaymentDocuments(paymentId);
    const accepted = (docs as DocumentEntity[]).filter(
      (d) =>
        d.status === DocumentStatus.UPLOADED ||
        d.status === DocumentStatus.RECIBIDO,
    );
    return {
      paymentId,
      valid: accepted.length > 0,
      documentCount: (docs as DocumentEntity[]).length,
      acceptedCount: accepted.length,
    };
  }

  async getPaymentsByType(
    id: string,
    type: PaymentType | string,
  ): Promise<any> {
    return this.paymentRepository.find({
      where: { contractId: id, type: type as PaymentType },
      order: { date: 'ASC' },
    });
  }

  async getCommissionPayments(): Promise<any> {
    return this.paymentRepository.find({
      where: { type: PaymentType.COMMISSION_INCOME },
      order: { date: 'DESC' },
    });
  }

  async getRentPayments(): Promise<any> {
    return this.paymentRepository.find({
      where: { type: PaymentType.RENT_PAYMENT },
      order: { date: 'DESC' },
    });
  }

  async uploadPaymentProof(
    file: Express.Multer.File,
    id: string,
    paymentId: string,
    userId: string,
  ): Promise<any> {
    const payment = await this.paymentRepository.findOne({
      where: { id: paymentId, contractId: id },
    });
    if (!payment) throw new NotFoundException('payment not found');

    const docTypeRepo = this.documentRepository.manager.getRepository(
      DocumentTypeOrmEntity as any,
    );
    const docType =
      (await docTypeRepo.findOne({
        where: { name: 'Comprobante de pago' } as any,
      })) || (await docTypeRepo.find({ take: 1 }))[0];
    if (!docType) {
      throw new BadRequestException(
        'No hay tipo de documento configurado para comprobantes.',
      );
    }

    return this.uploadContractDocument(
      file,
      {
        title: `Comprobante ${payment.description || payment.type}`,
        documentTypeId: docType.id,
        contractId: id,
        paymentId,
        uploadedById: userId,
      },
      userId,
    );
  }

  async updatePaymentStatus(
    paymentId: string,
    status: PaymentStatus,
    actorId?: string,
  ): Promise<any> {
    return this.transaction(async (manager) => {
      const payments = manager.getRepository(Payment);
      const payment = await payments.findOne({ where: { id: paymentId } });
      if (!payment) throw new NotFoundException('payment not found');

      const oldStatus = payment.status;
      payment.status = status;
      payment.paidAt = status === PaymentStatus.PAID ? new Date() : null;
      await payments.save(payment);

      await this.auditService.createAuditLog(
        {
          userId: actorId,
          action: AuditAction.UPDATE,
          entityType: AuditEntityType.CONTRACT,
          entityId: payment.contractId,
          description: 'Estado de pago actualizado',
          oldValues: { status: oldStatus },
          newValues: { status: payment.status, paidAt: payment.paidAt },
          metadata: { paymentId },
          source: RequestSource.USER,
        },
        manager,
      );

      return payment;
    });
  }
}
