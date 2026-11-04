import { randomUUID } from 'crypto';
import {
  ChangeHistoryEntry,
  HistoryChannel,
  HistoryKind,
  HistorySource,
} from '../../../shared/interfaces/property.interfaces';

/** Quién hace el cambio y desde dónde. */
export interface HistoryContext {
  userId?: string;
  channel?: HistoryChannel;
  /** Fuerza la sección (si no, se deduce del campo cambiado). */
  section?: string;
  ref?: string;
}

/** Campos de la propiedad cuyos cambios se registran. */
export const TRACKED_FIELDS = [
  'title',
  'description',
  'status',
  'operationType',
  'price',
  'currencyPrice',
  'assignedAgentId',
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
  'seoTitle',
  'seoDescription',
  'seoKeywords',
  'isFeatured',
  'mainImageUrl',
] as const;

const TRACKED = new Set<string>(TRACKED_FIELDS);

const FIELD_SECTIONS: Record<string, string> = {
  title: 'Información básica',
  description: 'Información básica',
  status: 'Información básica',
  operationType: 'Información básica',
  price: 'Información básica',
  currencyPrice: 'Información básica',
  assignedAgentId: 'Información básica',
  propertyTypeId: 'Información básica',
  builtSquareMeters: 'Características',
  landSquareMeters: 'Características',
  bedrooms: 'Características',
  bathrooms: 'Características',
  parkingSpaces: 'Características',
  floors: 'Características',
  constructionYear: 'Características',
  otherFeatures: 'Características',
  state: 'Ubicación',
  city: 'Ubicación',
  address: 'Ubicación',
  latitude: 'Ubicación',
  longitude: 'Ubicación',
  seoTitle: 'SEO y marketing',
  seoDescription: 'SEO y marketing',
  seoKeywords: 'SEO y marketing',
  isFeatured: 'SEO y marketing',
  mainImageUrl: 'Multimedia',
};

export const sectionForField = (field: string): string | undefined =>
  FIELD_SECTIONS[field];

/** Canal según el token: staff = backoffice, comunidad = portal. */
export function channelFromUser(user?: {
  authAudience?: string;
  role?: string;
}): HistoryChannel {
  if (user?.authAudience === 'staff') return 'BACKOFFICE';
  if (user?.authAudience === 'community') return 'PORTAL';
  if (user?.role === 'ADMIN' || user?.role === 'AGENT') return 'BACKOFFICE';
  if (user?.role === 'COMMUNITY') return 'PORTAL';
  return 'SYSTEM';
}

/** Contexto de historial a partir de la petición HTTP. */
export function historyContextFromRequest(
  req: any,
  extra: Partial<HistoryContext> = {},
): HistoryContext {
  const user = req?.user;
  const userId = user?.id || user?.sub || (typeof user === 'string' ? user : undefined);
  return { userId, channel: channelFromUser(user), ...extra };
}

const isEmptyish = (v: unknown): boolean =>
  v === null ||
  v === undefined ||
  v === '' ||
  (Array.isArray(v) && v.length === 0) ||
  (typeof v === 'object' &&
    !Array.isArray(v) &&
    !(v instanceof Date) &&
    Object.keys(v as object).length === 0);

/**
 * Igualdad "de negocio": null, '' y [] cuentan como vacío; los números se comparan como
 * números (MySQL devuelve decimales como texto); los textos sin espacios sobrantes; y las
 * listas/objetos por contenido (no por referencia).
 */
export function valuesEqual(a: unknown, b: unknown): boolean {
  if (isEmptyish(a) || isEmptyish(b)) return isEmptyish(a) && isEmptyish(b);
  if (a instanceof Date || b instanceof Date) {
    return new Date(a as any).getTime() === new Date(b as any).getTime();
  }
  if (Array.isArray(a) || Array.isArray(b)) {
    if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) return false;
    return a.every((item, i) => valuesEqual(item, b[i]));
  }
  if (typeof a === 'object' || typeof b === 'object') {
    if (typeof a !== 'object' || typeof b !== 'object') return false;
    const ka = Object.keys(a as object);
    const kb = Object.keys(b as object);
    if (ka.length !== kb.length) return false;
    return ka.every((k) => valuesEqual((a as any)[k], (b as any)[k]));
  }
  if (typeof a === 'boolean' || typeof b === 'boolean') {
    return Boolean(a) === Boolean(b);
  }
  const na = Number(a);
  const nb = Number(b);
  const bothNumeric =
    (typeof a === 'number' || (typeof a === 'string' && a.trim() !== '' && !Number.isNaN(na))) &&
    (typeof b === 'number' || (typeof b === 'string' && b.trim() !== '' && !Number.isNaN(nb)));
  if (bothNumeric) return na === nb;
  return String(a).trim() === String(b).trim();
}

