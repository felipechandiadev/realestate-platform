import { describe, it, expect, jest } from '@jest/globals';

jest.mock('@realestate/ui', () => ({
  OTHER_FEATURE_LABELS: { POOL: 'Con piscina', GYM: 'Con gimnasio' },
}));

import {
  describeEntry,
  entryKind,
  eventKind,
  fieldLabel,
  formatHistoryValue,
  groupHistory,
  originLabel,
  type HistoryEntry,
} from '../src/features/properties/utils/propertyHistory';

const entry = (over: Partial<HistoryEntry> = {}): HistoryEntry => ({
  timestamp: '2026-11-04T15:00:00.000Z',
  changedBy: 'Ana Pérez',
  changedById: 'u1',
  field: 'title',
  previousValue: 'A',
  newValue: 'B',
  ...over,
});

describe('groupHistory', () => {
  it('une en un solo evento las entradas con el mismo groupId y deja el más reciente primero', () => {
    const events = groupHistory([
      entry({ groupId: 'g1', field: 'address', timestamp: '2026-11-04T15:00:01.000Z' }),
      entry({ groupId: 'g1', field: 'latitude', timestamp: '2026-11-04T15:00:01.000Z' }),
      entry({ groupId: 'g2', field: 'title', timestamp: '2026-11-04T16:00:00.000Z' }),
    ]);
    expect(events).toHaveLength(2);
    expect(events[0].entries.map((e) => e.field)).toEqual(['title']);
    expect(events[1].entries.map((e) => e.field)).toEqual(['address', 'latitude']);
  });

  it('las entradas antiguas (sin groupId) se agrupan por autor y segundo', () => {
    const events = groupHistory([
      entry({ field: 'address', timestamp: '2026-11-04T15:00:00.100Z' }),
      entry({ field: 'latitude', timestamp: '2026-11-04T15:00:00.800Z' }),
      entry({ field: 'longitude', timestamp: '2026-11-04T15:00:00.900Z' }),
      entry({ field: 'title', timestamp: '2026-11-04T15:00:05.000Z' }),
      entry({ field: 'price', timestamp: '2026-11-04T15:00:00.500Z', changedById: 'otro', changedBy: 'Luis' }),
    ]);
    expect(events.map((e) => e.entries.map((x) => x.field))).toEqual([
      ['title'],
      ['address', 'latitude', 'longitude'],
      ['price'],
    ]);
  });

  it('a igual fecha, el evento registrado después aparece primero', () => {
    const events = groupHistory([
      entry({ groupId: 'a', field: 'creation', timestamp: '2026-11-04T15:00:00.000Z' }),
      entry({ groupId: 'b', field: 'title', timestamp: '2026-11-04T15:00:00.000Z' }),
    ]);
    expect(events.map((e) => e.key)).toEqual(['b', 'a']);
  });

  it('lista vacía', () => {
    expect(groupHistory([])).toEqual([]);
  });
});

