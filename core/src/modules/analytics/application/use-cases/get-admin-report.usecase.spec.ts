import { BadRequestException } from '@nestjs/common';
import { GetAdminReportUseCase } from './get-admin-report.usecase';

describe('GetAdminReportUseCase', () => {
  let useCase: GetAdminReportUseCase;

  beforeEach(() => {
    useCase = new GetAdminReportUseCase({} as any, {} as any, { execute: jest.fn() } as any);
  });

  it('rejects report identifiers outside the supported catalog', async () => {
    await expect(useCase.execute('payments')).rejects.toBeInstanceOf(BadRequestException);
  });

  it('requires both dates when a period is specified', async () => {
    await expect(useCase.execute('properties', { startDate: '2026-01-01' })).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects a start date after the end date', async () => {
    await expect(useCase.execute('contracts', {
      startDate: '2026-02-01',
      endDate: '2026-01-31',
    })).rejects.toBeInstanceOf(BadRequestException);
  });
});