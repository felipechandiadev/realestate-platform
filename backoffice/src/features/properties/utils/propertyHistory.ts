/**
 * Lógica pura del historial de una propiedad: agrupa las entradas en eventos, decide el
 * título y el origen ("dónde se hizo") y formatea los valores anterior / nuevo.
 */
import { OTHER_FEATURE_LABELS } from '@realestate/ui';
import { formatPropertyPrice } from './formatPropertyPrice';
import { getStatusInSpanish } from './statusTranslation';

export type HistoryKind =
  | 'CREATED'
  | 'UPDATED'
  | 'PUBLISHED'
  | 'UNPUBLISHED'
  | 'STATUS_CHANGED'
  | 'MEDIA'
  | 'NOTE'
  | 'DELETED';

export type HistoryChannel = 'BACKOFFICE' | 'PORTAL' | 'CONTRACT' | 'SYSTEM';

export interface HistoryEntry {
  timestamp: string | Date;
  changedBy: string;
  changedById?: string | null;
  field: string;
  previousValue: unknown;
  newValue: unknown;
  kind?: HistoryKind;
  source?: { channel: HistoryChannel; section?: string; ref?: string };
  groupId?: string;
  unit?: string;
  previousUnit?: string;
  /** Nombre legible (agente, tipo de propiedad) que agrega el backend. */
  previousDisplay?: string;
  newDisplay?: string;
  /** Cantidades de una carga de multimedia. */
  meta?: { images?: number; videos?: number };
}

export interface HistoryEvent {
  key: string;
  timestamp: Date;
  changedBy: string;
  changedById?: string | null;
  kind: HistoryKind;
  title: string;
  /** "Backoffice · Ubicación", "Contrato CT-0001"… o null si la entrada es anterior al registro de origen. */
  origin: string | null;
  entries: HistoryEntry[];
  /** Uso interno al juntar cargas de multimedia. */
  oldestTimestamp?: Date;
}

const FIELD_LABELS: Record<string, string> = {
  creation: 'Creación',
  deletion: 'Eliminación',
  title: 'Título',
  description: 'Descripción',
  status: 'Estado',
  operationType: 'Tipo de operación',
  price: 'Precio',
  currencyPrice: 'Moneda',
  assignedAgentId: 'Agente asignado',
  creatorUserId: 'Creado por',
  propertyTypeId: 'Tipo de propiedad',
  builtSquareMeters: 'm² construidos',
  landSquareMeters: 'm² de terreno',
  bedrooms: 'Dormitorios',
  bathrooms: 'Baños',
  parkingSpaces: 'Estacionamientos',
  floors: 'Pisos',
  constructionYear: 'Año de construcción',
  otherFeatures: 'Otras características',
  state: 'Región',
  city: 'Comuna',
  address: 'Dirección',
  latitude: 'Latitud',
  longitude: 'Longitud',
  seoTitle: 'Título SEO',
  seoDescription: 'Descripción SEO',
  seoKeywords: 'Palabras clave SEO',
  isFeatured: 'Destacada',
  mainImageUrl: 'Imagen principal',
  multimedia: 'Galería',
  internalNotes: 'Notas internas',
};

export const fieldLabel = (field: string): string => {
  const key = field?.trim() ?? '';
  if (!key) return '—';
  return FIELD_LABELS[key] ?? FIELD_LABELS[key.toLowerCase()] ?? key;
};

const CHANNEL_LABELS: Record<HistoryChannel, string> = {
  BACKOFFICE: 'Backoffice',
  PORTAL: 'Portal',
  CONTRACT: 'Contrato',
  SYSTEM: 'Sistema',
};

/** Tipo de evento de una entrada; las anteriores al registro de eventos se deducen del campo. */
export function entryKind(entry: HistoryEntry): HistoryKind {
  if (entry.kind) return entry.kind;
  if (entry.field === 'creation') return 'CREATED';
  if (entry.field === 'status') {
    if (entry.newValue === 'PUBLISHED' && entry.previousValue !== 'CONTRACT-IN-PROGRESS') return 'PUBLISHED';
    if (entry.previousValue === 'PUBLISHED' && entry.newValue === 'INACTIVE') return 'UNPUBLISHED';
    return 'STATUS_CHANGED';
  }
  return 'UPDATED';
}