describe('juntar cargas seguidas de multimedia', () => {
  const upload = (n: number, at: string, over: Partial<HistoryEntry> = {}, withMain = false): HistoryEntry[] => [
    entry({
      groupId: `up-${at}`, timestamp: at, kind: 'MEDIA', field: 'multimedia', previousValue: null,
      newValue: 'Se agregó 1 imagen', meta: { images: n, videos: 0 }, ...over,
    }),
    ...(withMain
      ? [entry({ groupId: `up-${at}`, timestamp: at, kind: 'UPDATED', field: 'mainImageUrl', previousValue: null, newValue: `http://x/${at}.jpg`, ...over })]
      : []),
  ];

  it('tres imágenes subidas una a una se ven como un solo evento y conservan la imagen principal', () => {
    const events = groupHistory([
      ...upload(1, '2026-11-04T15:00:00.000Z', {}, true),
      ...upload(1, '2026-11-04T15:00:03.000Z'),
      ...upload(1, '2026-11-04T15:00:06.000Z'),
    ]);
    expect(events).toHaveLength(1);
    expect(events[0].title).toBe('Multimedia');
    const [summary, main] = events[0].entries;
    expect(describeEntry(summary)).toBe('Se agregaron 3 imágenes');
    expect(main.field).toBe('mainImageUrl');
    expect(main.newValue).toBe('http://x/2026-11-04T15:00:00.000Z.jpg');
    expect(events[0].timestamp.toISOString()).toBe('2026-11-04T15:00:06.000Z');
  });

  it('suma imágenes y videos', () => {
    const events = groupHistory([
      ...upload(2, '2026-11-04T15:00:00.000Z'),
      ...upload(1, '2026-11-04T15:00:02.000Z', { meta: { images: 0, videos: 1 } }),
    ]);
    expect(describeEntry(events[0].entries[0])).toBe('Se agregaron 2 imágenes y 1 video');
  });

  it('no junta cargas de otro usuario, separadas por más de 10 minutos, ni con otro evento en medio', () => {
    const otherUser = groupHistory([
      ...upload(1, '2026-11-04T15:00:00.000Z'),
      ...upload(1, '2026-11-04T15:00:03.000Z', { changedById: 'u2', changedBy: 'Luis' }),
    ]);
    expect(otherUser).toHaveLength(2);

    const farApart = groupHistory([
      ...upload(1, '2026-11-04T15:00:00.000Z'),
      ...upload(1, '2026-11-04T15:30:00.000Z'),
    ]);
    expect(farApart).toHaveLength(2);

    const withEditBetween = groupHistory([
      ...upload(1, '2026-11-04T15:00:00.000Z'),
      entry({ groupId: 'edit', timestamp: '2026-11-04T15:00:02.000Z', field: 'title' }),
      ...upload(1, '2026-11-04T15:00:04.000Z'),
    ]);
    expect(withEditBetween).toHaveLength(3);
  });

  it('las entradas antiguas de multimedia (sin cantidades) no se tocan', () => {
    const events = groupHistory([
      entry({ groupId: 'a', timestamp: '2026-11-04T15:00:00.000Z', kind: 'MEDIA', field: 'multimedia', newValue: 'Se agregó 1 imagen' }),
      entry({ groupId: 'b', timestamp: '2026-11-04T15:00:02.000Z', kind: 'MEDIA', field: 'multimedia', newValue: 'Se agregó 1 imagen' }),
    ]);
    expect(events).toHaveLength(2);
  });
});

describe('tipo de evento y título', () => {
  it('deduce el tipo de las entradas antiguas', () => {
    expect(entryKind(entry({ field: 'creation' }))).toBe('CREATED');
    expect(entryKind(entry({ field: 'status', previousValue: 'INACTIVE', newValue: 'PUBLISHED' }))).toBe('PUBLISHED');
    expect(entryKind(entry({ field: 'status', previousValue: 'PUBLISHED', newValue: 'INACTIVE' }))).toBe('UNPUBLISHED');
    expect(entryKind(entry({ field: 'status', previousValue: 'PUBLISHED', newValue: 'SOLD' }))).toBe('STATUS_CHANGED');
    expect(entryKind(entry({ field: 'status', previousValue: 'CONTRACT-IN-PROGRESS', newValue: 'PUBLISHED' }))).toBe('STATUS_CHANGED');
    expect(entryKind(entry({ field: 'title' }))).toBe('UPDATED');
    expect(entryKind(entry({ kind: 'MEDIA' }))).toBe('MEDIA');
  });

  it('publicar manda sobre las otras ediciones del mismo evento', () => {
    expect(eventKind([entry({ kind: 'UPDATED' }), entry({ kind: 'PUBLISHED', field: 'status' })])).toBe('PUBLISHED');
    expect(eventKind([entry({ kind: 'UPDATED' })])).toBe('UPDATED');
  });

  it('el título sale del tipo', () => {
    const [created] = groupHistory([entry({ groupId: 'x', kind: 'CREATED', field: 'creation' })]);
    expect(created.title).toBe('Creación de la propiedad');
    const [published] = groupHistory([entry({ groupId: 'y', kind: 'PUBLISHED', field: 'status' })]);
    expect(published.title).toBe('Publicación');
  });
});

describe('originLabel (dónde se hizo)', () => {
  it('canal y secciones sin repetir', () => {
    expect(
      originLabel([
        entry({ source: { channel: 'BACKOFFICE', section: 'Ubicación' } }),
        entry({ source: { channel: 'BACKOFFICE', section: 'Ubicación' } }),
        entry({ source: { channel: 'BACKOFFICE', section: 'Información básica' } }),
      ]),
    ).toBe('Backoffice · Ubicación, Información básica');
    expect(originLabel([entry({ source: { channel: 'PORTAL' } })])).toBe('Portal');
  });

  it('un contrato muestra su código', () => {
    expect(originLabel([entry({ source: { channel: 'CONTRACT', section: 'Contrato', ref: 'CT-0001' } })])).toBe('Contrato CT-0001');
    expect(originLabel([entry({ source: { channel: 'CONTRACT' } })])).toBe('Contrato');
  });

  it('entradas antiguas, sin origen registrado -> null', () => {
    expect(originLabel([entry()])).toBeNull();
  });
});

