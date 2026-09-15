/**
 * @fileoverview Status translation utilities for properties
 *
 * Helper functions to translate property status codes to Spanish
 * and get corresponding CSS classes for styling
 */

function normalizeStatusKey(status: string): string {
  return status.trim().toUpperCase();
}

const STATUS_LABELS: Record<string, string> = {
  DRAFT: 'Borrador',
  REQUEST: 'Solicitud',
  'PRE-APPROVED': 'Pre-aprobada',
  PUBLISHED: 'Publicada',
  REJECTED: 'Rechazada',
  ARCHIVED: 'Archivada',
  ACTIVE: 'Activa',
  INACTIVE: 'Inactiva',
  PENDING: 'Pendiente',
  COMPLETED: 'Completada',
  CANCELLED: 'Cancelada',
  SUSPENDED: 'Suspendida',
  SOLD: 'Vendida',
  RENTED: 'Arrendada',
  'CONTRACT-IN-PROGRESS': 'Contrato en progreso',
};

const STATUS_CHIP_CLASSES: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-800',
  REQUEST: 'bg-blue-100 text-blue-700',
  'PRE-APPROVED': 'bg-cyan-100 text-cyan-700',
  PUBLISHED: 'bg-emerald-100 text-emerald-700',
  REJECTED: 'bg-red-100 text-red-800',
  ARCHIVED: 'bg-blue-100 text-blue-800',
  ACTIVE: 'bg-green-100 text-green-800',
  INACTIVE: 'bg-slate-100 text-slate-700',
  PENDING: 'bg-yellow-100 text-yellow-800',
  COMPLETED: 'bg-emerald-100 text-emerald-800',
  CANCELLED: 'bg-red-100 text-red-800',
  SUSPENDED: 'bg-orange-100 text-orange-800',
  SOLD: 'bg-rose-100 text-rose-700',
  RENTED: 'bg-orange-100 text-orange-700',
  'CONTRACT-IN-PROGRESS': 'bg-amber-100 text-amber-700',
};

const STATUS_COLORS: Record<string, string> = {
  DRAFT: 'gray',
  REQUEST: 'blue',
  'PRE-APPROVED': 'cyan',
  PUBLISHED: 'green',
  REJECTED: 'red',
  ARCHIVED: 'blue',
  ACTIVE: 'green',
  INACTIVE: 'gray',
  PENDING: 'yellow',
  COMPLETED: 'emerald',
  CANCELLED: 'red',
  SUSPENDED: 'orange',
  SOLD: 'rose',
  RENTED: 'orange',
  'CONTRACT-IN-PROGRESS': 'amber',
};

export function getStatusInSpanish(status?: string | null): string {
  if (!status?.trim()) return '—';
  const key = normalizeStatusKey(status);
  return STATUS_LABELS[key] || status;
}

export function getStatusChipClasses(status?: string | null): string {
  if (!status?.trim()) return 'bg-muted/70 text-muted-foreground';
  const key = normalizeStatusKey(status);
  return STATUS_CHIP_CLASSES[key] || 'bg-muted/70 text-muted-foreground';
}

export function getStatusColor(status?: string | null): string {
  if (!status?.trim()) return 'gray';
  const key = normalizeStatusKey(status);
  return STATUS_COLORS[key] || 'gray';
}
