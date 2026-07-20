export function formatPropertyPrice(
  price?: number | null,
  currency?: 'CLP' | 'UF' | string | null,
): string {
  if (price === undefined || price === null) {
    return '—';
  }

  const resolvedCurrency = currency || 'CLP';

  if (resolvedCurrency === 'UF') {
    return `UF ${new Intl.NumberFormat('es-CL', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price)}`;
  }

  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}
