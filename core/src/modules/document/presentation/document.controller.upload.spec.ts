/* eslint-disable @typescript-eslint/unbound-method -- aserciones sobre mocks de jest */
import { ForbiddenException } from '@nestjs/common';
import { DocumentController } from './document.controller';
import { DocumentService } from '../application/document.service';
import { UploadDniUseCase } from '../application/use-cases/upload-dni.usecase';
import { ROLES_KEY } from '../../auth/presentation/decorators/roles.decorator';
import { UserRole } from '../../users/domain/user.entity';

const pdf = () =>
  ({
    originalname: 'contrato.pdf',
    mimetype: 'application/pdf',
    size: 20,
    buffer: Buffer.from('%PDF-1.4\n%âãÏÓ\n1 0 obj'),
  }) as Express.Multer.File;
const jpeg = () =>
  ({
    originalname: 'carnet.jpg',
    mimetype: 'image/jpeg',
    size: 12,
    buffer: Buffer.from([
      0xff, 0xd8, 0xff, 0xe0, 0, 0x10, 0x4a, 0x46, 0x49, 0x46, 0, 1,
    ]),
  }) as Express.Multer.File;

describe('DocumentController (subidas)', () => {
  const service = {
    uploadDocument: jest.fn((_f: unknown, dto: unknown) =>
      Promise.resolve(dto),
    ),
    uploadDNI: jest.fn((_f: unknown, dto: unknown) => Promise.resolve(dto)),
  } as unknown as jest.Mocked<DocumentService>;
  const controller = new DocumentController(service);
  const req = (user: { id: string; role: string }) => ({ user }) as never;

  beforeEach(() => jest.clearAllMocks());

  it('upload solo para el equipo; upload-dni también para clientes', () => {
    const rolesOf = (method: keyof DocumentController) =>
      Reflect.getMetadata(
        ROLES_KEY,
        DocumentController.prototype[method],
      ) as UserRole[];
    expect(rolesOf('uploadDocument')).toEqual([UserRole.ADMIN, UserRole.AGENT]);
    expect(rolesOf('uploadDNI')).toEqual([
      UserRole.ADMIN,
      UserRole.AGENT,
      UserRole.COMMUNITY,
    ]);
  });

  it('quien sube es el usuario del token, aunque el cuerpo diga otro', async () => {
    await controller.uploadDocument(
      pdf(),
      {
        title: 'Contrato',
        documentTypeId: 't1',
        uploadedById: 'otro-usuario',
      } as never,
      req({ id: 'agente-1', role: UserRole.AGENT }),
    );
    expect(service.uploadDocument).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ uploadedById: 'agente-1' }),
    );

    await controller.uploadDNI(
      jpeg(),
      {
        personId: 'p1',
        dniSide: 'FRONT',
        uploadedById: 'otro-usuario',
      } as never,
      req({ id: 'cliente-1', role: UserRole.COMMUNITY }),
    );
    expect(service.uploadDNI).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ uploadedById: 'cliente-1' }),
      { id: 'cliente-1', role: UserRole.COMMUNITY },
    );
  });
});

describe('UploadDniUseCase (dueño de la ficha)', () => {
  const build = (personUserId: string | null) => {
    const multimedia = {
      uploadFile: jest.fn(() => Promise.resolve({ id: 'm1', url: 'u' })),
    };
    const documentRepository = {
      create: jest.fn((d: unknown) => d),
      save: jest.fn((d: unknown) => Promise.resolve(d)),
    };
    const personRepository = {
      findOne: jest.fn(() =>
        Promise.resolve({ id: 'p1', userId: personUserId }),
      ),
      save: jest.fn(),
    };
    const documentTypeRepository = {
      findOne: jest.fn(() => Promise.resolve({ id: 'dt' })),
    };
    const useCase = new UploadDniUseCase(
      multimedia as never,
      documentRepository as never,
      personRepository as never,
      documentTypeRepository as never,
    );
    return { useCase, multimedia, personRepository };
  };
  const dto = {
    personId: 'p1',
    dniSide: 'FRONT',
    uploadedById: 'cliente-1',
  } as never;

  it('un cliente no puede cambiar el carnet de otra persona', async () => {
    const { useCase, multimedia, personRepository } = build('otro-cliente');
    await expect(
      useCase.execute(jpeg(), dto, {
        id: 'cliente-1',
        role: UserRole.COMMUNITY,
      }),
    ).rejects.toThrow(ForbiddenException);
    expect(multimedia.uploadFile).not.toHaveBeenCalled();
    expect(personRepository.save).not.toHaveBeenCalled();
  });

  it('un cliente sí puede subir el de su propia ficha, y el equipo el de cualquiera', async () => {
    const own = build('cliente-1');
    await own.useCase.execute(jpeg(), dto, {
      id: 'cliente-1',
      role: UserRole.COMMUNITY,
    });
    expect(own.personRepository.save).toHaveBeenCalled();

    const staff = build('otro-cliente');
    await staff.useCase.execute(jpeg(), dto, {
      id: 'agente-1',
      role: UserRole.AGENT,
    });
    expect(staff.personRepository.save).toHaveBeenCalled();
  });
});
