'use client'

import React, { useEffect, useState } from 'react'
import { Button, DotProgress } from '@realestate/ui'
import { PageLoadingDots } from '@/shared/components/ui/PageLoadingDots/PageLoadingDots'
import { useAlert } from '@/providers/AlertContext'
import {
  getPortalListingsSettings,
  updatePortalListingsSettings,
  type ListingsFilterVariant,
} from '@/features/cms/actions/portal-listings.action'

const OPTIONS: { value: ListingsFilterVariant; title: string; description: string }[] = [
  {
    value: 'classic',
    title: 'Filtro clásico',
    description:
      'Barra horizontal de filtros sobre la grilla (comportamiento actual del portal).',
  },
  {
    value: 'sidebar_v2',
    title: 'Filtro sidebar v2',
    description:
      'Sidebar en desktop, chips y botón flotante en mobile, con más parámetros (precio, superficies, otras características).',
  },
]

export default function CmsListingsPage() {
  const { showAlert } = useAlert()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [variant, setVariant] = useState<ListingsFilterVariant>('classic')

  useEffect(() => {
    let ignore = false
    ;(async () => {
      try {
        const settings = await getPortalListingsSettings()
        if (!ignore) setVariant(settings.listingsFilterVariant)
      } catch (err) {
        showAlert({
          message: err instanceof Error ? err.message : 'Error al cargar listados',
          type: 'error',
          duration: 4000,
        })
      } finally {
        if (!ignore) setLoading(false)
      }
    })()
    return () => {
      ignore = true
    }
  }, [showAlert])

  const handleSave = async () => {
    try {
      setSaving(true)
      const updated = await updatePortalListingsSettings(variant)
      setVariant(updated.listingsFilterVariant)
      showAlert({
        message: 'Configuración de listados guardada',
        type: 'success',
        duration: 3000,
      })
    } catch (err) {
      showAlert({
        message: err instanceof Error ? err.message : 'Error al guardar',
        type: 'error',
        duration: 4000,
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <PageLoadingDots />
  }

  return (
    <section className="mx-auto max-w-3xl space-y-6 p-4 md:p-6" data-test-id="cms-listings-page">
      <header className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          CMS
        </p>
        <h1 className="text-2xl font-bold text-foreground">Listados de propiedades</h1>
        <p className="text-sm text-muted-foreground">
          Elige qué experiencia de filtro usa el portal en home, venta y arriendo. El filtro clásico
          no se elimina.
        </p>
      </header>

      <div className="space-y-3 rounded-lg border border-border p-4">
        {OPTIONS.map((option) => {
          const selected = variant === option.value
          return (
            <label
              key={option.value}
              className={`flex cursor-pointer gap-3 rounded-md border p-4 transition-colors ${
                selected ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/40'
              }`}
            >
              <input
                type="radio"
                name="listingsFilterVariant"
                value={option.value}
                checked={selected}
                onChange={() => setVariant(option.value)}
                className="mt-1"
              />
              <span className="space-y-1">
                <span className="block text-sm font-semibold text-foreground">{option.title}</span>
                <span className="block text-xs text-muted-foreground">{option.description}</span>
              </span>
            </label>
          )
        })}
      </div>

      <div className="flex justify-end">
        <Button type="button" variant="primary" onClick={handleSave} disabled={saving}>
          {saving ? <DotProgress size={12} count={3} variant="wave" /> : 'Guardar'}
        </Button>
      </div>
    </section>
  )
}
