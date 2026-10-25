import { ValidationPipe } from '@nestjs/common';
import { CreatePropertyDto } from '../dto/create-property.dto';
import { PropertyStatus } from '../../../shared/enums/property-status.enum';
import { toPublicPropertyRequest } from './public-property-request';

const portalPayload = {
  title: 'Casa en Temuco',
  propertyTypeId: 'type-1',
  operationType: 'SALE',
  bedrooms: 3,
  price: '120.000.000',
  currencyPrice: 'CLP',
  region: 'Araucanía',
  city: 'Temuco',
  address: 'Calle 1',
  coordinates: { latitude: -38.7, longitude: -72.6 },
  contactName: 'Ana',
  contactEmail: 'ana@example.com',
};

const privilegedFields = {
  status: 'PUBLISHED',
  isFeatured: true,
  assignedAgentId: 'agent-1',
  creatorUserId: 'admin-1',
  internalNotes: 'nota',
  seoTitle: 'spam',
  seoDescription: 'spam',
  mainImageUrl: 'https://evil.example/x.png',
  publishedAt: '2026-01-01',
  code: 'PV-26-0000001',
};

describe('toPublicPropertyRequest', () => {
  it('fuerza REQUEST y descarta campos que decide el equipo', () => {
    const result = toPublicPropertyRequest({
      ...portalPayload,
      ...privilegedFields,
    });

    expect(result.status).toBe(PropertyStatus.REQUEST);
    for (const key of Object.keys(privilegedFields).filter(
      (k) => k !== 'status',
    )) {
      expect(result).not.toHaveProperty(key);
    }
  });

  it('conserva los datos de la solicitud y mapea los alias del portal', () => {
    const result = toPublicPropertyRequest(portalPayload);

    expect(result).toMatchObject({
      title: 'Casa en Temuco',
      propertyTypeId: 'type-1',
      bedrooms: 3,
      price: 120000000,
      state: 'Araucanía',
      city: 'Temuco',
      location: { lat: -38.7, lng: -72.6 },
      contactEmail: 'ana@example.com',
    });
    expect(result).not.toHaveProperty('region');
    expect(result).not.toHaveProperty('coordinates');
  });

  it('respeta state y location cuando ya vienen en el formato del API', () => {
    const result = toPublicPropertyRequest({
      state: 'Biobío',
      region: 'otra',
      location: { lat: 1, lng: 2 },
      coordinates: { latitude: 9, longitude: 9 },
    });

    expect(result.state).toBe('Biobío');
    expect(result.location).toEqual({ lat: 1, lng: 2 });
  });

  it('interpreta precios en UF con coma decimal', () => {
    expect(
      toPublicPropertyRequest({ price: '3.500,5', currencyPrice: 'UF' }).price,
    ).toBe(3500.5);
    expect(
      toPublicPropertyRequest({ price: '4200', currencyPrice: 'UF' }).price,
    ).toBe(4200);
  });

  it('tolera entradas vacías o inválidas', () => {
    expect(toPublicPropertyRequest(null)).toEqual({
      status: PropertyStatus.REQUEST,
    });
    expect(toPublicPropertyRequest('x')).toEqual({
      status: PropertyStatus.REQUEST,
    });
  });

  it('el DTO validado con whitelist no reintroduce campos privilegiados', async () => {
    const dto = (await new ValidationPipe({
      transform: true,
      whitelist: true,
      transformOptions: { enableImplicitConversion: true },
    }).transform(
      toPublicPropertyRequest({ ...portalPayload, ...privilegedFields }),
      {
        type: 'body',
        metatype: CreatePropertyDto,
      },
    )) as Record<string, unknown>;

    expect(dto.status).toBe('REQUEST');
    expect(dto.isFeatured).toBeUndefined();
    expect(dto.assignedAgentId).toBeUndefined();
    expect(dto.internalNotes).toBeUndefined();
    expect(dto.mainImageUrl).toBeUndefined();
  });
});