describe('formatHistoryValue', () => {
  it('precio con formato y la moneda de ese momento', () => {
    const e = entry({ field: 'price', previousValue: '100000000.00', newValue: 3500, unit: 'UF', previousUnit: 'CLP' });
    expect(formatHistoryValue(e, 'previous').replace(/\s/g, ' ')).toMatch(/^\$\s?100\.000\.000$/);
    expect(formatHistoryValue(e, 'new')).toMatch(/^UF\s3\.500,00$/);
  });

  it('usa el nombre legible que manda el backend (agente, tipo)', () => {
    const e = entry({ field: 'assignedAgentId', previousValue: null, newValue: 'uuid', newDisplay: 'Carlos Navarro' });
    expect(formatHistoryValue(e, 'previous')).toBe('—');
    expect(formatHistoryValue(e, 'new')).toBe('Carlos Navarro');
  });

  it('estado, operación, booleanos y vacíos', () => {
    expect(formatHistoryValue(entry({ field: 'status', newValue: 'PUBLISHED' }), 'new')).toBe('Publicada');
    expect(formatHistoryValue(entry({ field: 'operationType', newValue: 'SALE' }), 'new')).toBe('Venta');
    expect(formatHistoryValue(entry({ field: 'isFeatured', newValue: true, previousValue: false }), 'new')).toBe('Sí');
    expect(formatHistoryValue(entry({ field: 'isFeatured', newValue: true, previousValue: false }), 'previous')).toBe('No');
    expect(formatHistoryValue(entry({ newValue: null }), 'new')).toBe('—');
    expect(formatHistoryValue(entry({ newValue: '' }), 'new')).toBe('—');
  });

  it('otras características con su nombre en español y sin mostrar corchetes', () => {
    const e = entry({ field: 'otherFeatures', previousValue: [], newValue: ['POOL', 'GYM', 'DESCONOCIDA'] });
    expect(formatHistoryValue(e, 'previous')).toBe('—');
    expect(formatHistoryValue(e, 'new')).toBe('Con piscina, Con gimnasio, DESCONOCIDA');
  });

  it('coordenadas, imagen principal y creación', () => {
    expect(formatHistoryValue(entry({ field: 'latitude', newValue: -33.5 }), 'new')).toBe('-33.500000');
    expect(formatHistoryValue(entry({ field: 'mainImageUrl', newValue: 'http://x/public/properties/abc/full.webp?v=1' }), 'new')).toBe('full.webp');
    expect(formatHistoryValue(entry({ field: 'creation', newValue: 'Created' }), 'new')).toBe('Creada');
  });
});

describe('describeEntry / fieldLabel', () => {
  it('eventos que no son un cambio de campo se describen en una línea', () => {
    expect(describeEntry(entry({ kind: 'CREATED', field: 'creation' }))).toBe('Propiedad creada');
    expect(describeEntry(entry({ kind: 'DELETED', field: 'deletion' }))).toBe('Propiedad eliminada');
    expect(describeEntry(entry({ kind: 'NOTE', field: 'internalNotes', newValue: 'Nota agregada' }))).toBe('Nota agregada');
    expect(describeEntry(entry({ kind: 'MEDIA', field: 'multimedia', previousValue: null, newValue: 'Se agregaron 2 imágenes' }))).toBe('Se agregaron 2 imágenes');
    expect(describeEntry(entry({ kind: 'MEDIA', field: 'multimedia', previousValue: 'fachada.jpg', newValue: null }))).toBe('Se eliminó el archivo «fachada.jpg»');
  });

  it('un cambio de campo no tiene descripción de una línea', () => {
    expect(describeEntry(entry({ field: 'title' }))).toBeNull();
  });

  it('nombres de campo en español, y el original si no se conoce', () => {
    expect(fieldLabel('otherFeatures')).toBe('Otras características');
    expect(fieldLabel('assignedAgentId')).toBe('Agente asignado');
    expect(fieldLabel('campoRaro')).toBe('campoRaro');
    expect(fieldLabel('')).toBe('—');
  });
});
