/** Stable keys — must match core/src/modules/property/domain/other-features.ts */
export const OTHER_FEATURE_KEYS = [
  'AIR_CONDITIONING',
  'ALARM',
  'GUEST_BATHROOM',
  'VISITOR_PARKING',
  'GYM',
  'GARDEN',
  'BBQ',
  'POOL',
  'FURNISHED',
  'COMMERCIAL_USE',
] as const;

export type OtherFeatureKey = (typeof OTHER_FEATURE_KEYS)[number];

export const OTHER_FEATURE_LABELS: Record<OtherFeatureKey, string> = {
  AIR_CONDITIONING: 'Con aire acondicionado',
  ALARM: 'Con alarma',
  GUEST_BATHROOM: 'Con baño de visitas',
  VISITOR_PARKING: 'Con estacionamiento de visitas',
  GYM: 'Con gimnasio',
  GARDEN: 'Con jardín',
  BBQ: 'Con parrilla',
  POOL: 'Con piscina',
  FURNISHED: 'Es amoblado',
  COMMERCIAL_USE: 'Uso comercial',
};

export const OTHER_FEATURE_OPTIONS = OTHER_FEATURE_KEYS.map((key) => ({
  key,
  label: OTHER_FEATURE_LABELS[key],
}));

const KEY_SET = new Set<string>(OTHER_FEATURE_KEYS);

export function isOtherFeatureKey(value: string): value is OtherFeatureKey {
  return KEY_SET.has(value);
}

export function normalizeOtherFeatures(input: unknown): OtherFeatureKey[] {
  if (!Array.isArray(input)) return [];
  const seen = new Set<string>();
  for (const item of input) {
    if (typeof item !== 'string') continue;
    const key = item.trim();
    if (!isOtherFeatureKey(key) || seen.has(key)) continue;
    seen.add(key);
  }
  return OTHER_FEATURE_KEYS.filter((key) => seen.has(key));
}

export function labelsForOtherFeatures(keys: unknown): string[] {
  return normalizeOtherFeatures(keys).map((key) => OTHER_FEATURE_LABELS[key]);
}
