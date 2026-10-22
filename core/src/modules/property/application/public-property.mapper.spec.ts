/** Tests unitarios (sin BD) del filtrado público de GET /properties/:id/full. */
import { NotFoundException } from '@nestjs/common';
import { PropertyStatus } from '../../../shared/enums/property-status.enum';
import { UserRole } from '../../users/domain/user.entity';
import {
  isPubliclyVisible,
  toPublicPropertyDetail,
} from './public-property.mapper';
import { PropertyController } from '../presentation/property.controller';
import { PropertyService } from './property.service';

const fullProperty = {
  id: 'p1',
  code: 'PV-26-0000001',
  title: 'Casa',
  status: PropertyStatus.PUBLISHED,
  price: 100,
  internalNotes: 'secreto',
  creatorUserId: 'u-creator',
  creatorUser: { id: 'u-creator', email: 'creador@x.cl', password: 'hash' },
  changeHistory: [{ field: 'price' }],
  leads: [{ email: 'lead@x.cl' }],
  views: [{ ip: '1.2.3.4' }],
  favorites: [{ userId: 'a' }, { userId: 'b' }],
  postRequest: { contactEmail: 'dueño@x.cl' },
  propertyType: { id: 't1', name: 'Casa', description: 'interno' },
  multimedia: [
    {
      id: 'm1',
      url: 'https://cdn/x.jpg',
      userId: 'u-creator',
      uploadedById: 'u-creator',
    },
  ],
  assignedAgent: {
    id: 'ag1',
    email: 'agente@x.cl',
    password: 'hash',
    personalInfo: {
      firstName: 'Ana',
      lastName: 'Pérez',
      avatarUrl: 'a.png',
      phone: '+56 9 1',
    },
  },
};

describe('toPublicPropertyDetail', () => {
  it('excluye datos internos y personales', () => {
    const out = toPublicPropertyDetail(fullProperty) as any;
    expect(out).toMatchObject({
      id: 'p1',
      code: 'PV-26-0000001',
      title: 'Casa',
      price: 100,
    });
    for (const key of [
      'internalNotes',
      'creatorUserId',
      'creatorUser',
      'changeHistory',
      'leads',
      'views',
      'favorites',
      'postRequest',
    ]) {
      expect(out).not.toHaveProperty(key);
    }
    expect(out.favoritesCount).toBe(2);
    expect(out.propertyType).toEqual({ id: 't1', name: 'Casa' });
    expect(out.multimedia).toEqual([{ id: 'm1', url: 'https://cdn/x.jpg' }]);
    expect(out.assignedAgent).toEqual({
      id: 'ag1',
      personalInfo: { firstName: 'Ana', lastName: 'Pérez', avatarUrl: 'a.png' },
    });
  });

  it('solo PUBLISHED es visible públicamente', () => {
    expect(isPubliclyVisible({ status: PropertyStatus.PUBLISHED })).toBe(true);
    for (const status of Object.values(PropertyStatus).filter(
      (s) => s !== PropertyStatus.PUBLISHED,
    )) {
      expect(isPubliclyVisible({ status })).toBe(false);
    }
    expect(isPubliclyVisible(null)).toBe(false);
  });
});

describe('PropertyService.getPublicFullProperty', () => {
  const callPublic = (property: any) => {
    const svc = Object.create(PropertyService.prototype) as PropertyService;
    (svc as any).findOne = jest.fn().mockResolvedValue(property);
    return svc.getPublicFullProperty('p1');
  };

  it('404 si la propiedad no está publicada', async () => {
    await expect(
      callPublic({ ...fullProperty, status: PropertyStatus.REQUEST }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('devuelve la vista pública si está publicada', async () => {
    const out: any = await callPublic(fullProperty);
    expect(out.id).toBe('p1');
    expect(out).not.toHaveProperty('internalNotes');
  });
});

describe('PropertyController.getFullProperty', () => {
  const service = {
    getFullProperty: jest.fn().mockResolvedValue({ full: true }),
    getPublicFullProperty: jest.fn().mockResolvedValue({ public: true }),
  };
  const controller = new PropertyController(service as any, {} as any);

  beforeEach(() => jest.clearAllMocks());

  it('anónimo y COMMUNITY reciben la vista pública', async () => {
    await expect(controller.getFullProperty('p1', {})).resolves.toEqual({
      public: true,
    });
    await expect(
      controller.getFullProperty('p1', {
        user: { id: 'u', role: UserRole.COMMUNITY },
      }),
    ).resolves.toEqual({ public: true });
    expect(service.getFullProperty).not.toHaveBeenCalled();
  });

  it('ADMIN y AGENT reciben el detalle completo', async () => {
    await expect(
      controller.getFullProperty('p1', {
        user: { id: 'a', role: UserRole.ADMIN },
      }),
    ).resolves.toEqual({ full: true });
    await expect(
      controller.getFullProperty('p1', {
        user: { id: 'b', role: UserRole.AGENT },
      }),
    ).resolves.toEqual({ full: true });
    expect(service.getPublicFullProperty).not.toHaveBeenCalled();
  });
});
