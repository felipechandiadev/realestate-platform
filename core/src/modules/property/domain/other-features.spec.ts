import { normalizeOtherFeatures, OTHER_FEATURE_KEYS } from './other-features';

describe('normalizeOtherFeatures', () => {
  it('returns empty array for non-arrays', () => {
    expect(normalizeOtherFeatures(undefined)).toEqual([]);
    expect(normalizeOtherFeatures(null)).toEqual([]);
    expect(normalizeOtherFeatures('POOL')).toEqual([]);
  });

  it('filters invalid keys and dedupes preserving catalog order', () => {
    expect(
      normalizeOtherFeatures(['POOL', 'INVALID', 'POOL', 'FURNISHED', 'AIR_CONDITIONING']),
    ).toEqual(['AIR_CONDITIONING', 'POOL', 'FURNISHED']);
  });

  it('accepts the full catalog', () => {
    expect(normalizeOtherFeatures([...OTHER_FEATURE_KEYS])).toEqual([...OTHER_FEATURE_KEYS]);
  });
});
