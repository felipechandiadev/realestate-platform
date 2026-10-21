'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, BedDouble, Building2, Heart, MapPin, Menu, Search, ShowerHead, Square } from 'lucide-react'
import { Button, DeleteDialog, Dialog, IconButton, TextField } from '@realestate/ui'
import { PageLoadingDots } from '@/shared/components/ui/PageLoadingDots/PageLoadingDots'
import {
  APPEARANCE_COLOR_KEYS,
  appearanceContrastWarnings,
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

const DOT_KEYS: (keyof AppearanceColors)[] = [...APPEARANCE_COLOR_KEYS]

function sameColors(a: AppearanceColors, b: AppearanceColors) {
  const normalizedA = resolveAppearance(a)
  const normalizedB = resolveAppearance(b)
  return APPEARANCE_COLOR_KEYS.every((key) => normalizedA[key].toLowerCase() === normalizedB[key].toLowerCase())
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
  {
    title: 'Barra superior del portal',
    keys: [
      { key: 'topBarBackground', label: 'Fondo de la barra superior' },
      { key: 'topBarForeground', label: 'Texto de la barra superior' },
    ],
  },
  {
    title: 'Navbar del portal',
    keys: [
      { key: 'navbarBackground', label: 'Fondo de la navbar' },
      { key: 'navbarForeground', label: 'Texto de la navbar' },
    ],
  },
  {
    title: 'Footer del portal',
    keys: [
      { key: 'footerBackground', label: 'Fondo del footer' },
      { key: 'footerForeground', label: 'Texto del footer y copyright' },
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
      className="overflow-hidden rounded-2xl border border-border shadow-xl"
      data-test-id="appearance-preview"
      aria-label="Maqueta de vista previa del portal"
      style={{
        ...style,
        backgroundColor: 'var(--color-background)',
        color: 'var(--color-foreground)',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      {/* Browser frame */}
      <div className="flex h-9 items-center gap-1.5 border-b px-3" style={{ backgroundColor: '#f1f5f9', borderColor: 'var(--color-border)' }}>
        <span className="h-2 w-2 rounded-full bg-rose-400" />
        <span className="h-2 w-2 rounded-full bg-amber-400" />
        <span className="h-2 w-2 rounded-full bg-emerald-400" />
        <div className="ml-3 flex h-5 flex-1 items-center rounded px-2 text-[9px] text-slate-500" style={{ backgroundColor: '#ffffff' }}>
          bravoschott.cl
        </div>
      </div>

      {/* Portal top bar */}
      <header
        className="flex min-h-14 items-center justify-between gap-2 px-4 py-2"
        style={{ backgroundColor: 'var(--color-topbar-background)', color: 'var(--color-topbar-foreground)' }}
      >
        <div className="flex min-w-0 items-center gap-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg" style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-text-on-primary)' }}>
            <Building2 size={17} />
          </div>
          <div className="min-w-0">
            <p className="truncate text-[11px] font-bold leading-tight">{companyName}</p>
            <p className="text-[8px] opacity-70">Propiedades · Chile</p>
          </div>
        </div>
        <div className="hidden items-center gap-4 text-[9px] md:flex">
          <span>✉ contacto@bravoschott.cl</span>
          <span>☎ +56 9 1234 5678</span>
        </div>
        <button type="button" className="shrink-0 rounded-md px-2.5 py-1.5 text-[9px] font-semibold" style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-text-on-primary)' }}>
          Ingresar
        </button>
      </header>

      {/* Main navigation */}
      <nav
        className="flex items-center justify-between border-y px-4 py-2"
        aria-label="Navegación de la maqueta"
        style={{ backgroundColor: 'var(--color-navbar-background)', color: 'var(--color-navbar-foreground)', borderColor: 'var(--color-border)' }}
      >
        <div className="hidden items-center gap-5 text-[9px] font-semibold sm:flex">
          <span className="border-b-2 pb-1" style={{ borderColor: 'var(--color-primary)' }}>PROPIEDADES</span>
          <span>NOSOTROS</span>
          <span>SERVICIOS</span>
          <span>CONTACTO</span>
        </div>
        <span className="text-[9px] font-semibold sm:hidden">PROPIEDADES　 NOSOTROS</span>
        <Menu size={15} className="sm:hidden" aria-hidden="true" />
        <span className="hidden text-[9px] font-medium opacity-70 sm:inline">Vende o arrienda tu propiedad　↗</span>
      </nav>

      {/* Portal landing content */}
      <main style={{ backgroundColor: 'var(--color-background)', color: 'var(--color-foreground)' }}>
        <section className="relative overflow-hidden px-5 py-8 sm:px-8 sm:py-10" style={{ background: 'linear-gradient(115deg, color-mix(in srgb, var(--color-primary) 92%, #0f172a), color-mix(in srgb, var(--color-accent) 78%, #0f172a))', color: '#ffffff' }}>
          <div className="pointer-events-none absolute -right-8 -top-12 h-44 w-44 rounded-full border-[24px] opacity-10" style={{ borderColor: 'var(--color-secondary)' }} />
          <p className="text-[9px] font-semibold uppercase tracking-[0.22em] opacity-80">Encuentra tu próximo hogar</p>
          <h3 className="mt-2 max-w-sm text-xl font-bold leading-tight sm:text-2xl">Propiedades para vivir tus mejores momentos</h3>
          <p className="mt-2 max-w-sm text-[10px] leading-relaxed opacity-85">Explora casas, departamentos y oportunidades de inversión en tu zona.</p>
          <div className="mt-5 flex items-center gap-2 rounded-xl p-2 shadow-lg" style={{ backgroundColor: 'var(--color-background)', color: 'var(--color-foreground)' }}>
            <MapPin size={14} className="ml-1 shrink-0" style={{ color: 'var(--color-primary)' }} />
            <span className="min-w-0 flex-1 truncate text-[9px] opacity-60">Ciudad, comuna o barrio</span>
            <button type="button" className="flex shrink-0 items-center gap-1 rounded-lg px-3 py-2 text-[9px] font-semibold" style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-text-on-primary)' }}>
              <Search size={12} /> Buscar
            </button>
          </div>
        </section>

        <section className="px-4 py-5 sm:px-6">
          <div className="mb-3 flex items-end justify-between gap-2">
            <div>
              <p className="text-[8px] font-semibold uppercase tracking-[0.18em]" style={{ color: 'var(--color-accent)' }}>Selección especial</p>
              <h4 className="mt-1 text-sm font-bold">Propiedades destacadas</h4>
            </div>
            <span className="flex items-center gap-1 text-[9px] font-semibold" style={{ color: 'var(--color-primary)' }}>Ver todas <ArrowRight size={11} /></span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[{ title: 'Casa en barrio parque', price: 'UF 4.200', type: 'Casa · 3 dorm.' }, { title: 'Departamento céntrico', price: 'UF 2.850', type: 'Depto. · 2 dorm.' }].map((property, index) => (
              <article key={property.title} className="overflow-hidden rounded-xl border shadow-sm" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)', color: 'var(--color-foreground)' }}>
                <div className="relative flex h-20 items-center justify-center sm:h-28" style={{ background: index === 0 ? 'linear-gradient(135deg, color-mix(in srgb, var(--color-secondary) 45%, #dbeafe), color-mix(in srgb, var(--color-primary) 24%, #f8fafc))' : 'linear-gradient(135deg, color-mix(in srgb, var(--color-accent) 28%, #e0e7ff), color-mix(in srgb, var(--color-secondary) 32%, #f8fafc))' }}>
                  <Building2 size={34} strokeWidth={1.2} className="opacity-50" style={{ color: 'var(--color-primary)' }} />
                  <span className="absolute left-2 top-2 rounded px-1.5 py-1 text-[7px] font-bold uppercase" style={{ backgroundColor: 'var(--color-background)', color: 'var(--color-primary)' }}>En venta</span>
                  <Heart size={13} className="absolute right-2 top-2" style={{ color: 'var(--color-primary)' }} />
                </div>
                <div className="p-2 sm:p-2.5">
                  <p className="truncate text-[9px] font-semibold sm:text-[10px]">{property.title}</p>
                  <p className="mt-1 text-[8px] opacity-65">Parral, Maule</p>
                  <p className="mt-1.5 text-[10px] font-bold" style={{ color: 'var(--color-accent)' }}>{property.price}</p>
                  <div className="mt-2 flex items-center gap-2 border-t pt-2 text-[7px] opacity-70" style={{ borderColor: 'var(--color-border)' }}>
                    <span className="flex items-center gap-0.5"><BedDouble size={10} /> 3</span>
                    <span className="flex items-center gap-0.5"><ShowerHead size={10} /> 2</span>
                    <span className="flex items-center gap-0.5"><Square size={9} /> 120 m²</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
          <div className="mt-4 flex justify-center">
            <button type="button" className="rounded-lg border px-4 py-2 text-[9px] font-semibold" style={{ borderColor: 'var(--color-primary)', color: 'var(--color-primary)' }}>Explorar propiedades</button>
          </div>
        </section>
      </main>

      {/* Portal footer */}
      <footer className="px-5 py-5 sm:px-6" style={{ backgroundColor: 'var(--color-footer-background)', color: 'var(--color-footer-foreground)' }}>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <div className="col-span-2 sm:col-span-1">
            <p className="text-[10px] font-bold">{companyName}</p>
            <p className="mt-1 max-w-44 text-[8px] leading-relaxed opacity-75">Te acompañamos para encontrar el lugar ideal para ti y tu familia.</p>
          </div>
          <div>
            <p className="text-[9px] font-bold">Enlaces</p>
            <p className="mt-1.5 text-[8px] leading-4 opacity-75">Propiedades<br />Nosotros<br />Publica tu propiedad</p>
          </div>
          <div>
            <p className="text-[9px] font-bold">Contacto</p>
            <p className="mt-1.5 text-[8px] leading-4 opacity-75">Parral, Chile<br />contacto@bravoschott.cl<br />+56 9 1234 5678</p>
          </div>
        </div>
        <div className="mt-4 border-t border-current/25 pt-3 text-center text-[8px] opacity-75">© {new Date().getFullYear()} {companyName} · Todos los derechos reservados</div>
      </footer>
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
  const contrastWarnings = useMemo(() => appearanceContrastWarnings(previewColors), [previewColors])

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
      success('Paleta guardada')
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
        <h1 className="text-2xl font-semibold text-foreground">Paleta de colores</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Administre aquí la paleta compartida. Los colores generales se aplican al portal y al backoffice; la barra superior, navbar y footer se personalizan solo en el portal.
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

      <div className="grid items-start gap-8 lg:grid-cols-[minmax(280px,420px)_minmax(0,1fr)]">
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
          {contrastWarnings.length > 0 ? (
            <div className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-950" role="status" data-test-id="appearance-contrast-warning">
              <p className="font-semibold">Revisa el contraste del texto</p>
              <p className="mt-1 text-xs">Estas combinaciones están bajo el mínimo recomendado de 4,5:1:</p>
              <ul className="mt-1 list-inside list-disc text-xs">
                {contrastWarnings.map(({ label, ratio }) => (
                  <li key={label}>{label}: {ratio.toFixed(2)}:1</li>
                ))}
              </ul>
            </div>
          ) : null}
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
          <h2 className="text-sm font-semibold text-foreground">Vista previa del portal</h2>
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
                <div className="mb-2 flex max-w-32 flex-wrap gap-1">
                  {DOT_KEYS.map((key) => (
                    <span
                      key={key}
                      className="h-3 w-3 rounded-full border border-border/70"
                      style={{ backgroundColor: resolveAppearance(template)[key] }}
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
