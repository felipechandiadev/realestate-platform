import { Injectable } from '@nestjs/common';

@Injectable()
export class GetRegionesUseCase {
  execute(): string[] {
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
    return Object.keys(REGION_FACTOR);
  }
}