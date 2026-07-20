/**
 * @fileoverview Status translation utilities for contracts
 *
 * Helper functions to translate contract status codes to Spanish
 * and get corresponding CSS classes for styling
 */

export function getContractStatusInSpanish(status: string): string {
  const translations: Record<string, string> = {
    DRAFT: 'Borrador',
    PENDING: 'Pendiente',
    ACTIVE: 'Activo',
    COMPLETED: 'Completado',
    CANCELLED: 'Cancelado',
    SUSPENDED: 'Suspendido',
    EXPIRED: 'Vencido',
    TERMINATED: 'Terminado',
  };

  return translations[status.toUpperCase()] || status;
}

export function getContractStatusChipClasses(status: string): string {
  const classMap: Record<string, string> = {
    DRAFT: 'bg-gray-100 text-gray-800',
    PENDING: 'bg-yellow-100 text-yellow-800',
    ACTIVE: 'bg-green-100 text-green-800',
    COMPLETED: 'bg-emerald-100 text-emerald-800',
    CANCELLED: 'bg-red-100 text-red-800',
    SUSPENDED: 'bg-orange-100 text-orange-800',
    EXPIRED: 'bg-red-100 text-red-800',
    TERMINATED: 'bg-gray-100 text-gray-800',
  };

  return classMap[status.toUpperCase()] || 'bg-gray-100 text-gray-800';
}

export function getContractStatusColor(status: string): string {
  const colorMap: Record<string, string> = {
    DRAFT: 'gray',
    PENDING: 'yellow',
    ACTIVE: 'green',
    COMPLETED: 'emerald',
    CANCELLED: 'red',
    SUSPENDED: 'orange',
    EXPIRED: 'red',
    TERMINATED: 'gray',
  };

  return colorMap[status.toUpperCase()] || 'gray';
}

export function isContractActive(status: string): boolean {
  return ['ACTIVE', 'PENDING'].includes(status.toUpperCase());
}

export function canEditContract(status: string): boolean {
  return ['DRAFT', 'PENDING'].includes(status.toUpperCase());
}

export const getStatusInSpanish = getContractStatusInSpanish;
export const getStatusChipClasses = getContractStatusChipClasses;
