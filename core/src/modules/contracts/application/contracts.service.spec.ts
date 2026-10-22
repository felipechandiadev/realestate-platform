import { Test, TestingModule } from '@nestjs/testing';
import { ContractsService } from './contracts.service';
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
import { ContractRepository } from '../domain/contract.repository';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Payment, PaymentStatus } from '../domain/payment.entity';
import { Document, DocumentStatus } from '../../document/domain/document.entity';
import { PersonOrmEntity } from '../../person/infrastructure/persistence/person.orm-entity';
import { User } from '../../users/domain/user.entity';
import { Property } from '../../property/domain/property.entity';
import { NotificationsService } from '../../notifications/application/notifications.service';
import { MultimediaService } from '../../multimedia/application/multimedia.service';
import { AuditService } from '../../audit/application/audit.service';

describe('ContractsService', () => {
  let service: ContractsService;

  const mockCreate = { execute: jest.fn() };
  const mockFind = { execute: jest.fn() };
  const mockChange = { execute: jest.fn() };
  const mockDelete = { execute: jest.fn() };
  const mockUpdate = { execute: jest.fn() };
  const mockClose = { execute: jest.fn() };
  const mockFail = { execute: jest.fn() };
  const mockFindAll = { execute: jest.fn() };
  const mockAddPayment = { execute: jest.fn() };
  const mockAddPerson = { execute: jest.fn() };
  const mockGetPeople = { execute: jest.fn() };
  const mockValidateRoles = { execute: jest.fn() };
  const mockContractRepo: any = {
    findById: jest.fn(),
    findOne: jest.fn(),
    findForGrid: jest.fn(),
    update: jest.fn(),
    withManager: jest.fn(() => mockContractRepo),
  };
  const mockPaymentRepo = {
    find: jest.fn().mockResolvedValue([]),
    findOne: jest.fn(),
    save: jest.fn(),
  };
  const mockDocTypeRepo = { findOne: jest.fn(), find: jest.fn() };
  const mockDocumentRepo = {
    find: jest.fn().mockResolvedValue([]),
    findOne: jest.fn(),
    save: jest.fn(),
    create: jest.fn((row) => row),
    manager: { getRepository: jest.fn(() => mockDocTypeRepo) },
  };
  const mockMultimedia = {
    uploadFile: jest.fn().mockResolvedValue({ id: 'm1', url: 'https://x/f.pdf' }),
  };
  const mockAudit = { createAuditLog: jest.fn() };

  // QueryRunner simulado: el manager de la transacción devuelve los mismos mocks.
  const txManager = {
    getRepository: jest.fn((entity: unknown) => {
      if (entity === Payment) return mockPaymentRepo;
      if (entity === Document) return mockDocumentRepo;
      return {};
    }),
  };
  const queryRunner = {
    manager: txManager,
    isTransactionActive: false,
    connect: jest.fn(async () => undefined),
    startTransaction: jest.fn(async () => {
      queryRunner.isTransactionActive = true;
    }),
    commitTransaction: jest.fn(async () => {
      queryRunner.isTransactionActive = false;
    }),
    rollbackTransaction: jest.fn(async () => {
      queryRunner.isTransactionActive = false;
    }),
    release: jest.fn(async () => undefined),
  };
  const mockDataSource = { createQueryRunner: jest.fn(() => queryRunner) };

  beforeEach(async () => {
    jest.clearAllMocks();
    mockPaymentRepo.find.mockResolvedValue([]);
    mockDocumentRepo.find.mockResolvedValue([]);
    mockContractRepo.withManager.mockImplementation(() => mockContractRepo);
    mockContractRepo.findOne.mockResolvedValue(null);
    queryRunner.isTransactionActive = false;
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContractsService,
        { provide: CreateContractUseCase, useValue: mockCreate },
        { provide: FindContractUseCase, useValue: mockFind },
        { provide: ChangeContractStatusUseCase, useValue: mockChange },
        { provide: DeleteContractUseCase, useValue: mockDelete },
        { provide: UpdateContractUseCase, useValue: mockUpdate },
        { provide: CloseContractUseCase, useValue: mockClose },
        { provide: FailContractUseCase, useValue: mockFail },
        { provide: FindAllContractsUseCase, useValue: mockFindAll },
        { provide: AddPaymentUseCase, useValue: mockAddPayment },
        { provide: AddPersonUseCase, useValue: mockAddPerson },
        { provide: GetPeopleByRoleUseCase, useValue: mockGetPeople },
        { provide: ValidateRequiredRolesUseCase, useValue: mockValidateRoles },
        { provide: ContractRepository, useValue: mockContractRepo },
        { provide: getRepositoryToken(Payment), useValue: mockPaymentRepo },
        { provide: getRepositoryToken(Document), useValue: mockDocumentRepo },
        { provide: getRepositoryToken(PersonOrmEntity), useValue: {} },
        { provide: getRepositoryToken(User), useValue: {} },
        { provide: getRepositoryToken(Property), useValue: {} },
        { provide: NotificationsService, useValue: {} },
        { provide: MultimediaService, useValue: mockMultimedia },
        { provide: AuditService, useValue: mockAudit },
        { provide: DataSource, useValue: mockDataSource },
      ],
    }).compile();

    service = module.get<ContractsService>(ContractsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('create delegates', async () => {
    const dto = {} as any;
    mockCreate.execute.mockResolvedValue({ id: '1' });
    await service.create(dto, 'actor');
    expect(mockCreate.execute).toHaveBeenCalledWith(dto, txManager);
    expect(mockAudit.createAuditLog).toHaveBeenCalledWith(expect.any(Object), txManager);
    expect(queryRunner.commitTransaction).toHaveBeenCalledTimes(1);
    expect(queryRunner.release).toHaveBeenCalledTimes(1);
  });

  it('findAll uses repository grid', async () => {
    mockContractRepo.findForGrid.mockResolvedValue({ data: [], total: 0 });
    await service.findAll({ page: 1 });
    expect(mockContractRepo.findForGrid).toHaveBeenCalledWith({ page: 1 });
  });

  it('findOne hydrates payments from table', async () => {
    mockFind.execute.mockResolvedValue({ id: 'c1', documents: [] });
    mockPaymentRepo.find.mockResolvedValue([
      {
        id: 'p1',
        amount: 100,
        date: '2026-01-01',
        description: 'Rent',
        type: 'RENT_PAYMENT',
        status: PaymentStatus.PENDING,
        paidAt: null,
        isAgencyRevenue: false,
      },
    ]);
    mockDocumentRepo.find.mockResolvedValue([
      {
        id: 'd1',
        paymentId: 'p1',
        title: 'Proof',
        status: DocumentStatus.UPLOADED,
        documentTypeId: 't1',
        createdAt: new Date(),
        multimedia: { url: 'https://x/p.pdf' },
      },
    ]);

    const result = await service.findOne('c1');
    expect(result.payments).toHaveLength(1);
    expect((result.payments as any)[0].documents).toHaveLength(1);
  });

  it('updatePaymentStatus sets paidAt when PAID', async () => {
    const payment = {
      id: 'p1',
      contractId: 'c1',
      status: PaymentStatus.PENDING,
      paidAt: null,
    };
    mockPaymentRepo.findOne.mockResolvedValue(payment);
    mockPaymentRepo.save.mockImplementation(async (row) => row);

    const result = await service.updatePaymentStatus('p1', PaymentStatus.PAID, 'actor');
    expect(result.status).toBe(PaymentStatus.PAID);
    expect(result.paidAt).toBeInstanceOf(Date);
    expect(mockAudit.createAuditLog).toHaveBeenCalled();
  });

  it('uploadContractDocument persists paymentId', async () => {
    mockContractRepo.findById.mockResolvedValue({ id: 'c1', documents: [] });
    mockPaymentRepo.findOne.mockResolvedValue({ id: 'p1', contractId: 'c1' });
    mockDocTypeRepo.findOne.mockResolvedValue({ id: 't1' });
    mockDocumentRepo.save.mockImplementation(async (row) => ({ ...row, id: row.id || 'd1' }));
    mockDocumentRepo.findOne.mockResolvedValue({
      id: 'd1',
      title: 'Comprobante',
      status: DocumentStatus.UPLOADED,
      required: false,
      multimedia: { id: 'm1', url: 'https://x/f.pdf' },
      createdAt: new Date(),
    });
    mockPaymentRepo.find.mockResolvedValue([]);

    const file = {
      originalname: 'proof.pdf',
      buffer: Buffer.from('pdf'),
    } as Express.Multer.File;

    const result = await service.uploadContractDocument(
      file,
      {
        title: 'Comprobante',
        documentTypeId: 't1',
        contractId: 'c1',
        paymentId: 'p1',
        uploadedById: 'u1',
      } as any,
      'u1',
    );

    expect(mockDocumentRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({ paymentId: 'p1', contractId: 'c1' }),
    );
    expect(mockContractRepo.update).toHaveBeenCalled();
    expect(result.document).toBeDefined();
  });

  describe('transacciones (rollback ante fallos)', () => {
    const expectRolledBack = () => {
      expect(queryRunner.startTransaction).toHaveBeenCalledTimes(1);
      expect(queryRunner.rollbackTransaction).toHaveBeenCalledTimes(1);
      expect(queryRunner.commitTransaction).not.toHaveBeenCalled();
      expect(queryRunner.release).toHaveBeenCalledTimes(1);
    };

    it('create: si falla la auditoría se revierte el contrato creado', async () => {
      mockCreate.execute.mockResolvedValue({ id: 'c1' });
      mockAudit.createAuditLog.mockRejectedValueOnce(new Error('audit down'));

      await expect(service.create({} as any, 'actor')).rejects.toThrow('audit down');
      expect(mockCreate.execute).toHaveBeenCalledWith({}, txManager);
      expectRolledBack();
    });

    it('update: la escritura y las lecturas usan el manager de la transacción', async () => {
      mockContractRepo.findById.mockResolvedValue({ id: 'c1', status: 'IN_PROCESS' });
      mockUpdate.execute.mockRejectedValueOnce(new Error('db error'));

      await expect(service.update('c1', { amount: 1 } as any, 'actor')).rejects.toThrow('db error');
      expect(mockContractRepo.withManager).toHaveBeenCalledWith(txManager);
      expect(mockUpdate.execute).toHaveBeenCalledWith('c1', { amount: 1 }, txManager);
      expect(mockAudit.createAuditLog).not.toHaveBeenCalled();
      expectRolledBack();
    });

    it('addPayment: si falla la auditoría se revierte el pago', async () => {
      mockAddPayment.execute.mockResolvedValue({ id: 'p1' });
      mockAudit.createAuditLog.mockRejectedValueOnce(new Error('audit down'));

      await expect(
        service.addPayment('c1', { amount: 10, type: 'RENT_PAYMENT', date: '2026-01-01' } as any, 'actor'),
      ).rejects.toThrow('audit down');
      expect(mockAddPayment.execute).toHaveBeenCalledWith('c1', expect.any(Object), txManager);
      expectRolledBack();
    });

    it('updatePaymentStatus: si falla la auditoría se revierte el cambio de estado', async () => {
      mockPaymentRepo.findOne.mockResolvedValue({ id: 'p1', contractId: 'c1', status: PaymentStatus.PENDING });
      mockPaymentRepo.save.mockImplementation(async (row) => row);
      mockAudit.createAuditLog.mockRejectedValueOnce(new Error('audit down'));

      await expect(service.updatePaymentStatus('p1', PaymentStatus.PAID, 'actor')).rejects.toThrow('audit down');
      expect(txManager.getRepository).toHaveBeenCalledWith(Payment);
      expect(mockPaymentRepo.save).toHaveBeenCalled();
      expectRolledBack();
    });

    it('uploadContractDocument: si falla actualizar el contrato se revierte el documento', async () => {
      mockContractRepo.findById.mockResolvedValue({ id: 'c1', documents: [] });
      mockDocTypeRepo.findOne.mockResolvedValue({ id: 't1' });
      mockDocumentRepo.save.mockImplementation(async (row) => ({ ...row, id: 'd1' }));
      mockDocumentRepo.findOne.mockResolvedValue({ id: 'd1', title: 'Doc', status: DocumentStatus.UPLOADED });
      mockContractRepo.update.mockRejectedValueOnce(new Error('update failed'));

      await expect(
        service.uploadContractDocument(
          { originalname: 'a.pdf', buffer: Buffer.from('x') } as Express.Multer.File,
          { title: 'Doc', documentTypeId: 't1', contractId: 'c1', uploadedById: 'u1' } as any,
          'u1',
        ),
      ).rejects.toThrow('update failed');
      // Se bloquea la fila del contrato dentro de la transacción.
      expect(mockContractRepo.findOne).toHaveBeenCalledWith(
        expect.objectContaining({ lock: { mode: 'pessimistic_write' } }),
      );
      expect(mockDocumentRepo.save).toHaveBeenCalled();
      expect(mockAudit.createAuditLog).not.toHaveBeenCalled();
      expectRolledBack();
    });

    it('softDelete: si falla la auditoría se revierte el borrado', async () => {
      mockAudit.createAuditLog.mockRejectedValueOnce(new Error('audit down'));
      await expect(service.softDelete('c1', 'actor')).rejects.toThrow('audit down');
      expect(mockDelete.execute).toHaveBeenCalledWith('c1', txManager);
      expectRolledBack();
    });
  });
});
