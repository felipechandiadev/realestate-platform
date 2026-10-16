/**
 * Fixed catalog of optional property amenities ("otras características").
 * Keys are stable; Spanish labels live in UI packages.
 */
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

const OTHER_FEATURE_KEY_SET = new Set<string>(OTHER_FEATURE_KEYS);

export function isOtherFeatureKey(value: string): value is OtherFeatureKey {
  return OTHER_FEATURE_KEY_SET.has(value);
}

/** Keep only known keys, preserve catalog order, dedupe. */
export function normalizeOtherFeatures(input: unknown): OtherFeatureKey[] {
  if (!Array.isArray(input)) return [];
  const seen = new Set<string>();
  const result: OtherFeatureKey[] = [];
  for (const item of input) {
    if (typeof item !== 'string') continue;
    const key = item.trim();
    if (!isOtherFeatureKey(key) || seen.has(key)) continue;
    seen.add(key);
    result.push(key);
  }
  return OTHER_FEATURE_KEYS.filter((key) => seen.has(key));
}
