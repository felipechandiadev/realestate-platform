'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button, DeleteDialog, Dialog, IconButton, TextField } from '@realestate/ui'
import { PageLoadingDots } from '@/shared/components/ui/PageLoadingDots/PageLoadingDots'
import {
  APPEARANCE_COLOR_KEYS,
  appearanceStyle,
  normalizeHexColor,
  resolveAppearance,
  type AppearanceColors,
} from '@realestate/ui/theme/appearance-theme'
import { useAlert } from '@/providers/AlertContext'
import { getIdentity } from '@/features/cms/actions/identity.action'
import {
  createAppearanceTemplate,
  deleteAppearanceTemplate,
  getAppearance,
  listAppearanceTemplates,
  renameAppearanceTemplate,
  updateAppearance,
  type AppearanceTemplate,
} from '@/features/cms/actions/appearance.action'

const DOT_KEYS: (keyof AppearanceColors)[] = ['primary', 'secondary', 'accent', 'background', 'foreground']

function sameColors(a: AppearanceColors, b: AppearanceColors) {
  return APPEARANCE_COLOR_KEYS.every((key) => a[key].toLowerCase() === b[key].toLowerCase())
}

const COLOR_GROUPS: {
  title: string
  keys: { key: keyof AppearanceColors; label: string }[]
}[] = [
  {
    title: 'Marca',
    keys: [
      { key: 'primary', label: 'Primario' },
      { key: 'secondary', label: 'Secundario' },
      { key: 'accent', label: 'Acento' },
    ],
  },
  {
    title: 'Superficie',
    keys: [
      { key: 'background', label: 'Fondo' },
      { key: 'foreground', label: 'Texto' },
    ],
  },
]