const KIND_PRIORITY: HistoryKind[] = [
  'DELETED',
  'CREATED',
  'PUBLISHED',
  'UNPUBLISHED',
  'STATUS_CHANGED',
  'NOTE',
  'MEDIA',
  'UPDATED',
];

const KIND_TITLES: Record<HistoryKind, string> = {
  CREATED: 'Creación de la propiedad',
  PUBLISHED: 'Publicación',
  UNPUBLISHED: 'Despublicación',
  STATUS_CHANGED: 'Cambio de estado',
  DELETED: 'Eliminación de la propiedad',
  NOTE: 'Nota interna',
  MEDIA: 'Multimedia',
  UPDATED: 'Edición',
};

export function eventKind(entries: HistoryEntry[]): HistoryKind {
  const kinds = new Set(entries.map(entryKind));
  return KIND_PRIORITY.find((k) => kinds.has(k)) ?? 'UPDATED';
}

export function eventTitle(kind: HistoryKind): string {
  return KIND_TITLES[kind];
}

/** "Backoffice · Información básica, Ubicación" / "Contrato CT-0001" / null (sin dato). */
export function originLabel(entries: HistoryEntry[]): string | null {
  const sources = entries.map((e) => e.source).filter((s): s is NonNullable<HistoryEntry['source']> => !!s);
  if (sources.length === 0) return null;
  const { channel, ref } = sources[0];
  if (channel === 'CONTRACT') return ref ? `Contrato ${ref}` : 'Contrato';
  const sections = Array.from(new Set(sources.map((s) => s.section).filter((v): v is string => !!v)));
  const base = CHANNEL_LABELS[channel] ?? channel;
  return sections.length ? `${base} · ${sections.join(', ')}` : base;
}

const toDate = (value: string | Date): Date => {
  const d = value instanceof Date ? value : new Date(value);
  return Number.isNaN(d.getTime()) ? new Date(0) : d;
};

/**
 * Agrupa las entradas en eventos (una operación = un evento), del más reciente al más
 * antiguo. Las entradas sin `groupId` (anteriores) se agrupan por autor y segundo.
 */
export function groupHistory(entries: HistoryEntry[]): HistoryEvent[] {
  const groups = new Map<string, HistoryEntry[]>();
  for (const entry of entries) {
    const when = toDate(entry.timestamp);
    const actor = entry.changedById || entry.changedBy || '';
    const key = entry.groupId || `legacy:${actor}:${Math.floor(when.getTime() / 1000)}`;
    const bucket = groups.get(key);
    if (bucket) bucket.push(entry);
    else groups.set(key, [entry]);
  }

  const events: HistoryEvent[] = [];
  for (const [key, list] of groups) {
    const kind = eventKind(list);
    events.push({
      key,
      timestamp: list.reduce((latest, e) => (toDate(e.timestamp) > latest ? toDate(e.timestamp) : latest), new Date(0)),
      changedBy: list[0].changedBy,
      changedById: list[0].changedById,
      kind,
      title: eventTitle(kind),
      origin: originLabel(list),
      entries: list,
    });
  }
  // Más reciente primero; a igual fecha, el que se registró después.
  const sorted = events
    .map((event, index) => ({ event, index }))
    .sort((a, b) => b.event.timestamp.getTime() - a.event.timestamp.getTime() || b.index - a.index)
    .map(({ event }) => event);
  return mergeMediaUploads(sorted);
}

/** Entre una carga de imagen y la siguiente puede pasar hasta este tiempo para considerarlas una sola. */
export const MEDIA_MERGE_WINDOW_MS = 10 * 60 * 1000;

const isMediaUpload = (event: HistoryEvent): boolean =>
  event.kind === 'MEDIA' &&
  event.entries.every(
    (e) => (e.field === 'multimedia' && !!e.meta) || e.field === 'mainImageUrl',
  );

const mediaText = (images: number, videos: number): string => {
  const parts: string[] = [];
  if (images) parts.push(`${images} ${images === 1 ? 'imagen' : 'imágenes'}`);
  if (videos) parts.push(`${videos} ${videos === 1 ? 'video' : 'videos'}`);
  return `Se ${images + videos === 1 ? 'agregó' : 'agregaron'} ${parts.join(' y ')}`;
};

