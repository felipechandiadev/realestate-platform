import { PropertyStatus } from '../../../shared/enums/property-status.enum';

/**
 * Campos que un visitante o cliente de comunidad puede enviar al solicitar la
 * publicación de una propiedad. Todo lo demás (estado, destacada, agente,
 * creador, SEO, notas internas, imagen principal…) lo decide el equipo.
 */
const PUBLIC_PROPERTY_REQUEST_FIELDS = [
  'title',
  'description',
  'propertyTypeId',
  'operationType',
  'state',
  'city',
  'address',
  'location',
  'bedrooms',
  'bathrooms',
  'parkingSpaces',
  'floors',
  'builtSquareMeters',
  'landSquareMeters',
  'constructionYear',
  'otherFeatures',
  'price',
  'currencyPrice',
  'contactName',
  'contactPhone',
  'contactEmail',
] as const;

type Coordinates = { latitude?: unknown; longitude?: unknown };

const toFiniteNumber = (value: unknown): number | undefined => {
  if (value === null || value === undefined || value === '') return undefined;
  const n =
    typeof value === 'string'
      ? Number(value.replace(/[^\d.-]/g, ''))
      : Number(value);
  return Number.isFinite(n) ? n : undefined;
};

/** Precio escrito en formato chileno: CLP sin decimales; UF con coma decimal. */
const parsePrice = (value: string, currency: unknown): number | undefined => {
  if (currency === 'UF' && value.includes(',')) {
    return toFiniteNumber(value.replace(/\./g, '').replace(',', '.'));
  }
  if (currency === 'UF') return toFiniteNumber(value);
  return toFiniteNumber(value.replace(/\D/g, ''));
};

/**
 * Normaliza una solicitud pública: conserva solo los campos permitidos, acepta
 * los alias del portal (`region`, `coordinates`) y fuerza el estado `REQUEST`.
 */
export function toPublicPropertyRequest(raw: unknown): Record<string, unknown> {
  const input =
    raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {};
  const result: Record<string, unknown> = {};

  for (const field of PUBLIC_PROPERTY_REQUEST_FIELDS) {
    if (input[field] !== undefined) result[field] = input[field];
  }

  if (result.state === undefined && input.region !== undefined) {
    result.state = input.region;
  }

  const coordinates = input.coordinates as Coordinates | undefined;
  if (
    result.location === undefined &&
    coordinates &&
    typeof coordinates === 'object'
  ) {
    const lat = toFiniteNumber(coordinates.latitude);
    const lng = toFiniteNumber(coordinates.longitude);
    if (lat !== undefined && lng !== undefined) result.location = { lat, lng };
  }

  if (typeof result.price === 'string') {
    result.price = parsePrice(result.price, result.currencyPrice);
  }

  result.status = PropertyStatus.REQUEST;
  return result;
}
