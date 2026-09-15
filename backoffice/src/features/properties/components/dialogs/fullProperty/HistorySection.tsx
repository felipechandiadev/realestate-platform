'use client'

import React, { useState, useEffect } from 'react'
import {
  getPropertyHistory,
  resolveHistoryUserDisplayNames,
} from '@/features/properties/actions/properties.action'
import { getStatusInSpanish } from '@/features/properties/utils'
import { LucideIcon } from './LucideIcon'

interface HistorySectionProps {
  propertyId: string
  title?: string
}

interface ChangeHistoryEntry {
  timestamp: string | Date
  changedBy: string
  changedById?: string | null
  field: string
  previousValue: any
  newValue: any
}

/**
 * Mapa de traducción de nombres de campos del inglés al español
 * Cubre todos los campos que pueden ser modificados en una propiedad
 */
const FIELD_TRANSLATIONS: Record<string, string> = {
  // Eventos / acciones de historial
  creation: 'Creación',
  create: 'Creación',
  created: 'Creación',
  update: 'Actualización',
  updated: 'Actualización',
  delete: 'Eliminación',
  deleted: 'Eliminación',
  publish: 'Publicación',
  published: 'Publicación',

  // Ubicación
  address: 'Dirección',
  state: 'Región',
  city: 'Comuna',
  latitude: 'Latitud',
  longitude: 'Longitud',

  // Información básica
  title: 'Título',
  description: 'Descripción',
  price: 'Precio',
  type: 'Tipo de propiedad',
  propertyType: 'Tipo de propiedad',
  currencyPrice: 'Moneda',
  code: 'Código',
  operationType: 'Tipo de operación',

  // Características
  bedrooms: 'Dormitorios',
  bathrooms: 'Baños',
  area: 'Área',
  plotArea: 'Área del terreno',
  constructedArea: 'Área construida',
  garage: 'Garaje',
  garages: 'Garajes',

  // Detalles
  status: 'Estado',
  condition: 'Condición',
  yearBuilt: 'Año de construcción',

  // Agente y asignación
  creatorUser: 'Creado por',
  createdBy: 'Creado por',
  assignedAgent: 'Agente asignado',
  assignedAgentId: 'Agente asignado',
  agent: 'Agente',

  // Características especiales
  isFeatured: 'Destacada',
  featured: 'Destacada',
  isActive: 'Activa',
  active: 'Activa',

  // Multimedia
  multimedia: 'Galería',
  gallery: 'Galería',
  images: 'Imágenes',

  // Cambios del sistema
  changeHistory: 'Historial',
  updatedAt: 'Actualizado',
  createdAt: 'Creado',
  lastModifiedAt: 'Última modificación',
}

/** Valores literales frecuentes del historial (además de estados de propiedad). */
const VALUE_TRANSLATIONS: Record<string, string> = {
  created: 'Creado',
  updated: 'Actualizado',
  deleted: 'Eliminado',
  published: 'Publicado',
  unpublished: 'Despublicado',
  draft: 'Borrador',
  true: 'Sí',
  false: 'No',
  sale: 'Venta',
  rent: 'Arriendo',
  null: '—',
  undefined: '—',
  none: 'Ninguno',
}

const ACTOR_TRANSLATIONS: Record<string, string> = {
  anonymous: 'Anónimo',
  system: 'Sistema',
  unknown: 'Desconocido',
}

/** Heurística: parece un código de estado de propiedad. */
const STATUS_LIKE =
  /^(REQUEST|PRE-APPROVED|PUBLISHED|INACTIVE|SOLD|RENTED|CONTRACT-IN-PROGRESS|DRAFT|REJECTED|ARCHIVED|ACTIVE|PENDING)$/i

/**
 * Traduce un nombre de campo del inglés al español
 */
const translateFieldName = (field: string): string => {
  const key = field?.trim() ?? ''
  if (!key) return '—'
  return FIELD_TRANSLATIONS[key] || FIELD_TRANSLATIONS[key.toLowerCase()] || key
}

const translateActorName = (actor: string): string => {
  const key = actor?.trim() ?? ''
  if (!key) return 'Desconocido'
  return ACTOR_TRANSLATIONS[key.toLowerCase()] || actor
}

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

const looksLikeUuid = (value: string): boolean => UUID_PATTERN.test(value)

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
        const baseHistory = response.data as ChangeHistoryEntry[]

        const unresolvedIds = Array.from(
          new Set(
            baseHistory
              .map((entry) => {
                if (entry.changedById && entry.changedById !== 'system') {
                  return entry.changedById
                }
                if (typeof entry.changedBy === 'string' && looksLikeUuid(entry.changedBy)) {
                  return entry.changedBy
                }
                return null
              })
              .filter((id): id is string => Boolean(id)),
          ),
        )

        if (unresolvedIds.length > 0) {
          const resolvedUsers = await resolveHistoryUserDisplayNames(unresolvedIds)

          if (resolvedUsers.success && resolvedUsers.data) {
            const enrichedHistory = baseHistory.map((entry) => {
              const key =
                entry.changedById || (looksLikeUuid(entry.changedBy) ? entry.changedBy : undefined)
              const resolvedName = key ? resolvedUsers.data?.[key] : undefined
              return resolvedName ? { ...entry, changedBy: resolvedName } : entry
            })
            setHistory(enrichedHistory)
          } else {
            setHistory(baseHistory)
          }
        } else {
          setHistory(baseHistory)
        }
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

  const formatValue = (value: any, field?: string) => {
    if (value === null || value === undefined || value === '') return '—'
    if (typeof value === 'boolean') return value ? 'Sí' : 'No'
    if (typeof value === 'object') return JSON.stringify(value)

    const raw = value.toString().trim()
    if (!raw) return '—'

    if (field === 'status' || STATUS_LIKE.test(raw)) {
      const statusLabel = getStatusInSpanish(raw)
      if (statusLabel !== raw && statusLabel !== '—') return statusLabel
    }

    const valueKey = raw.toLowerCase()
    if (VALUE_TRANSLATIONS[valueKey]) return VALUE_TRANSLATIONS[valueKey]

    const statusLabel = getStatusInSpanish(raw)
    if (statusLabel !== raw) return statusLabel

    return raw
  }

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
        {history.length > 0 && (
          <p className="text-sm text-muted-foreground">{history.length} cambio(s)</p>
        )}
      </header>

      {history.length > 0 ? (
        <div className="space-y-4">
          {[...history].reverse().map((entry, idx) => (
            <div key={idx} className="border border-border rounded-lg p-4">
              <div className="flex justify-between items-start gap-2 mb-2">
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {translateFieldName(entry.field)}
                  </p>
                  <p className="text-xs text-muted-foreground">{formatDate(entry.timestamp)}</p>
                </div>
                <p className="text-xs text-muted-foreground whitespace-nowrap">
                  Por: {translateActorName(entry.changedBy)}
                </p>
              </div>

              <div className="space-y-1 mt-3">
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <p className="text-muted-foreground font-medium">Anterior</p>
                    <p className="text-foreground font-mono break-words">
                      {formatValue(entry.previousValue, entry.field)}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground font-medium">Nuevo</p>
                    <p className="text-foreground font-mono break-words">
                      {formatValue(entry.newValue, entry.field)}
                    </p>
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
