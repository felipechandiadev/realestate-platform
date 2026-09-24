import { Injectable } from '@nestjs/common';

@Injectable()
export class GetTiposPropiedadUseCase {
  execute(): string[] {
    const PRECIOS_VENTA: Record<string, any> = {
      'Departamento': {},
      'Casa': {},
      'Oficina': {},
      'Terreno': {},
      'Estacionamiento': {},
      'Bodega': {},
      'Local Comercial': {},
      'Parcela': {},
    };
    return Object.keys(PRECIOS_VENTA);
  }
}