function ColorRow({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (hex: string) => void
}) {
  const [draft, setDraft] = useState(value.replace(/^#/, '').toUpperCase())

  useEffect(() => {
    setDraft(value.replace(/^#/, '').toUpperCase())
  }, [value])

  return (
    <div className="flex items-end gap-3">
      <input
        type="color"
        value={value}
        aria-label={`Selector de ${label}`}
        data-test-id={`appearance-color-${label}`}
        className="h-10 w-14 shrink-0 cursor-pointer rounded border border-border bg-background p-1"
        onChange={(event) => onChange(event.target.value)}
      />
      <div className="min-w-0 flex-1">
        <TextField
          label={label}
          value={draft}
          density="compact"
          alwaysShowLabel
          onChange={(event) => {
            const next = event.target.value.replace(/[^0-9a-fA-F]/g, '').slice(0, 6).toUpperCase()
            setDraft(next)
            const normalized = normalizeHexColor(`#${next}`)
            if (normalized) onChange(normalized)
          }}
        />
      </div>
    </div>
  )
}

function AppearancePreview({
  colors,
  companyName,
}: {
  colors: AppearanceColors
  companyName: string
}) {
  const style = appearanceStyle(colors)
  return (
    <div
      className="overflow-hidden rounded-xl border border-border shadow-sm"
      data-test-id="appearance-preview"
      style={style}
    >
      <div
        className="flex items-center justify-between px-4 py-3 text-sm"
        style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-text-on-primary)' }}
      >
        <span className="font-semibold">{companyName}</span>
        <span className="text-xs">Ingresar</span>
      </div>
      <div
        className="px-4 py-2 text-sm"
        style={{ backgroundColor: 'var(--color-background)', color: 'var(--color-foreground)' }}
      >
        <span className="font-medium" style={{ color: 'var(--color-primary)' }}>
          Propiedades
        </span>
      </div>
      <div className="space-y-3 p-4" style={{ backgroundColor: 'var(--color-background)' }}>
        <div
          className="rounded-lg border p-3"
          style={{
            borderColor: 'var(--color-border)',
            backgroundColor: 'var(--color-surface)',
            color: 'var(--color-foreground)',
          }}
        >
          <p className="text-sm font-medium">Casa en barrio parque</p>
          <p className="mt-1 text-sm font-semibold" style={{ color: 'var(--color-accent)' }}>
            UF 4.200
          </p>
        </div>
        <button
          type="button"
          className="w-full rounded-lg px-4 py-2 text-sm font-semibold"
          style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-text-on-primary)' }}
        >
          Ver propiedad
        </button>
      </div>
      <div
        className="px-4 py-3 text-center text-xs"
        style={{ backgroundColor: 'var(--color-foreground)', color: 'var(--color-background)' }}
      >
        {companyName}
      </div>
    </div>
  )
}

export default function AppearancePage() {
  const router = useRouter()
  const { success, error } = useAlert()
  const [colors, setColors] = useState<AppearanceColors | null>(null)
  const [published, setPublished] = useState<AppearanceColors | null>(null)
  const [templates, setTemplates] = useState<AppearanceTemplate[]>([])
  const [companyName, setCompanyName] = useState('Bravo Schott Propiedades')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [creating, setCreating] = useState(false)
  const [renaming, setRenaming] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [saveAsOpen, setSaveAsOpen] = useState(false)
  const [templateName, setTemplateName] = useState('')
  const [renameTarget, setRenameTarget] = useState<AppearanceTemplate | null>(null)
  const [renameName, setRenameName] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<AppearanceTemplate | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const [appearance, templateList, identity] = await Promise.all([
          getAppearance(),
          listAppearanceTemplates(),
          getIdentity(),
        ])
        const resolved = resolveAppearance(appearance)
        setColors(resolved)
        setPublished(resolved)
        setTemplates(templateList)
        const name = identity?.name?.trim()
        if (name) setCompanyName(name)
      } catch (err) {
        error(err instanceof Error ? err.message : 'No se pudo cargar la apariencia')
      } finally {
        setLoading(false)
      }
    }
    void load()
  }, [error])

  const previewColors = useMemo(() => resolveAppearance(colors), [colors])

  const setColor = (key: keyof AppearanceColors, hex: string) => {
    setColors((prev) => (prev ? { ...prev, [key]: hex } : prev))
  }

  const onSave = async () => {
    if (!colors || saving) return
    const next = resolveAppearance(colors)
    const invalid = (Object.keys(next) as (keyof AppearanceColors)[]).some(
      (key) => normalizeHexColor(colors[key]) == null,
    )
    if (invalid) {
      error('Cada color debe ser un hexadecimal válido')
      return
    }
    setSaving(true)
    try {
      const saved = await updateAppearance(next)
      const resolved = resolveAppearance(saved)
      setColors(resolved)
      setPublished(resolved)
      success('Apariencia guardada')
      router.refresh()
    } catch (err) {
      error(err instanceof Error ? err.message : 'No se pudo guardar la apariencia')
    } finally {
      setSaving(false)
    }
  }

  const onCreateTemplate = async () => {
    if (!colors || creating || templateName.trim().length < 2) return
    setCreating(true)
    try {
      const created = await createAppearanceTemplate(templateName.trim(), resolveAppearance(colors))
      setTemplates((prev) => [...prev, created].sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name)))
      setSaveAsOpen(false)
      setTemplateName('')
      success('Plantilla guardada')
    } catch (err) {
      error(err instanceof Error ? err.message : 'No se pudo guardar la plantilla')
    } finally {
      setCreating(false)
    }
  }

  const onRenameTemplate = async () => {
    if (!renameTarget || renaming || renameName.trim().length < 2) return
    setRenaming(true)
    try {
      const updated = await renameAppearanceTemplate(renameTarget.id, renameName.trim())
      setTemplates((prev) =>
        prev
          .map((template) => (template.id === updated.id ? updated : template))
          .sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name)),
      )
      setRenameTarget(null)
      success('Plantilla renombrada')
    } catch (err) {
      error(err instanceof Error ? err.message : 'No se pudo renombrar la plantilla')
    } finally {
      setRenaming(false)
    }
  }

  const onDeleteTemplate = async () => {
    if (!deleteTarget || deleting) return
    setDeleting(true)
    try {
      await deleteAppearanceTemplate(deleteTarget.id)
      setTemplates((prev) => prev.filter((template) => template.id !== deleteTarget.id))
      setDeleteTarget(null)
      success('Plantilla eliminada')
    } catch (err) {
      error(err instanceof Error ? err.message : 'No se pudo eliminar la plantilla')
    } finally {
      setDeleting(false)
    }
  }

  if (loading || !colors) {
    return (
      <PageLoadingDots />
    )
  }

  return (
    <div className="mx-auto w-full max-w-[1200px] pt-10 sm:pt-0" data-test-id="cms-appearance-page">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-foreground">Apariencia</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Elija una plantilla o ajuste los colores. El portal y el backoffice cambian al guardar.
        </p>
      </div>

      <TemplateStrip
        templates={templates}
        draft={colors}
        published={published}
        onApply={(template) => setColors(resolveAppearance(template))}
        onRename={(template) => {
          setRenameTarget(template)
          setRenameName(template.name)
        }}
        onDelete={setDeleteTarget}
      />

      <div className="grid items-start gap-8 lg:grid-cols-[minmax(280px,380px)_minmax(0,1fr)]">
        <div className="space-y-6">
          {COLOR_GROUPS.map((group) => (
            <section key={group.title} className="space-y-4">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {group.title}
              </h2>
              {group.keys.map((item) => (
                <ColorRow
                  key={item.key}
                  label={item.label}
                  value={colors[item.key]}
                  onChange={(hex) => setColor(item.key, hex)}
                />
              ))}
            </section>
          ))}
          <div className="flex flex-wrap gap-3">
            <Button type="button" variant="primary" loading={saving} data-test-id="appearance-save" onClick={() => void onSave()}>
              Guardar
            </Button>
            <Button
              type="button"
              variant="outlined"
              data-test-id="appearance-save-template"
              onClick={() => {
                setTemplateName('')
                setSaveAsOpen(true)
              }}
            >
              Guardar como plantilla
            </Button>
          </div>
        </div>
        <aside className="min-w-0 space-y-2 lg:sticky lg:top-4">
          <h2 className="text-sm font-semibold text-foreground">Vista previa</h2>
          <AppearancePreview colors={previewColors} companyName={companyName} />
        </aside>
      </div>

      <Dialog
        open={saveAsOpen}
        onClose={() => {
          if (!creating) setSaveAsOpen(false)
        }}
        title="Guardar como plantilla"
        size="sm"
        actionsJustify="end"
        data-test-id="appearance-save-template-dialog"
        actions={
          <>
            <Button type="button" variant="outlined" disabled={creating} onClick={() => setSaveAsOpen(false)}>
              Cancelar
            </Button>
            <Button type="button" loading={creating} disabled={templateName.trim().length < 2} onClick={() => void onCreateTemplate()}>
              Guardar plantilla
            </Button>
          </>
        }
      >
        <TextField
          label="Nombre"
          value={templateName}
          alwaysShowLabel
          data-test-id="appearance-template-name"
          onChange={(event) => setTemplateName(event.target.value.slice(0, 80))}
        />
      </Dialog>

      <Dialog
        open={renameTarget !== null}
        onClose={() => {
          if (!renaming) setRenameTarget(null)
        }}
        title="Renombrar plantilla"
        size="sm"
        actionsJustify="end"
        data-test-id="appearance-rename-template-dialog"
        actions={
          <>
            <Button type="button" variant="outlined" disabled={renaming} onClick={() => setRenameTarget(null)}>
              Cancelar
            </Button>
            <Button type="button" loading={renaming} disabled={renameName.trim().length < 2} onClick={() => void onRenameTemplate()}>
              Renombrar
            </Button>
          </>
        }
      >
        <TextField
          label="Nombre"
          value={renameName}
          alwaysShowLabel
          data-test-id="appearance-rename-template-name"
          onChange={(event) => setRenameName(event.target.value.slice(0, 80))}
        />
      </Dialog>

      <DeleteDialog
        open={deleteTarget !== null}
        onClose={() => {
          if (!deleting) setDeleteTarget(null)
        }}
        title="Eliminar plantilla"
        message={
          deleteTarget ? (
            <>
              ¿Eliminar la plantilla <strong className="font-semibold">«{deleteTarget.name}»</strong>? El
              sitio publicado no cambia.
            </>
          ) : (
            ''
          )
        }
        isSubmitting={deleting}
        onConfirm={() => void onDeleteTemplate()}
        data-test-id="appearance-delete-template-dialog"
      />
    </div>
  )
}

