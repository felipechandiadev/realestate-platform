import { Module } from '@nestjs/common';
import { PredictService } from './application/predict.service';
import { GetRegionesUseCase } from './application/use-cases/get-regiones.usecase';
import { GetStatusUseCase } from './application/use-cases/get-status.usecase';
import { GetTiposPropiedadUseCase } from './application/use-cases/get-tipos-propiedad.usecase';
import { PredictPropertyValueUseCase } from './application/use-cases/predict-property-value.usecase';
import { PredictController } from './presentation/predict.controller';

@Module({
  controllers: [PredictController],
  providers: [
    PredictService,
    PredictPropertyValueUseCase,
    GetRegionesUseCase,
    GetTiposPropiedadUseCase,
    GetStatusUseCase,
  ],
  exports: [PredictService],
})
export class PredictModule {}
