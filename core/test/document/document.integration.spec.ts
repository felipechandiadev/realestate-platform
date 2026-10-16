import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../src/app.module';
import { DataSource } from 'typeorm';
import { DocumentTypeOrmEntity as DocumentType } from '../../src/modules/document-types/infrastructure/persistence/document-type.orm-entity';
import { User } from '../../src/modules/users/domain/user.entity';
import { DocumentStatus } from '../../src/modules/document/domain/document.entity';
import { loginStaff } from '../utils/auth';

describe('DocumentController (integration)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let testDocumentId: string;
  let documentTypeId: string;
  let adminUserId: string;
  let adminToken: string;

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
    const staff =
      (login.user?.id && (await userRepository.findOne({ where: { id: login.user.id } }))) ||
      (await userRepository.findOne({ where: { email: 'admin@realestate.com' } })) ||
      (await userRepository.findOne({ where: { email: 'admin@re.cl' } }));
    adminUserId = staff!.id;

    // Create a document type for testing
    const documentTypeRepository = dataSource.getRepository(DocumentType);
    let documentType = await documentTypeRepository.findOne({
      where: { name: 'Test Document Type' },
    });
    if (!documentType) {
      documentType = await documentTypeRepository.save({
        name: 'Test Document Type',
        description: 'Document type for testing',
        available: true,
      });
    }
    documentTypeId = documentType.id;
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /document sin token → 401', async () => {
    await request(app.getHttpServer()).get('/document').expect(401);
  });

  it('POST /document sin token → 401', async () => {
    await request(app.getHttpServer()).post('/document').send({}).expect(401);
  });

  it('POST /document - debe crear un nuevo documento', async () => {
    const documentData = {
      title: 'Escritura de compraventa',
      documentTypeId: documentTypeId,
      uploadedById: adminUserId,
      notes: 'Documento de prueba',
    };

    const response = await request(app.getHttpServer())
      .post('/document')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(documentData);

    expect(response.status).toBe(201);

    expect(response.body).toHaveProperty('id');
    expect(response.body.title).toBe(documentData.title);
    expect(response.body.status).toBe('PENDING'); // Default status

    testDocumentId = response.body.id;
  });

  it('GET /document - debe obtener la lista de documentos', async () => {
    const response = await request(app.getHttpServer())
      .get('/document')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
  });

  it('GET /document/:id - debe obtener un documento por ID', async () => {
    const response = await request(app.getHttpServer())
      .get(`/document/${testDocumentId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(response.body.id).toBe(testDocumentId);
    expect(response.body.title).toBe('Escritura de compraventa');
  });

  it('PATCH /document/:id - debe actualizar un documento', async () => {
    const updateData = {
      status: DocumentStatus.RECIBIDO,
      notes: 'Documento actualizado para pruebas',
    };

    await request(app.getHttpServer())
      .patch(`/document/${testDocumentId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send(updateData)
      .expect(200);
  });

  it('DELETE /document/:id - debe eliminar un documento existente', async () => {
    await request(app.getHttpServer())
      .delete(`/document/${testDocumentId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    // Verificar que ya no existe
    await request(app.getHttpServer())
      .get(`/document/${testDocumentId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(404);
  });

  it('GET /document/:id - debe fallar al buscar un ID que no existe', async () => {
    await request(app.getHttpServer())
      .get('/document/00000000-0000-0000-0000-000000000000')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(404);
  });
});
