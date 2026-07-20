/**
 * Translates PropertyStatus enum values to Spanish
 * @param status The PropertyStatus enum value (REQUEST, PRE-APPROVED, PUBLISHED, INACTIVE, SOLD, RENTED, CONTRACT-IN-PROGRESS)
 * @returns The Spanish translation or the original status if not found
 */
export const getStatusInSpanish = (status?: string): string => {
  if (!status) return '—'
  const normalized = status.toUpperCase()
  const statusMap: Record<string, string> = {
    'REQUEST': 'Solicitud',
    'PRE-APPROVED': 'Pre-aprobada',
    'PUBLISHED': 'Publicada',
    'INACTIVE': 'Inactiva',
    'SOLD': 'Vendida',
    'RENTED': 'Arrendada',
    'CONTRACT-IN-PROGRESS': 'Contrato en progreso',
  }
  return statusMap[normalized] || status
}

/**
 * Returns Tailwind CSS classes for status chip colors based on status
 * @param status The PropertyStatus enum value
 * @returns CSS classes for styling the status badge
 */
export const getStatusChipClasses = (status?: string): string => {
  if (!status) return 'bg-muted/70 text-muted-foreground'
  const normalized = status.toUpperCase()
  const colorMap: Record<string, string> = {
    'REQUEST': 'bg-blue-100 text-blue-700',
    'PRE-APPROVED': 'bg-cyan-100 text-cyan-700',
    'PUBLISHED': 'bg-emerald-100 text-emerald-700',
    'INACTIVE': 'bg-slate-100 text-slate-700',
    'SOLD': 'bg-rose-100 text-rose-700',
    'RENTED': 'bg-orange-100 text-orange-700',
    'CONTRACT-IN-PROGRESS': 'bg-amber-100 text-amber-700',
  }
  return colorMap[normalized] || 'bg-muted/70 text-muted-foreground'
}
