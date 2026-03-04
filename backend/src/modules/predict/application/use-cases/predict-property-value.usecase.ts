import { Injectable, Logger } from '@nestjs/common';
import { PredictPropertyDto, PredictPropertyResponseDto } from '../../dto/predict-property.dto';

// import the same constants from service or re-declare them here
const REGION_FACTOR: Record<string, number> = {
  'Metropolitana': 1.0,
  'Valparaíso': 0.85,
  'Biobío': 0.70,
  'Maule': 0.65,
  'Araucanía': 0.60,
  "O'Higgins": 0.70,
  'Los Lagos': 0.65,
  'Coquimbo': 0.75,
  'Antofagasta': 0.90,
  'Los Ríos': 0.60,
  'Tarapacá': 0.80,
  'Atacama': 0.75,
  'Ñuble': 0.60,
  'Magallanes': 0.70,
  'Aysén': 0.65,
  'Arica y Parinacota': 0.75,
};

const PRECIOS_VENTA: Record<string, { base: number; por_m2: number; std: number }> = {
  'Departamento': { base: 320000000, por_m2: 2500000, std: 0.20 },
  'Casa': { base: 230000000, por_m2: 1800000, std: 0.22 },
  'Oficina': { base: 270000000, por_m2: 2200000, std: 0.25 },
  'Terreno': { base: 280000000, por_m2: 800000, std: 0.30 },
  'Estacionamiento': { base: 200000000, por_m2: 3000000, std: 0.18 },
  'Bodega': { base: 150000000, por_m2: 1000000, std: 0.25 },
  'Local Comercial': { base: 250000000, por_m2: 2000000, std: 0.25 },
  'Parcela': { base: 200000000, por_m2: 300000, std: 0.35 },
};

const PRECIOS_ARRIENDO: Record<string, { base: number; por_m2: number; std: number }> = {
  'Departamento': { base: 650000, por_m2: 8000, std: 0.20 },
  'Casa': { base: 630000, por_m2: 6000, std: 0.22 },
  'Oficina': { base: 600000, por_m2: 7000, std: 0.25 },
  'Terreno': { base: 940000, por_m2: 3000, std: 0.30 },
  'Estacionamiento': { base: 720000, por_m2: 12000, std: 0.18 },
  'Bodega': { base: 400000, por_m2: 4000, std: 0.25 },
  'Local Comercial': { base: 800000, por_m2: 10000, std: 0.25 },
  'Parcela': { base: 500000, por_m2: 1500, std: 0.35 },
};

@Injectable()
export class PredictPropertyValueUseCase {
  private readonly logger = new Logger(PredictPropertyValueUseCase.name);

  async execute(dto: PredictPropertyDto): Promise<PredictPropertyResponseDto> {
    this.logger.log(`📊 Prediciendo valor para: ${dto.tipo_propiedad} en ${dto.region}`);

    const precios = dto.operacion === 'SALE' ? PRECIOS_VENTA : PRECIOS_ARRIENDO;
    const tipoConfig = precios[dto.tipo_propiedad] || precios['Departamento'];
    const regionFactor = REGION_FACTOR[dto.region] || 0.75;

    let valorEstimado = tipoConfig.base;
    valorEstimado += (dto.m2_construidos - 50) * tipoConfig.por_m2;

    if (dto.habitaciones > 0) {
      valorEstimado *= (1 + dto.habitaciones * 0.08);
    }
    if (dto.banos > 1) {
      valorEstimado *= (1 + (dto.banos - 1) * 0.05);
    }
    valorEstimado *= regionFactor;
    if (dto.m2_terreno > dto.m2_construidos * 1.5) {
      const factorTerreno = Math.min(1.3, 1 + (dto.m2_terreno - dto.m2_construidos) * 0.0002);
      valorEstimado *= factorTerreno;
    }
    if (dto.operacion === 'SALE') {
      valorEstimado = Math.max(20000000, Math.min(800000000, valorEstimado));
    } else {
      valorEstimado = Math.max(150000, Math.min(5000000, valorEstimado));
    }
    valorEstimado = Math.round(valorEstimado / 1000) * 1000;

    const std = tipoConfig.std;
    const valorMinimo = Math.round(valorEstimado * (1 - std) / 1000) * 1000;
    const valorMaximo = Math.round(valorEstimado * (1 + std) / 1000) * 1000;

    let confianza = 0.75;
    if (REGION_FACTOR[dto.region]) confianza += 0.10;
    if (precios[dto.tipo_propiedad]) confianza += 0.10;
    confianza = Math.min(0.95, confianza);

    const formatCLP = (value: number) => `$${value.toLocaleString('es-CL')} CLP`;

    const response: PredictPropertyResponseDto = {
      valor_estimado: valorEstimado,
      valor_minimo: valorMinimo,
      valor_maximo: valorMaximo,
      operacion: dto.operacion,
      confianza,
      valor_formateado: formatCLP(valorEstimado),
      rango_formateado: `${formatCLP(valorMinimo)} - ${formatCLP(valorMaximo)}`,
    };

    this.logger.log(`✅ Predicción: ${response.valor_formateado}`);
    return response;
  }
}
