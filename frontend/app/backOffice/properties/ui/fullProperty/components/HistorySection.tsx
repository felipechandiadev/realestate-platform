'use client'

import React, { useState, useEffect } from 'react'
import { getPropertyHistory } from '@/features/backoffice/properties/actions/properties.action'

interface HistorySectionProps {
  propertyId: string
  title?: string
}

interface ChangeHistoryEntry {
  timestamp: string | Date
  changedBy: string
  field: string
  previousValue: any
  newValue: any
}

const HistorySection: React.FC<HistorySectionProps> = ({
  propertyId,
  title = 'Historial',
}) => {
  const [history, setHistory] = useState<ChangeHistoryEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadHistory()
  }, [propertyId])

  const loadHistory = async () => {
    try {
      setLoading(true)
      const response = await getPropertyHistory(propertyId)
      if (response.success && response.data) {
        setHistory(response.data)
      } else {
        setError(response.error || 'Failed to load history')
      }
    } catch (err) {
      console.error('Error loading history:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (date: string | Date) => {
    try {
      const d = new Date(date)
      return d.toLocaleString('es-CL', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
    } catch {
      return date.toString()
    }
  }

  const formatValue = (value: any) => {
    if (value === null || value === undefined) return '—'
    if (typeof value === 'boolean') return value ? 'Sí' : 'No'
    if (typeof value === 'object') return JSON.stringify(value)
    return value.toString()
  }

  if (loading) {
    return (
      <section className="flex items-center justify-center py-8">
        <div className="flex justify-center"><span className="material-symbols-outlined animate-spin">progress_activity</span></div>
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
        {history.length > 0 && (
          <p className="text-sm text-muted-foreground">{history.length} cambio(s)</p>
        )}
      </header>

      {history.length > 0 ? (
        <div className="space-y-4">
          {[...history].reverse().map((entry, idx) => (
            <div
              key={idx}
              className="border border-border rounded-lg p-4"
            >
              {/* Header: timestamp and user */}
              <div className="flex justify-between items-start gap-2 mb-2">
                <div>
                  <p className="text-sm font-medium text-foreground">{entry.field}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(entry.timestamp)}</p>
                </div>
                <p className="text-xs text-muted-foreground whitespace-nowrap">Por: {entry.changedBy}</p>
              </div>

              {/* Values */}
              <div className="space-y-1 mt-3">
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <p className="text-muted-foreground font-medium">Anterior</p>
                    <p className="text-foreground font-mono break-words">{formatValue(entry.previousValue)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground font-medium">Nuevo</p>
                    <p className="text-foreground font-mono break-words">{formatValue(entry.newValue)}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-sm text-muted-foreground">No hay cambios registrados</p>
        </div>
      )}
    </section>
  )
}

export default HistorySection