/** Valor a guardar: lo vacío se guarda como null y los decimales de MySQL como número. */
const storable = (v: unknown): unknown => (isEmptyish(v) ? null : v);

/**
 * Publicación = pasar a Publicada; despublicación = dejarla Inactiva estando publicada.
 * Cualquier otro cambio es un cambio de estado: "Contrato en progreso", Vendida, Arrendada y
 * también volver a Publicada cuando un contrato falla (eso es liberar la propiedad, no publicarla).
 */
export function kindForStatus(previous: unknown, next: unknown): HistoryKind {
  if (next === 'PUBLISHED' && previous !== 'CONTRACT-IN-PROGRESS') return 'PUBLISHED';
  if (previous === 'PUBLISHED' && next === 'INACTIVE') return 'UNPUBLISHED';
  return 'STATUS_CHANGED';
}

export function buildSource(
  ctx: HistoryContext | undefined,
  section?: string,
): HistorySource {
  const source: HistorySource = { channel: ctx?.channel ?? 'SYSTEM' };
  const resolved = ctx?.section ?? section;
  if (resolved) source.section = resolved;
  if (ctx?.ref) source.ref = ctx.ref;
  return source;
}

/**
 * Entradas de historial para un cambio de campos. Solo incluye los campos seguidos que
 * realmente cambiaron. Todas comparten `groupId` (una operación = un evento).
 */
export function diffProperty(
  current: Record<string, any>,
  patch: Record<string, any>,
  ctx: HistoryContext | undefined,
  now: Date = new Date(),
  groupId: string = randomUUID(),
): ChangeHistoryEntry[] {
  const entries: ChangeHistoryEntry[] = [];
  const nextCurrency = patch.currencyPrice ?? current.currencyPrice;
  for (const [field, next] of Object.entries(patch)) {
    if (!TRACKED.has(field) || next === undefined) continue;
    const previous = current[field];
    if (valuesEqual(previous, next)) continue;

    const entry: ChangeHistoryEntry = {
      timestamp: now,
      changedBy: ctx?.userId || 'system',
      field,
      previousValue: storable(previous),
      newValue: storable(next),
      kind: field === 'status' ? kindForStatus(previous, next) : 'UPDATED',
      source: buildSource(ctx, sectionForField(field)),
      groupId,
    };
    if (field === 'price') {
      if (nextCurrency) entry.unit = nextCurrency;
      if (current.currencyPrice && current.currencyPrice !== nextCurrency) {
        entry.previousUnit = current.currencyPrice;
      }
    }
    entries.push(entry);
  }
  return entries;
}

/** Entrada para un evento que no es un cambio de campo (creación, multimedia, notas…). */
export function eventEntry(
  input: {
    field: string;
    kind: HistoryKind;
    previousValue?: unknown;
    newValue?: unknown;
    section?: string;
    meta?: ChangeHistoryEntry['meta'];
  },
  ctx: HistoryContext | undefined,
  now: Date = new Date(),
  groupId: string = randomUUID(),
): ChangeHistoryEntry {
  return {
    timestamp: now,
    changedBy: ctx?.userId || 'system',
    field: input.field,
    previousValue: input.previousValue ?? null,
    newValue: input.newValue ?? null,
    kind: input.kind,
    source: buildSource(ctx, input.section),
    groupId,
    ...(input.meta ? { meta: input.meta } : {}),
  };
}

/**
 * Agrega entradas al historial de forma atómica (una sola sentencia SQL), sin leer y
 * reescribir la propiedad: dos eventos simultáneos no se pisan.
 * `runner` es un EntityManager o QueryRunner de TypeORM.
 */
export async function appendPropertyHistory(
  runner: { query: (sql: string, params?: any[]) => Promise<any> },
  propertyId: string,
  entries: ChangeHistoryEntry[],
): Promise<void> {
  if (!propertyId || entries.length === 0) return;
  await runner.query(
    'UPDATE `properties` SET `changeHistory` = JSON_MERGE_PRESERVE(COALESCE(`changeHistory`, JSON_ARRAY()), CAST(? AS JSON)) WHERE `id` = ?',
    [JSON.stringify(entries), propertyId],
  );
}
