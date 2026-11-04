import { BadRequestException, ConflictException } from '@nestjs/common';
import { PropertyTypeRepository } from '../domain/property-type.repository';
import { PropertyType } from '../domain/property-type.entity';

export const DUPLICATE_NAME_MESSAGE = 'El nombre del tipo de propiedad ya existe';

/** Características (has*) que se pueden cambiar. */
export const FEATURE_FLAGS = [
  'hasBedrooms',
  'hasBathrooms',
  'hasBuiltSquareMeters',
  'hasLandSquareMeters',
  'hasParkingSpaces',
  'hasFloors',
  'hasConstructionYear',
] as const;

/** Recorta el nombre y rechaza uno vacío. */
export function normalizeTypeName(raw: unknown): string {
  const name = typeof raw === 'string' ? raw.trim() : '';
  if (!name) throw new BadRequestException('El nombre es obligatorio');
  return name;
}

/** Descripción recortada; vacía = null (borrada). */
export function normalizeDescription(raw: unknown): string | null {
  return typeof raw === 'string' && raw.trim() ? raw.trim() : null;
}

/** Solo las características con valor booleano. */
export function pickFeatures(source: Record<string, unknown> | undefined): Record<string, boolean> {
  const out: Record<string, boolean> = {};
  for (const flag of FEATURE_FLAGS) {
    const value = source?.[flag];
    if (typeof value === 'boolean') out[flag] = value;
  }
  return out;
}

/** Escapa % _ \ para buscar texto literal con LIKE. */
export const escapeLike = (text: string): string => text.replace(/[\\%_]/g, (c) => `\\${c}`);

/** ¿Es el error de "valor único repetido" de MySQL? (dos personas guardando el mismo nombre a la vez) */
export const isDuplicateKeyError = (err: unknown): boolean => {
  const e = err as { code?: string; errno?: number; driverError?: { code?: string } } | undefined;
  return e?.code === 'ER_DUP_ENTRY' || e?.driverError?.code === 'ER_DUP_ENTRY' || e?.errno === 1062;
};

/**
 * Nombre con el que queda un tipo eliminado. La columna `name` es única también entre los
 * eliminados, así que sin esto un tipo borrado seguiría "reservando" su nombre y no se podría
 * volver a crear ni usar al renombrar otro.
 */
export function deletedNameFor(name: string, id: string, now: Date = new Date()): string {
  const suffix = ` [eliminado ${now.toISOString().slice(0, 10)} ${id.slice(0, 8)}]`;
  return name.slice(0, 255 - suffix.length) + suffix;
}

/**
 * Libera el nombre si lo tiene un tipo ya eliminado (también cubre eliminados que se
 * guardaron antes de que existiera esta regla).
 */
export async function freeDeletedName(repo: PropertyTypeRepository, name: string): Promise<void> {
  const holders: PropertyType[] = await repo.find({ where: { name }, withDeleted: true });
  for (const holder of holders) {
    if (holder.deletedAt) {
      await repo.update(holder.id, { name: deletedNameFor(holder.name, holder.id) });
    }
  }
}

/** Conflicto de nombre repetido. */
export const duplicateNameError = () => new ConflictException(DUPLICATE_NAME_MESSAGE);
