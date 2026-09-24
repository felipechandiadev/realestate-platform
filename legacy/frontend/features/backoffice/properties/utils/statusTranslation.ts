/**
 * @fileoverview Status translation utilities for properties
 *
 * Helper functions to translate property status codes to Spanish
 * and get corresponding CSS classes for styling
 */

export function getStatusInSpanish(status: string): string {
  const translations: Record<string, string> = {
    DRAFT: 'Borrador',
    PUBLISHED: 'Publicada',
    REJECTED: 'Rechazada',
    ARCHIVED: 'Archivada',
    ACTIVE: 'Activa',
    INACTIVE: 'Inactiva',
    PENDING: 'Pendiente',
    COMPLETED: 'Completada',
    CANCELLED: 'Cancelada',
    SUSPENDED: 'Suspendida',
  };

  return translations[status.toUpperCase()] || status;
}

export function getStatusChipClasses(status: string): string {
  const classMap: Record<string, string> = {
    DRAFT: 'bg-gray-100 text-gray-800',
    PUBLISHED: 'bg-green-100 text-green-800',
    REJECTED: 'bg-red-100 text-red-800',
    ARCHIVED: 'bg-blue-100 text-blue-800',
    ACTIVE: 'bg-green-100 text-green-800',
    INACTIVE: 'bg-gray-100 text-gray-800',
    PENDING: 'bg-yellow-100 text-yellow-800',
    COMPLETED: 'bg-emerald-100 text-emerald-800',
    CANCELLED: 'bg-red-100 text-red-800',
    SUSPENDED: 'bg-orange-100 text-orange-800',
  };

  return classMap[status.toUpperCase()] || 'bg-gray-100 text-gray-800';
}

export function getStatusColor(status: string): string {
  const colorMap: Record<string, string> = {
    DRAFT: 'gray',
    PUBLISHED: 'green',
    REJECTED: 'red',
    ARCHIVED: 'blue',
    ACTIVE: 'green',
    INACTIVE: 'gray',
    PENDING: 'yellow',
    COMPLETED: 'emerald',
    CANCELLED: 'red',
    SUSPENDED: 'orange',
  };

  return colorMap[status.toUpperCase()] || 'gray';
}
