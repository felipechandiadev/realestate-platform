import { BadRequestException } from '@nestjs/common';
import { PropertyStatus } from '../../../shared/enums/property-status.enum';
import { PropertyOperationType } from '../../../shared/enums/property-operation-type.enum';
import { REGION_COMMUNES } from '../../../shared/regions/regions.data';
import { assertAgentMayPublish } from '../../auth/presentation/guards/agent-access.guard';

/** Campos que acepta el create (los demás se rechazan para agentes en vez de ignorarse). */
export const AGENT_CREATE_FIELDS = [
  'title', 'description', 'status', 'operationType', 'propertyTypeId',
  'state', 'city', 'address', 'location',
  'bedrooms', 'bathrooms', 'parkingSpaces', 'floors',
  'builtSquareMeters', 'landSquareMeters', 'constructionYear', 'otherFeatures',
  'price', 'currencyPrice', 'seoTitle', 'seoDescription',
  'mainImageUrl', 'internalNotes', 'contactName', 'contactPhone', 'contactEmail',
] as const;

const CURRENCIES = ['CLP', 'UF'];

/**
 * El formulario humano corrige en silencio un estado, operación o moneda inválidos
 * (los cambia por REQUEST / SALE / CLP). Un agente no lo nota y guarda datos
 * equivocados, así que aquí se rechaza todo lo dudoso con un mensaje por campo.
 */
export function agentCreateErrors(raw: any): string[] {
  const errors: string[] = [];
  if (!raw || typeof raw !== 'object') return ['El cuerpo debe ser un objeto JSON con los datos de la propiedad'];

  const unknown = Object.keys(raw).filter((k) => !(AGENT_CREATE_FIELDS as readonly string[]).includes(k));
  if (unknown.length) {
    errors.push(`Campos desconocidos: ${unknown.join(', ')}. Permitidos: ${AGENT_CREATE_FIELDS.join(', ')}`);
  }

  if (typeof raw.title !== 'string' || !raw.title.trim()) errors.push('title: obligatorio (texto)');

  const statuses = Object.values(PropertyStatus) as string[];
  if (!statuses.includes(raw.status)) {
    errors.push(`status: obligatorio, uno de ${statuses.join(', ')}`);
  }

  const operations = Object.values(PropertyOperationType) as string[];
  if (!operations.includes(raw.operationType)) {
    errors.push(`operationType: obligatorio, uno de ${operations.join(', ')}`);
  }

  if (raw.currencyPrice !== undefined && !CURRENCIES.includes(raw.currencyPrice)) {
    errors.push(`currencyPrice: uno de ${CURRENCIES.join(', ')}`);
  }
  if (raw.price !== undefined && raw.price !== null && raw.price !== '') {
    const n = Number(raw.price);
    if (!Number.isFinite(n) || n < 0) errors.push('price: debe ser un número mayor o igual a 0');
    else if (raw.currencyPrice === undefined) errors.push('currencyPrice: obligatorio cuando se indica price');
    else if (raw.currencyPrice === 'CLP' && !Number.isInteger(n)) errors.push('price: en CLP debe ser un entero');
  }

  const regions = Object.keys(REGION_COMMUNES);
  if (!regions.includes(raw.state)) {
    errors.push(`state: obligatorio, nombre exacto de una región (ver GET /agent/catalogs). Recibido: ${JSON.stringify(raw.state)}`);
  } else if (!REGION_COMMUNES[raw.state as keyof typeof REGION_COMMUNES].includes(raw.city)) {
    errors.push(`city: debe ser una comuna de la región "${raw.state}" (ver GET /agent/catalogs). Recibido: ${JSON.stringify(raw.city)}`);
  }

  for (const f of ['bedrooms', 'bathrooms', 'parkingSpaces', 'floors', 'builtSquareMeters', 'landSquareMeters']) {
    const v = raw[f];
    if (v !== undefined && v !== null && v !== '' && (!Number.isFinite(Number(v)) || Number(v) < 0)) {
      errors.push(`${f}: debe ser un número mayor o igual a 0`);
    }
  }
  if (raw.otherFeatures !== undefined && !(Array.isArray(raw.otherFeatures) && raw.otherFeatures.every((x: unknown) => typeof x === 'string'))) {
    errors.push('otherFeatures: debe ser una lista de textos');
  }
  return errors;
}

/** Valida el create hecho por un agente y exige permiso para publicar si corresponde. */
export function assertAgentCreatePayload(raw: any, user: any): void {
  const errors = agentCreateErrors(raw);
  if (errors.length) {
    throw new BadRequestException({ statusCode: 400, error: 'Bad Request', message: errors });
  }
  assertAgentMayPublish(user, raw.status);
}
