import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PredictStatusEntity } from '../domain/predict-status.entity';
import { PredictPropertyDto, PredictPropertyResponseDto } from '../dto/predict-property.dto';
import { GetRegionesUseCase } from './use-cases/get-regiones.usecase';
import { GetStatusUseCase } from './use-cases/get-status.usecase';
import { GetTiposPropiedadUseCase } from './use-cases/get-tipos-propiedad.usecase';
import { PredictPropertyValueUseCase } from './use-cases/predict-property-value.usecase';

@Injectable()
export class PredictService implements OnModuleInit {
  private readonly logger = new Logger(PredictService.name);

  constructor(
    private readonly predictValueUseCase: PredictPropertyValueUseCase,
    private readonly getRegionesUseCase: GetRegionesUseCase,
    private readonly getTiposPropiedadUseCase: GetTiposPropiedadUseCase,
    private readonly getStatusUseCase: GetStatusUseCase,
  ) {}

  async onModuleInit() {
    this.logger.log('🏠 Servicio de predicción inicializado (modelo basado en reglas calibradas)');
  }

  async predictValue(dto: PredictPropertyDto): Promise<PredictPropertyResponseDto> {
    return this.predictValueUseCase.execute(dto);
  }

  getRegiones(): string[] {
    return this.getRegionesUseCase.execute();
  }

  getTiposPropiedad(): string[] {
    return this.getTiposPropiedadUseCase.execute();
  }

  isModelLoaded(): boolean {
    return this.getStatusUseCase.execute().model_loaded;
  }

  getStatus(): PredictStatusEntity {
    const status = this.getStatusUseCase.execute();
    return new PredictStatusEntity(status.status, status.model_loaded, status.version);
  }
}
