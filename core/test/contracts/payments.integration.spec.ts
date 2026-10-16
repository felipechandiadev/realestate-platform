import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../src/app.module';
import { DataSource } from 'typeorm';
import { User, UserRole, UserStatus } from '../../src/modules/users/domain/user.entity';
import { Property } from '../../src/modules/property/domain/property.entity';
import { PersonOrmEntity } from '../../src/modules/person/infrastructure/persistence/person.orm-entity';
import { DocumentTypeOrmEntity as DocumentType } from '../../src/modules/document-types/infrastructure/persistence/document-type.orm-entity';
import { loginStaff } from '../utils/auth';
import { PaymentType } from '../../src/modules/contracts/domain/payment.entity';

describe('Contract payments (integration)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let adminToken: string;
  let contractId: string;
  let paymentId: string;
  let documentTypeId: string;

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    dataSource = app.get(DataSource);

    const login = await loginStaff(app);
    adminToken = login.accessToken;

    const userRepository = dataSource.getRepository(User);
    const propertyRepository = dataSource.getRepository(Property);
    const personRepository = dataSource.getRepository(PersonOrmEntity);
    const docTypeRepository = dataSource.getRepository(DocumentType);

    let user = await userRepository.findOne({ where: {} });
    if (!user) {
      user = await userRepository.save(
        userRepository.create({
          username: `pay_user_${Date.now()}`,
          email: `pay_user_${Date.now()}@example.com`,
          password: 'x',
          role: UserRole.AGENT,
          status: UserStatus.ACTIVE,
        } as any) as any,
      );
    }

    let property = await propertyRepository.findOne({ where: {} });
    if (!property) {
      property = await propertyRepository.save(
        propertyRepository.create({
          title: 'Pay Property',
          description: 'Payment flow property',
          status: 'PUBLISHED',
          operationType: 'RENT',
          creatorUser: user,
          priceCLP: 500000,
          priceUF: 0,
        } as any) as any,
      );
    }

    let person = await personRepository.findOne({ where: {} });
    if (!person) {
      person = await personRepository.save(
        personRepository.create({
          firstName: 'Pay',
          lastName: 'Person',
          dni: `11.111.111-${Date.now() % 10}`,
          email: `pay_person_${Date.now()}@example.com`,
          phone: '+56911111111',
        } as any) as any,
      );
    }

    let docType = await docTypeRepository.findOne({ where: { name: 'Comprobante de pago' } });
    if (!docType) {
      docType = await docTypeRepository.save({
        name: 'Comprobante de pago',
        description: 'Payment proof',
        available: true,
      });
    }
    documentTypeId = docType.id;

    const createResponse = await request(app.getHttpServer())
      .post('/contracts')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        userId: user!.id,
        propertyId: property!.id,
        operation: 'ARRIENDO',
        status: 'IN_PROCESS',
        amount: 500000,
        commissionPercent: 50,
        people: [{ personId: person!.id, role: 'TENANT' }],
        description: 'Payment integration contract',
      })
      .expect(201);

    contractId = createResponse.body.id;
  });

  afterAll(async () => {
    await app?.close();
  });

  it('POST /contracts/:id/payments creates a payment visible on GET', async () => {
    const add = await request(app.getHttpServer())
      .post(`/contracts/${contractId}/payments`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        amount: 500000,
        date: '2026-03-01',
        description: 'Arriendo marzo',
        type: PaymentType.RENT_PAYMENT,
      })
      .expect((res) => {
        expect([200, 201]).toContain(res.status);
      });

    paymentId = add.body.id || add.body?.payment?.id;
    expect(paymentId).toBeDefined();

    const detail = await request(app.getHttpServer())
      .get(`/contracts/${contractId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    const payments = detail.body.payments || [];
    expect(payments.some((p: any) => p.id === paymentId)).toBe(true);
  });

  it('PATCH payment status to PAID sets paidAt', async () => {
    const response = await request(app.getHttpServer())
      .patch(`/contracts/${contractId}/payments/${paymentId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'PAID' })
      .expect(200);

    expect(response.body.status).toBe('PAID');
    expect(response.body.paidAt).toBeTruthy();
  });

  it('POST upload-document with paymentId links the document', async () => {
    const response = await request(app.getHttpServer())
      .post('/contracts/upload-document')
      .set('Authorization', `Bearer ${adminToken}`)
      .field('title', 'Comprobante arriendo')
      .field('documentTypeId', documentTypeId)
      .field('contractId', contractId)
      .field('paymentId', paymentId)
      .attach('file', Buffer.from('%PDF-1.4 test'), 'proof.pdf')
      .expect((res) => {
        expect([200, 201]).toContain(res.status);
      });

    expect(response.body.document?.id || response.body.document).toBeTruthy();

    const detail = await request(app.getHttpServer())
      .get(`/contracts/${contractId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    const payment = (detail.body.payments || []).find((p: any) => p.id === paymentId);
    expect(payment).toBeDefined();
    expect((payment.documents || []).length).toBeGreaterThan(0);
  });
});