/**
 * El backoffice sube las imágenes de a una, así que cada imagen deja su propio evento.
 * Las cargas consecutivas del mismo usuario se muestran como un solo evento
 * ("Se agregaron 3 imágenes"). Recibe los eventos del más reciente al más antiguo.
 */
export function mergeMediaUploads(events: HistoryEvent[]): HistoryEvent[] {
  const result: HistoryEvent[] = [];
  for (const event of events) {
    const previous = result[result.length - 1];
    const sameActor =
      previous && (previous.changedById || previous.changedBy) === (event.changedById || event.changedBy);
    const close =
      previous &&
      previous.oldestTimestamp !== undefined &&
      previous.oldestTimestamp.getTime() - event.timestamp.getTime() <= MEDIA_MERGE_WINDOW_MS;

    if (previous && sameActor && close && isMediaUpload(previous) && isMediaUpload(event)) {
      const all = [...previous.entries, ...event.entries];
      const uploads = all.filter((e) => e.field === 'multimedia');
      const images = uploads.reduce((n, e) => n + (e.meta?.images ?? 0), 0);
      const videos = uploads.reduce((n, e) => n + (e.meta?.videos ?? 0), 0);
      // La imagen principal que se fijó primero (la carga más antigua) es la que importa.
      const main = [...all].reverse().find((e) => e.field === 'mainImageUrl');
      const base = uploads[0];
      previous.entries = [
        { ...base, newValue: mediaText(images, videos), meta: { images, videos } },
        ...(main ? [main] : []),
      ];
      previous.oldestTimestamp = event.timestamp;
      continue;
    }
    result.push({ ...event, oldestTimestamp: event.timestamp });
  }
  return result.map(({ oldestTimestamp: _drop, ...rest }) => rest);
}

const OPERATION_LABELS: Record<string, string> = { SALE: 'Venta', RENT: 'Arriendo' };

const basename = (url: string): string => {
  const clean = url.split('?')[0];
  return clean.split('/').filter(Boolean).pop() ?? url;
};

/** Valor legible de una entrada: `which` = 'previous' | 'new'. */
export function formatHistoryValue(entry: HistoryEntry, which: 'previous' | 'new'): string {
  const value = which === 'previous' ? entry.previousValue : entry.newValue;
  const display = which === 'previous' ? entry.previousDisplay : entry.newDisplay;
  if (display) return display;
  if (value === null || value === undefined || value === '') return '—';
  if (typeof value === 'boolean') return value ? 'Sí' : 'No';

  switch (entry.field) {
    case 'price': {
      const unit = which === 'previous' ? entry.previousUnit ?? entry.unit : entry.unit;
      const amount = Number(value);
      return Number.isFinite(amount) ? formatPropertyPrice(amount, unit) : String(value);
    }
    case 'otherFeatures': {
      if (!Array.isArray(value) || value.length === 0) return '—';
      return value
        .map((key) => (OTHER_FEATURE_LABELS as Record<string, string>)[String(key)] ?? String(key))
        .join(', ');
    }
    case 'status':
      return getStatusInSpanish(String(value));
    case 'operationType':
      return OPERATION_LABELS[String(value)] ?? String(value);
    case 'mainImageUrl':
      return basename(String(value));
    case 'latitude':
    case 'longitude': {
      const n = Number(value);
      return Number.isFinite(n) ? n.toFixed(6) : String(value);
    }
    case 'creation':
      return value === 'Created' ? 'Creada' : String(value);
    default:
      break;
  }

  if (Array.isArray(value)) return value.length ? value.map(String).join(', ') : '—';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value).trim() || '—';
}

/**
 * Texto de una línea para los eventos que no son un cambio de campo (creación, multimedia,
 * notas, eliminación). `null` = es un cambio de campo y se muestra "anterior → nuevo".
 */
export function describeEntry(entry: HistoryEntry): string | null {
  const kind = entryKind(entry);
  if (kind === 'CREATED') return 'Propiedad creada';
  if (kind === 'DELETED') return 'Propiedad eliminada';
  if (kind === 'NOTE') return typeof entry.newValue === 'string' ? entry.newValue : 'Nota interna';
  if (entry.field === 'multimedia') {
    if (entry.newValue) return String(entry.newValue);
    return entry.previousValue ? `Se eliminó el archivo «${entry.previousValue}»` : 'Se eliminó un archivo';
  }
  return null;
}
