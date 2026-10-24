'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { Button, DotProgress } from '@realestate/ui'
import { PageLoadingDots } from '@/shared/components/ui/PageLoadingDots/PageLoadingDots'
import { useAlert } from '@/providers/AlertContext'
import {
  getPortalFeaturedSettings,
  updatePortalFeaturedSettings,
  type FeaturedLayoutDesktop,
} from '@/features/cms/actions/portal-featured.action'

const LAYOUT_OPTIONS: {
  value: FeaturedLayoutDesktop
  title: string
  description: string
}[] = [
  {
    value: 'band',
    title: 'Carrusel (desktop)',
    description:
      'Banda horizontal con scroll manual. En mobile siempre se usa carrusel.',
  },
  {
    value: 'grid',
    title: 'Grilla (desktop)',
    description:
      'Grilla CSS con columnas y filas. Mobile sigue en carrusel. Máximo 16 por página.',
  },
]

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

function FeaturedPreview({
  layoutDesktop,
  gridColumns,
  gridRows,
}: {
  layoutDesktop: FeaturedLayoutDesktop
  gridColumns: number
  gridRows: number
}) {
  const pageSize = Math.min(16, gridColumns * gridRows)
  const cells = useMemo(
    () => Array.from({ length: layoutDesktop === 'grid' ? pageSize : 6 }, (_, i) => i),
    [layoutDesktop, pageSize],
  )

  if (layoutDesktop === 'band') {
    return (
      <div className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground">
          Preview desktop · carrusel con scroll
        </p>
        <div className="flex gap-3 overflow-x-auto rounded-lg border border-border bg-white p-3 [scrollbar-width:thin]">
          {cells.map((i) => (
            <div
              key={i}
              className="h-28 w-40 shrink-0 rounded-md border border-border bg-primary/10"
            />
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          Mobile: mismo carrusel scrolleable.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-muted-foreground">
        Preview desktop · {gridColumns}×{gridRows} ({pageSize}/pág.)
      </p>
      <div
        className="grid gap-2 rounded-lg border border-border bg-white p-3"
        style={{ gridTemplateColumns: `repeat(${gridColumns}, minmax(0, 1fr))` }}
      >
        {cells.map((i) => (
          <div
            key={i}
            className="aspect-[4/3] rounded-md border border-border bg-primary/10"
          />
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        Mobile: carrusel (no usa esta grilla). Paginación oculta si hay 1 página.
      </p>
    </div>
  )
}

export default function CmsFeaturedPage() {
  const { showAlert } = useAlert()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [layoutDesktop, setLayoutDesktop] = useState<FeaturedLayoutDesktop>('band')
  const [gridColumns, setGridColumns] = useState(3)
  const [gridRows, setGridRows] = useState(2)

  const pageSize = Math.min(16, gridColumns * gridRows)

  useEffect(() => {
    let ignore = false
    ;(async () => {
      try {
        const settings = await getPortalFeaturedSettings()
        if (ignore) return
        setLayoutDesktop(settings.layoutDesktop)
        setGridColumns(settings.gridColumns)
        setGridRows(settings.gridRows)
      } catch (err) {
        showAlert({
          message: err instanceof Error ? err.message : 'Error al cargar destacadas',
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
      const updated = await updatePortalFeaturedSettings({
        layoutDesktop,
        gridColumns,
        gridRows,
      })
      setLayoutDesktop(updated.layoutDesktop)
      setGridColumns(updated.gridColumns)
      setGridRows(updated.gridRows)
      showAlert({
        message: 'Configuración de destacadas guardada',
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
    <section className="mx-auto max-w-4xl space-y-6 p-4 md:p-6" data-test-id="cms-featured-page">
      <header className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          CMS
        </p>
        <h1 className="text-2xl font-bold text-foreground">Propiedades destacadas</h1>
        <p className="text-sm text-muted-foreground">
          Define cómo se muestran las destacadas en el home del portal (desktop). En mobile
          siempre se usa el carrusel con scroll.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <div className="space-y-3 rounded-lg border border-border p-4">
            {LAYOUT_OPTIONS.map((option) => {
              const selected = layoutDesktop === option.value
              return (
                <label
                  key={option.value}
                  className={`flex cursor-pointer gap-3 rounded-md border p-4 transition-colors ${
                    selected ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/40'
                  }`}
                >
                  <input
                    type="radio"
                    name="layoutDesktop"
                    value={option.value}
                    checked={selected}
                    onChange={() => setLayoutDesktop(option.value)}
                    className="mt-1"
                  />
                  <span className="space-y-1">
                    <span className="block text-sm font-semibold text-foreground">
                      {option.title}
                    </span>
                    <span className="block text-xs text-muted-foreground">
                      {option.description}
                    </span>
                  </span>
                </label>
              )
            })}
          </div>

          {layoutDesktop === 'grid' ? (
            <div className="space-y-3 rounded-lg border border-border p-4">
              <p className="text-sm font-semibold text-foreground">Grilla desktop</p>
              <div className="grid grid-cols-2 gap-3">
                <label className="space-y-1 text-xs text-muted-foreground">
                  Columnas (1–4)
                  <input
                    type="number"
                    min={1}
                    max={4}
                    value={gridColumns}
                    onChange={(e) =>
                      setGridColumns(clamp(Number(e.target.value) || 1, 1, 4))
                    }
                    className="block w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
                  />
                </label>
                <label className="space-y-1 text-xs text-muted-foreground">
                  Filas (1–4)
                  <input
                    type="number"
                    min={1}
                    max={4}
                    value={gridRows}
                    onChange={(e) => setGridRows(clamp(Number(e.target.value) || 1, 1, 4))}
                    className="block w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
                  />
                </label>
              </div>
              <p className="text-xs text-muted-foreground">
                {pageSize} propiedades por página (máximo 16).
              </p>
            </div>
          ) : null}

          <div className="flex justify-end">
            <Button type="button" variant="primary" onClick={handleSave} disabled={saving}>
              {saving ? <DotProgress size={12} count={3} variant="wave" /> : 'Guardar'}
            </Button>
          </div>
        </div>

        <div className="rounded-lg border border-border p-4">
          <FeaturedPreview
            layoutDesktop={layoutDesktop}
            gridColumns={gridColumns}
            gridRows={gridRows}
          />
        </div>
      </div>
    </section>
  )
}
