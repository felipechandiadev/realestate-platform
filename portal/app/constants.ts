// Client-safe constants for frontend usage

export const PROPERTY_STATUSES = [
  { id: 'REQUEST', label: 'Solicitud recibida' },
  { id: 'PRE_APPROVED', label: 'Preaprobada' }, 
  { id: 'PUBLISHED', label: 'Publicada' },
  { id: 'INACTIVE', label: 'Inactiva' },
  { id: 'SOLD', label: 'Vendida' },
  { id: 'RENTED', label: 'Arrendada' }
] as const;

export const OPERATION_TYPES = [
  { id: 'SALE', label: 'Venta' },
  { id: 'RENT', label: 'Arriendo' }
] as const;

export const CURRENCY_TYPES = [
  { id: 'CLP', label: 'CLP' },
  { id: 'UF', label: 'UF' }
] as const;