function TemplateStrip({
  templates,
  draft,
  published,
  onApply,
  onRename,
  onDelete,
}: {
  templates: AppearanceTemplate[]
  draft: AppearanceColors
  published: AppearanceColors | null
  onApply: (template: AppearanceTemplate) => void
  onRename: (template: AppearanceTemplate) => void
  onDelete: (template: AppearanceTemplate) => void
}) {
  const matchesDraft = templates.some((template) => sameColors(draft, template))

  return (
    <div className="mb-8 space-y-2" data-test-id="appearance-templates">
      <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Plantillas</h2>
      <div className="flex gap-3 overflow-x-auto pb-1">
        {matchesDraft ? null : (
          <div
            className="flex min-w-[10rem] shrink-0 items-center rounded-xl border border-primary/40 bg-primary/5 px-3 py-3 text-sm font-medium text-foreground"
            data-test-id="appearance-custom-chip"
          >
            Personalizada
          </div>
        )}
        {templates.map((template) => {
          const selected = sameColors(draft, template)
          const inUse = published ? sameColors(published, template) : false
          return (
            <div
              key={template.id}
              className={`relative min-w-[11rem] shrink-0 rounded-xl border ${selected ? 'border-primary' : 'border-border'}`}
            >
              <button
                type="button"
                className="w-full p-3 pr-14 text-left"
                data-test-id={`appearance-template-${template.id}`}
                onClick={() => onApply(template)}
              >
                <div className="mb-2 flex gap-1">
                  {DOT_KEYS.map((key) => (
                    <span
                      key={key}
                      className="h-4 w-4 rounded-full border border-border/70"
                      style={{ backgroundColor: template[key] }}
                    />
                  ))}
                </div>
                <p className="text-sm font-medium text-foreground">{template.name}</p>
                {inUse ? <p className="mt-1 text-xs font-medium text-primary">En uso</p> : null}
              </button>
              {template.isSystem ? null : (
                <div className="absolute right-1 top-1 flex">
                  <IconButton
                    icon="Pencil"
                    variant="action"
                    size="sm"
                    ariaLabel={`Renombrar ${template.name}`}
                    data-test-id={`appearance-template-rename-${template.id}`}
                    onClick={() => onRename(template)}
                  />
                  <IconButton
                    icon="Trash2"
                    variant="action"
                    size="sm"
                    ariaLabel={`Eliminar ${template.name}`}
                    data-test-id={`appearance-template-delete-${template.id}`}
                    onClick={() => onDelete(template)}
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
