'use server';

import { env } from '@/lib/env';

// Types for prediction
export interface PredictPropertyInput {
  operacion: 'SALE' | 'RENTAL';
  region: string;
  comuna: string;
  tipo_propiedad: string;
  habitaciones: number;
  banos: number;
  m2_construidos: number;
  m2_terreno: number;
  latitud?: number;
  longitud?: number;
}

export interface PredictPropertyResult {
  valor_estimado: number;
  valor_minimo: number;
  valor_maximo: number;
  operacion: 'SALE' | 'RENTAL';
  confianza: number;
  valor_formateado: string;
  rango_formateado: string;
}

export interface PredictResponse {
  success: boolean;
  data?: PredictPropertyResult;
  error?: string;
}

/**
 * Obtener la predicción del valor de una propiedad
 * Este es un endpoint público, no requiere autenticación
 */
export async function predictPropertyValue(
  input: PredictPropertyInput
): Promise<PredictResponse> {
  try {
    const response = await fetch(`${env.backendApiUrl}/predict/property-value`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: errorData.message || `Error ${response.status}: ${response.statusText}`,
      };
    }

    const data = await response.json();
    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error('Error en predictPropertyValue:', error);
    return {
      success: false,
      error: 'Error de conexión con el servidor',
    };
  }
}

/**
 * Obtener las regiones disponibles para predicción
 */
export async function getPredictRegiones(): Promise<string[]> {
  try {
    const response = await fetch(`${env.backendApiUrl}/predict/regiones`, {
      cache: 'force-cache',
    });

    if (!response.ok) {
      return [];
    }

    return await response.json();
  } catch (error) {
    console.error('Error en getPredictRegiones:', error);
    return [];
  }
}

/**
 * Obtener los tipos de propiedad disponibles para predicción
 */
export async function getPredictTiposPropiedad(): Promise<string[]> {
  try {
    const response = await fetch(`${env.backendApiUrl}/predict/tipos-propiedad`, {
      cache: 'force-cache',
    });

    if (!response.ok) {
      return [];
    }

    return await response.json();
  } catch (error) {
    console.error('Error en getPredictTiposPropiedad:', error);
    return [];
  }
}

/**
 * Verificar el estado del servicio de predicción
 */
export async function getPredictStatus(): Promise<{
  status: string;
  model_loaded: boolean;
  version: string;
} | null> {
  try {
    const response = await fetch(`${env.backendApiUrl}/predict/status`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Error en getPredictStatus:', error);
    return null;
  }
}
