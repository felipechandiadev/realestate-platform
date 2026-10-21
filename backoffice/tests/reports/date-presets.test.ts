import { getReportDateRange } from '@/features/reports/lib/date-presets';

describe('getReportDateRange', () => {
  const today = new Date(2026, 9, 16, 12);

  it('returns Monday through today for this week', () => {
    expect(getReportDateRange('thisWeek', today)).toEqual({
      startDate: '2026-10-12',
      endDate: '2026-10-16',
    });
  });

  it('returns the start of the current month through today', () => {
    expect(getReportDateRange('thisMonth', today)).toEqual({
      startDate: '2026-10-01',
      endDate: '2026-10-16',
    });
  });

  it('calculates rolling three-month ranges', () => {
    expect(getReportDateRange('last3Months', today)).toEqual({
      startDate: '2026-07-16',
      endDate: '2026-10-16',
    });
  });

  it('clamps month subtraction to the last valid day', () => {
    expect(getReportDateRange('last3Months', new Date(2026, 4, 31))).toEqual({
      startDate: '2026-02-28',
      endDate: '2026-05-31',
    });
  });

  it('leaves custom and all-time ranges open', () => {
    expect(getReportDateRange('custom', today)).toBeNull();
    expect(getReportDateRange('allTime', today)).toBeNull();
  });
});
