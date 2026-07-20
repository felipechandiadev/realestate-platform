'use server'

const UF_ENDPOINT = 'https://findic.cl/api/uf';

type FindicSerieItem = {
  fecha?: string;
  valor?: number | string;
};

type FindicResponse = {
  serie?: FindicSerieItem[];
};

function parseUfValue(response: FindicResponse): number | null {
  if (!response || !Array.isArray(response.serie) || response.serie.length === 0) {
    return null;
  }

  const [latest] = response.serie;
  if (!latest) {
    return null;
  }

  const { valor } = latest;
  if (typeof valor === 'number') {
    return Number.isFinite(valor) ? valor : null;
  }

  if (typeof valor === 'string') {
    const normalized = valor.replace(/\./g, '').replace(',', '.');
    const numeric = Number.parseFloat(normalized);
    return Number.isFinite(numeric) ? numeric : null;
  }

  return null;
}

export async function getLatestUfValue(): Promise<number | null> {
  try {
    const res = await fetch(UF_ENDPOINT, {
      cache: 'no-store',
    });

    if (!res.ok) {
      throw new Error(`UF fetch failed with status ${res.status}`);
    }

    const data = (await res.json()) as FindicResponse;
    const ufValue = parseUfValue(data);
    return ufValue;
  } catch (error) {
    console.error('Failed to fetch UF value:', error);
    return null;
  }
}
