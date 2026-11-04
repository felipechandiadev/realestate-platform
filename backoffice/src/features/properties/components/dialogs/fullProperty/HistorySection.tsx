'use client'

import React, { useEffect, useMemo, useState } from 'react'
import {
  getPropertyHistory,
  resolveHistoryUserDisplayNames,
} from '@/features/properties/actions/properties.action'
import {
  describeEntry,
  fieldLabel,
  formatHistoryValue,
  groupHistory,
  type HistoryEntry,
  type HistoryKind,
} from '@/features/properties/utils/propertyHistory'
import { LucideIcon } from './LucideIcon'

interface HistorySectionProps {
  propertyId: string
  title?: string
}

const ACTOR_TRANSLATIONS: Record<string, string> = {
  anonymous: 'Anónimo',
  system: 'Sistema',
  unknown: 'Desconocido',
}

const translateActorName = (actor: string): string => {
  const key = actor?.trim() ?? ''
  if (!key) return 'Desconocido'
  return ACTOR_TRANSLATIONS[key.toLowerCase()] || actor
}

/** Color del punto de la línea de tiempo según el tipo de evento. */
const DOT_CLASSES: Record<HistoryKind, string> = {
  CREATED: 'bg-emerald-500',
  PUBLISHED: 'bg-sky-500',
  UNPUBLISHED: 'bg-amber-500',
  STATUS_CHANGED: 'bg-indigo-500',
  DELETED: 'bg-red-500',
  MEDIA: 'bg-violet-500',
  NOTE: 'bg-slate-400',
  UPDATED: 'bg-primary',
}

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

const looksLikeUuid = (value: string): boolean => UUID_PATTERN.test(value)

const formatDate = (date: string | Date) => {
  try {
    return new Date(date).toLocaleString('es-CL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return String(date)
  }
}

const HistorySection: React.FC<HistorySectionProps> = ({ propertyId, title = 'Historial' }) => {
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadHistory()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [propertyId])

  const loadHistory = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await getPropertyHistory(propertyId)
      if (response.success && response.data) {
        const baseHistory = response.data as HistoryEntry[]

        // El backend ya resuelve la mayoría de los nombres; esto cubre los ids que quedaron sin resolver.
        const unresolvedIds = Array.from(
          new Set(
            baseHistory
              .map((entry) => {
                if (entry.changedById && entry.changedById !== 'system') return entry.changedById
                if (typeof entry.changedBy === 'string' && looksLikeUuid(entry.changedBy)) return entry.changedBy
                return null
              })
              .filter((id): id is string => Boolean(id)),
          ),
        )

        if (unresolvedIds.length > 0) {
          const resolvedUsers = await resolveHistoryUserDisplayNames(unresolvedIds)
          if (resolvedUsers.success && resolvedUsers.data) {
            setHistory(
              baseHistory.map((entry) => {
                const key =
                  entry.changedById || (looksLikeUuid(entry.changedBy) ? entry.changedBy : undefined)
                const resolvedName = key ? resolvedUsers.data?.[key] : undefined
                return resolvedName ? { ...entry, changedBy: resolvedName } : entry
              }),
            )
            return
          }
        }
        setHistory(baseHistory)
      } else {
        setError(response.error || 'No se pudo cargar el historial')
      }
    } catch (err) {
      console.error('Error loading history:', err)
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  const events = useMemo(() => groupHistory(history), [history])

  if (loading) {
    return (
      <section className="flex items-center justify-center py-8">
        <div className="flex justify-center">
          <LucideIcon name="progress_activity" size={20} spin />
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="space-y-4">
        <header className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">{title}</p>
          <p className="text-sm text-red-500">Error: {error}</p>
        </header>
      </section>
    )
  }

  return (
    <section className="space-y-4">
      <header className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">{title}</p>
        {events.length > 0 && (
          <p className="text-sm text-muted-foreground" data-testid="history-count">
            {events.length === 1 ? '1 evento' : `${events.length} eventos`}
          </p>
        )}
      </header>

      {events.length > 0 ? (
        <ol className="relative ml-2 space-y-5 border-l border-border pl-6" data-testid="history-timeline">
          {events.map((event) => (
            <li key={event.key} className="relative" data-testid="history-event">
              <span
                aria-hidden
                className={`absolute -left-[31px] top-4 h-3 w-3 rounded-full ring-4 ring-background ${DOT_CLASSES[event.kind]}`}
              />
              <div className="rounded-lg border border-border bg-card p-4">
                <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1">
                  <p className="text-sm font-semibold text-foreground">{event.title}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(event.timestamp)}</p>
                </div>

                <dl className="mt-1 grid gap-x-4 gap-y-0.5 text-xs text-muted-foreground sm:grid-cols-2">
                  <div>
                    <dt className="inline font-medium">Por: </dt>
                    <dd className="inline" data-testid="history-actor">
                      {translateActorName(event.changedBy)}
                    </dd>
                  </div>
                  <div>
                    <dt className="inline font-medium">Dónde: </dt>
                    <dd className="inline" data-testid="history-origin">
                      {event.origin ?? 'Origen no registrado'}
                    </dd>
                  </div>
                </dl>

                <ul className="mt-3 space-y-2">
                  {event.entries.map((entry, idx) => {
                    const summary = describeEntry(entry)
                    if (summary) {
                      return (
                        <li
                          key={idx}
                          data-testid="history-summary"
                          className="rounded-md bg-muted/40 px-3 py-2 text-xs text-foreground"
                        >
                          {summary}
                        </li>
                      )
                    }
                    return (
                      <li key={idx} data-testid="history-change" className="rounded-md bg-muted/40 px-3 py-2 text-xs">
                        <p className="font-medium text-foreground">{fieldLabel(entry.field)}</p>
                        <div className="mt-1 grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-muted-foreground">Anterior</p>
                            <p className="break-words text-foreground" data-testid="history-previous">
                              {formatHistoryValue(entry, 'previous')}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Nuevo</p>
                            <p className="break-words font-medium text-foreground" data-testid="history-new">
                              {formatHistoryValue(entry, 'new')}
                            </p>
                          </div>
                        </div>
                      </li>
                    )
                  })}
                </ul>
              </div>
            </li>
          ))}
        </ol>
      ) : (
        <div className="py-8 text-center">
          <p className="text-sm text-muted-foreground">No hay cambios registrados</p>
        </div>
      )}
    </section>
  )
}

export default HistorySection
