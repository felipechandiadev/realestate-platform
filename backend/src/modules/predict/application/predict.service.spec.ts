import { Test, TestingModule } from '@nestjs/testing';
import { PredictService } from './predict.service';
import { GetRegionesUseCase } from './use-cases/get-regiones.usecase';
import { GetStatusUseCase } from './use-cases/get-status.usecase';
import { GetTiposPropiedadUseCase } from './use-cases/get-tipos-propiedad.usecase';
import { PredictPropertyValueUseCase } from './use-cases/predict-property-value.usecase';

describe('PredictService', () => {
  let service: PredictService;

  const mockPredict = { execute: jest.fn() };
  const mockRegions = { execute: jest.fn() };
  const mockTipos = { execute: jest.fn() };
  const mockStatus = { execute: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PredictService,
        { provide: PredictPropertyValueUseCase, useValue: mockPredict },
        { provide: GetRegionesUseCase, useValue: mockRegions },
        { provide: GetTiposPropiedadUseCase, useValue: mockTipos },
        { provide: GetStatusUseCase, useValue: mockStatus },
      ],
    }).compile();

    service = module.get<PredictService>(PredictService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('predictValue delegates', async () => {
    const dto = { operacion: 'SALE' } as any;
    mockPredict.execute.mockResolvedValue('x');
    const res = await service.predictValue(dto);
    expect(res).toBe('x');
    expect(mockPredict.execute).toHaveBeenCalledWith(dto);
  });

  it('getRegiones delegates', () => {
    mockRegions.execute.mockReturnValue(['A']);
    expect(service.getRegiones()).toEqual(['A']);
  });

  it('getTiposPropiedad delegates', () => {
    mockTipos.execute.mockReturnValue(['T']);
    expect(service.getTiposPropiedad()).toEqual(['T']);
  });

  it('isModelLoaded uses status usecase', () => {
    mockStatus.execute.mockReturnValue({ model_loaded: false });
    expect(service.isModelLoaded()).toBe(false);
  });
});
