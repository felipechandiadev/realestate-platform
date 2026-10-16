'use client'

import React, { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { Button, DotProgress, Switch, TextField } from '@realestate/ui'
import { PageLoadingDots } from '@/shared/components/ui/PageLoadingDots/PageLoadingDots'
import { useAlert } from '@/providers/AlertContext'
import { env } from '@/lib/env'
import MultimediaUpdater from '@/shared/components/ui/FileUploader/MultimediaUpdater'
import { getIdentity } from '@/features/cms/actions/identity.action'
import { getPortalFooter, updatePortalFooter } from '@/features/cms/actions/portal-footer.action'

type MenuItem = {
  id: string
  label: string
  href: string
  enabled: boolean
}

type PortalFooter = {
  id?: string
  logoUrl?: string | null
  showCompany: boolean
  showAddress: boolean
  showPhone: boolean
  showHours: boolean
  showMail: boolean
  showSocial: boolean
  showPartnerships: boolean
  showFaqs: boolean
  showCopyright: boolean
  menuTitle: string
  contactTitle: string
  socialTitle: string
  partnershipsTitle: string
  faqsTitle: string
  copyrightSuffix: string
  menuItems: MenuItem[]
}

type SectionId = 'marca' | 'contacto' | 'columnas' | 'menu'

const TABS: { id: SectionId; label: string }[] = [
  { id: 'marca', label: 'Marca' },
  { id: 'contacto', label: 'Contacto' },
  { id: 'columnas', label: 'Columnas' },
  { id: 'menu', label: 'Menú' },
]

/** Legacy hash from the previous 2-tab UI */
const LEGACY_HASH_MAP: Record<string, SectionId> = {
  contenido: 'marca',
}

function isSectionId(value: string): value is SectionId {
  return TABS.some((tab) => tab.id === value)
}

function resolveSectionFromHash(hash: string): SectionId | null {
  const id = hash.replace(/^#/, '').trim()
  if (!id) return null
  if (isSectionId(id)) return id
  return LEGACY_HASH_MAP[id] ?? null
}

function normalizeMediaUrl(url?: string | null): string | undefined {
  if (!url) return undefined
  const cleaned = url.replace('/../', '/')
  if (cleaned.startsWith('http://') || cleaned.startsWith('https://')) return cleaned
  if (cleaned.startsWith('/')) return `${env.backendApiUrl}${cleaned}`
  return `${env.backendApiUrl}/${cleaned}`
}

function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string
  description?: string
  checked: boolean
  onChange: (checked: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-border px-4 py-3">
      <div>
        <div className="text-sm font-medium text-foreground">{label}</div>
        {description ? <div className="text-xs text-muted-foreground">{description}</div> : null}
      </div>
      <Switch checked={checked} onChange={onChange} label="Visible" labelPosition="left" />
    </div>
  )
}

function patchFooter(
  setFooter: React.Dispatch<React.SetStateAction<PortalFooter | null>>,
  patch: Partial<PortalFooter>,
) {
  setFooter((prev) => (prev ? { ...prev, ...patch } : prev))
}

export default function PortalFooterPage() {
  const { success, error } = useAlert()
  const [footer, setFooter] = useState<PortalFooter | null>(null)
  const [identityLogo, setIdentityLogo] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [savingSection, setSavingSection] = useState<SectionId | null>(null)
  const [activeSection, setActiveSection] = useState<SectionId>('marca')
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [removeLogo, setRemoveLogo] = useState(false)

  useEffect(() => {
    const syncFromHash = () => {
      const fromHash = resolveSectionFromHash(window.location.hash)
      if (fromHash) setActiveSection(fromHash)
    }
    syncFromHash()
    window.addEventListener('hashchange', syncFromHash)
    return () => window.removeEventListener('hashchange', syncFromHash)
  }, [])

  const selectSection = useCallback((id: SectionId) => {
    setActiveSection(id)
    const nextHash = `#${id}`
    if (window.location.hash !== nextHash) {
      window.history.replaceState(
        null,
        '',
        `${window.location.pathname}${window.location.search}${nextHash}`,
      )
    }
  }, [])

  useEffect(() => {
    async function load() {
      try {
        const [footerData, identityData] = await Promise.all([
          getPortalFooter(),
          getIdentity(),
        ])
        setFooter(footerData)
        setIdentityLogo(identityData?.urlLogo || null)
      } catch (err) {
        error(err instanceof Error ? err.message : 'Error cargando el footer')
      } finally {
        setLoading(false)
      }
    }
    void load()
  }, [error])

  const saveSection = async (section: SectionId) => {
    if (!footer) return
    setSavingSection(section)
    try {
      const formData = new FormData()

      if (section === 'marca') {
        formData.append('showCompany', String(footer.showCompany))
        formData.append('showCopyright', String(footer.showCopyright))
        formData.append('copyrightSuffix', footer.copyrightSuffix)
        if (logoFile) formData.append('logo', logoFile)
        else if (removeLogo) formData.append('removeLogo', 'true')
      }

      if (section === 'contacto') {
        formData.append('showAddress', String(footer.showAddress))
        formData.append('showPhone', String(footer.showPhone))
        formData.append('showHours', String(footer.showHours))
        formData.append('showMail', String(footer.showMail))
        formData.append('contactTitle', footer.contactTitle)
      }

      if (section === 'columnas') {
        formData.append('showSocial', String(footer.showSocial))
        formData.append('showPartnerships', String(footer.showPartnerships))
        formData.append('showFaqs', String(footer.showFaqs))
        formData.append('socialTitle', footer.socialTitle)
        formData.append('partnershipsTitle', footer.partnershipsTitle)
        formData.append('faqsTitle', footer.faqsTitle)
      }

      if (section === 'menu') {
        formData.append('menuTitle', footer.menuTitle)
        formData.append('menuItems', JSON.stringify(footer.menuItems))
      }

      const result = await updatePortalFooter(formData)
      setFooter(result)
      if (section === 'marca') {
        setLogoFile(null)
        setRemoveLogo(false)
      }
      success('Sección actualizada')
    } catch (err) {
      error(err instanceof Error ? err.message : 'Error guardando la sección')
    } finally {
      setSavingSection(null)
    }
  }

  if (loading) return <PageLoadingDots />
  if (!footer) {
    return <p className="p-4 text-muted-foreground">No se pudo cargar el footer.</p>
  }

  const logoPreview = removeLogo
    ? undefined
    : footer.logoUrl
      ? normalizeMediaUrl(footer.logoUrl)
      : undefined

  const SectionSave = ({ section, label }: { section: SectionId; label: string }) => (
    <div className="flex justify-end border-t border-border pt-4">
      <Button
        onClick={() => void saveSection(section)}
        disabled={savingSection !== null}
        variant="primary"
      >
        {savingSection === section ? (
          <DotProgress size={12} count={3} variant="wave" />
        ) : (
          label
        )}
      </Button>
    </div>
  )

  return (
    <div
      className="mx-auto w-full max-w-4xl space-y-3 px-0 py-2 sm:space-y-6 sm:px-6 sm:py-6"
      data-test-id="portal-footer-root"
    >
      <header
        className="border-b border-border pb-2 sm:pb-4"
        data-test-id="portal-footer-header"
      >
        <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-3xl">
          Footer
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground sm:mt-3">
          Logo, columnas y enlaces del pie. Nombre, dirección, redes, alianzas y preguntas
          se editan en{' '}
          <Link href="/cms/identity" className="text-primary underline-offset-2 hover:underline">
            Identidad
          </Link>
          .
        </p>
      </header>

      <nav
        className="flex flex-wrap border-b border-border"
        aria-label="Secciones del footer"
        data-test-id="portal-footer-section-nav"
      >
        {TABS.map((tab) => {
          const isActive = tab.id === activeSection
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls={`portal-footer-panel-${tab.id}`}
              id={`portal-footer-tab-${tab.id}`}
              className={`fs-tabs__link cursor-pointer border-0 bg-transparent ${
                isActive ? 'fs-tabs__link--active' : 'fs-tabs__link--inactive'
              }`}
              onClick={() => selectSection(tab.id)}
              data-test-id={`portal-footer-tab-${tab.id}`}
            >
              {tab.label}
            </button>
          )
        })}
      </nav>

      <div
        id={`portal-footer-panel-${activeSection}`}
        role="tabpanel"
        aria-labelledby={`portal-footer-tab-${activeSection}`}
        className="min-h-[16rem] space-y-6"
        data-test-id="portal-footer-section-panel"
        data-active-section={activeSection}
      >
        {activeSection === 'marca' ? (
          <>
            <div className="space-y-3">
              <label className="block text-sm font-medium text-foreground">Logo del pie</label>
              <MultimediaUpdater
                currentUrl={logoPreview}
                currentType="image"
                onFileChange={(file) => {
                  setLogoFile(file)
                  if (file) setRemoveLogo(false)
                }}
                acceptedTypes={['image/*']}
                maxSize={9}
                aspectRatio="1:1"
                variant="banner"
                previewSize="md"
              />
              {footer.logoUrl && !removeLogo ? (
                <Button
                  type="button"
                  variant="text"
                  onClick={() => {
                    setRemoveLogo(true)
                    setLogoFile(null)
                  }}
                >
                  Quitar logo del pie
                </Button>
              ) : null}
              <p className="text-xs text-muted-foreground">
                No reemplaza el logo de la barra ni el de Identidad. Si no hay uno aquí, el pie
                usa el de Identidad.
                {identityLogo ? '' : ' Identidad todavía no tiene logo.'}
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <ToggleRow
                label="Columna de la empresa"
                description="Muestra logo y datos de empresa en el pie"
                checked={footer.showCompany}
                onChange={(checked) => patchFooter(setFooter, { showCompany: checked })}
              />
              <ToggleRow
                label="Línea de copyright"
                checked={footer.showCopyright}
                onChange={(checked) => patchFooter(setFooter, { showCopyright: checked })}
              />
              <TextField
                label="Cierre del copyright"
                alwaysShowLabel
                value={footer.copyrightSuffix}
                onChange={(e) => patchFooter(setFooter, { copyrightSuffix: e.target.value })}
              />
            </div>
            <SectionSave section="marca" label="Guardar marca" />
          </>
        ) : null}

        {activeSection === 'contacto' ? (
          <>
            <p className="text-sm text-muted-foreground">
              Los valores (dirección, teléfono, horario, correo) se definen en Identidad. Aquí
              solo controlás si se muestran y el título de la columna.
            </p>
            <div className="flex flex-col gap-3">
              <TextField
                label="Título de contacto"
                alwaysShowLabel
                value={footer.contactTitle}
                onChange={(e) => patchFooter(setFooter, { contactTitle: e.target.value })}
              />
              <ToggleRow
                label="Dirección"
                checked={footer.showAddress}
                onChange={(checked) => patchFooter(setFooter, { showAddress: checked })}
              />
              <ToggleRow
                label="Teléfono"
                checked={footer.showPhone}
                onChange={(checked) => patchFooter(setFooter, { showPhone: checked })}
              />
              <ToggleRow
                label="Horario"
                checked={footer.showHours}
                onChange={(checked) => patchFooter(setFooter, { showHours: checked })}
              />
              <ToggleRow
                label="Correo"
                checked={footer.showMail}
                onChange={(checked) => patchFooter(setFooter, { showMail: checked })}
              />
            </div>
            <SectionSave section="contacto" label="Guardar contacto" />
          </>
        ) : null}

        {activeSection === 'columnas' ? (
          <>
            <p className="text-sm text-muted-foreground">
              Redes, alianzas y preguntas se cargan desde Identidad. Acá definís título y
              visibilidad de cada bloque.
            </p>
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-3">
                <ToggleRow
                  label="Redes sociales"
                  checked={footer.showSocial}
                  onChange={(checked) => patchFooter(setFooter, { showSocial: checked })}
                />
                <TextField
                  label="Título de redes"
                  alwaysShowLabel
                  value={footer.socialTitle}
                  onChange={(e) => patchFooter(setFooter, { socialTitle: e.target.value })}
                />
              </div>
              <div className="flex flex-col gap-3">
                <ToggleRow
                  label="Alianzas"
                  checked={footer.showPartnerships}
                  onChange={(checked) =>
                    patchFooter(setFooter, { showPartnerships: checked })
                  }
                />
                <TextField
                  label="Título de alianzas"
                  alwaysShowLabel
                  value={footer.partnershipsTitle}
                  onChange={(e) =>
                    patchFooter(setFooter, { partnershipsTitle: e.target.value })
                  }
                />
              </div>
              <div className="flex flex-col gap-3">
                <ToggleRow
                  label="Preguntas frecuentes"
                  checked={footer.showFaqs}
                  onChange={(checked) => patchFooter(setFooter, { showFaqs: checked })}
                />
                <TextField
                  label="Título de preguntas"
                  alwaysShowLabel
                  value={footer.faqsTitle}
                  onChange={(e) => patchFooter(setFooter, { faqsTitle: e.target.value })}
                />
              </div>
            </div>
            <SectionSave section="columnas" label="Guardar columnas" />
          </>
        ) : null}

        {activeSection === 'menu' ? (
          <>
            <p className="text-sm text-muted-foreground">
              La ruta de cada enlace es fija. Un enlace apagado no aparece en el pie.
            </p>
            <TextField
              label="Título del menú"
              alwaysShowLabel
              value={footer.menuTitle}
              onChange={(e) => patchFooter(setFooter, { menuTitle: e.target.value })}
            />
            <div className="flex flex-col gap-4">
              {footer.menuItems.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col gap-3 rounded-lg border border-border p-4"
                >
                  <ToggleRow
                    label={item.label}
                    description={item.href}
                    checked={item.enabled}
                    onChange={(checked) =>
                      setFooter((prev) =>
                        prev
                          ? {
                              ...prev,
                              menuItems: prev.menuItems.map((row) =>
                                row.id === item.id ? { ...row, enabled: checked } : row,
                              ),
                            }
                          : prev,
                      )
                    }
                  />
                  <TextField
                    label="Etiqueta"
                    alwaysShowLabel
                    value={item.label}
                    onChange={(e) =>
                      setFooter((prev) =>
                        prev
                          ? {
                              ...prev,
                              menuItems: prev.menuItems.map((row) =>
                                row.id === item.id
                                  ? { ...row, label: e.target.value }
                                  : row,
                              ),
                            }
                          : prev,
                      )
                    }
                  />
                </div>
              ))}
            </div>
            <SectionSave section="menu" label="Guardar menú" />
          </>
        ) : null}
      </div>
    </div>
  )
}
