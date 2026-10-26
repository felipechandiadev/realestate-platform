import { PropertyStatus } from '../../../shared/enums/property-status.enum';

/** Campos de la propiedad que se pueden mostrar a visitantes anónimos. */
export const PUBLIC_PROPERTY_FIELDS = [
  'id',
  'code',
  'title',
  'description',
  'status',
  'operationType',
  'price',
  'currencyPrice',
  'seoTitle',
  'seoDescription',
  'seoKeywords',
  'publicationDate',
  'publishedAt',
  'isFeatured',
  'propertyTypeId',
  'builtSquareMeters',
  'landSquareMeters',
  'bedrooms',
  'bathrooms',
  'parkingSpaces',
  'floors',
  'constructionYear',
  'otherFeatures',
  'state',
  'city',
  'address',
  'latitude',
  'longitude',
  'mainImageUrl',
  'assignedAgentId',
  'createdAt',
  'updatedAt',
] as const;

/** Solo estas propiedades son visibles para visitantes. */
export const PUBLICLY_VISIBLE_STATUSES: ReadonlyArray<string> = [
  PropertyStatus.PUBLISHED,
];

export function isPubliclyVisible(property: { status?: string } | null | undefined): boolean {
  return !!property && PUBLICLY_VISIBLE_STATUSES.includes(String(property.status));
}

function publicAgent(agent: any) {
  if (!agent) return undefined;
  const info = agent.personalInfo ?? {};
  return {
    id: agent.id,
    personalInfo: {
      firstName: info.firstName,
      lastName: info.lastName,
      avatarUrl: info.avatarUrl,
    },
  };
}

function publicMultimedia(item: any) {
  if (!item) return item;
  const { userId, uploadedBy, uploadedById, ...rest } = item ?? {};
  void userId;
  void uploadedBy;
  void uploadedById;
  return rest;
}

/**
 * Vista pública de una propiedad: sin creador, historial, leads, visitas,
 * favoritos (solo su conteo), solicitud de publicación ni notas internas.
 */
export function toPublicPropertyDetail(property: any): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const key of PUBLIC_PROPERTY_FIELDS) {
    if (property?.[key] !== undefined) out[key] = property[key];
  }
  if (property?.propertyType) {
    out.propertyType = {
      id: property.propertyType.id,
      name: property.propertyType.name,
    };
  }
  if (Array.isArray(property?.multimedia)) {
    out.multimedia = property.multimedia.map(publicMultimedia);
  }
  const agent = publicAgent(property?.assignedAgent);
  if (agent) out.assignedAgent = agent;
  out.favoritesCount = Array.isArray(property?.favorites)
    ? property.favorites.length
    : 0;
  return out;
}

/**
 * Vista pública de una propiedad en listados (portada, ventas, arriendos,
 * destacadas, relacionadas): mismos campos que el detalle, pero conserva las
 * banderas del tipo de propiedad que usan las tarjetas.
 */
export function toPublicPropertyListItem(property: any): Record<string, unknown> {
  const out = toPublicPropertyDetail(property);
  const type = property?.propertyType;
  if (type) {
    out.propertyType = {
      id: type.id,
      name: type.name,
      hasBedrooms: type.hasBedrooms,
      hasBathrooms: type.hasBathrooms,
      hasBuiltSquareMeters: type.hasBuiltSquareMeters,
      hasLandSquareMeters: type.hasLandSquareMeters,
      hasParkingSpaces: type.hasParkingSpaces,
      hasFloors: type.hasFloors,
      hasConstructionYear: type.hasConstructionYear,
    };
  }
  return out;
}
