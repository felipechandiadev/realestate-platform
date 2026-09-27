'use client'

import React, { useCallback, useEffect, useState } from 'react'
import { Button, DotProgress, Switch, TextField } from '@realestate/ui'
import { useAlert } from '@/providers/AlertContext'
import { env } from '@/lib/env'
import MultimediaUpdater from '@/shared/components/ui/FileUploader/MultimediaUpdater'
import { getIdentity } from '@/features/cms/actions/identity.action'
import { getPortalHeader, updatePortalHeader } from '@/features/cms/actions/portal-header.action'

type NavItem = {
  id: string
  label: string
  enabled: boolean
  href?: string
  action?: 'contact'
  children?: NavItem[]
}

type AccountItem = {
  id: string
  label: string
  href: string
  enabled: boolean
}

type PortalHeader = {
  id?: string
  logoUrl?: string | null
  showCompanyName: boolean
  showMail: boolean
  showPhone: boolean
  showUf: boolean
  ufLabel: string
  showLogin: boolean
  showRegister: boolean
  loginLabel: string
  registerLabel: string
  navItems: NavItem[]
  accountItems: AccountItem[]
}

type SectionId = 'barra' | 'navbar' | 'cuenta'

const TABS: { id: SectionId; label: string }[] = [
  { id: 'barra', label: 'Barra superior' },
  { id: 'navbar', label: 'NavBar' },
  { id: 'cuenta', label: 'Menú de cuenta' },
]

function isSectionId(value: string): value is SectionId {
  return TABS.some((tab) => tab.id === value)
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

export default function PortalHeaderPage() {
  const { success, error } = useAlert()
  const [header, setHeader] = useState<PortalHeader | null>(null)
  const [identity, setIdentity] = useState<{ name?: string; mail?: string; phone?: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [savingSection, setSavingSection] = useState<SectionId | null>(null)
  const [activeSection, setActiveSection] = useState<SectionId>('barra')
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [removeLogo, setRemoveLogo] = useState(false)

  useEffect(() => {
    const syncFromHash = () => {
      const id = window.location.hash.replace(/^#/, '').trim()
      if (id && isSectionId(id)) setActiveSection(id)
    }
    syncFromHash()
    window.addEventListener('hashchange', syncFromHash)
    return () => window.removeEventListener('hashchange', syncFromHash)
  }, [])

  const selectSection = useCallback((id: SectionId) => {
    setActiveSection(id)
    const nextHash = `#${id}`
    if (window.location.hash !== nextHash) {
      window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}${nextHash}`)
    }
  }, [])

  useEffect(() => {
    async function load() {
      try {
        const [headerData, identityData] = await Promise.all([getPortalHeader(), getIdentity()])
        setHeader(headerData)
        setIdentity(identityData)
      } catch (err) {
        error(err instanceof Error ? err.message : 'Error cargando la barra superior')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [error])

  const saveSection = async (section: SectionId) => {
    if (!header) return
    setSavingSection(section)
    try {
      const formData = new FormData()
      if (section === 'barra') {
        formData.append('showCompanyName', String(header.showCompanyName))
        formData.append('showMail', String(header.showMail))
        formData.append('showPhone', String(header.showPhone))
        formData.append('showUf', String(header.showUf))
        formData.append('ufLabel', header.ufLabel)
        formData.append('showLogin', String(header.showLogin))
        formData.append('showRegister', String(header.showRegister))
        formData.append('loginLabel', header.loginLabel)
        formData.append('registerLabel', header.registerLabel)
        if (logoFile) formData.append('logo', logoFile)
        else if (removeLogo) formData.append('removeLogo', 'true')
      }
      if (section === 'navbar') formData.append('navItems', JSON.stringify(header.navItems))
      if (section === 'cuenta') formData.append('accountItems', JSON.stringify(header.accountItems))

      const result = await updatePortalHeader(formData)
      setHeader(result)
      if (section === 'barra') {
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

  const setNavEnabled = (id: string, enabled: boolean, parentId?: string) => {
    setHeader((current) => {
      if (!current) return current
      return {
        ...current,
        navItems: current.navItems.map((item) => {
          if (parentId && item.id === parentId) {
            return {
              ...item,
              children: item.children?.map((child) => (child.id === id ? { ...child, enabled } : child)),
            }
          }
          return item.id === id ? { ...item, enabled } : item
        }),
      }
    })
  }

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <DotProgress />
      </div>
    )
  }

  if (!header) {
    return <p className="p-4 text-muted-foreground">No se pudo cargar la barra superior.</p>
  }

  const SectionSave = ({ section, label }: { section: SectionId; label: string }) => (
    <div className="flex justify-end pt-4">
      <Button onClick={() => saveSection(section)} disabled={savingSection !== null} variant="primary">
        {savingSection === section ? <DotProgress className="h-4 w-4" /> : label}
      </Button>
    </div>
  )

  const logoPreview = removeLogo ? undefined : header.logoUrl ? normalizeMediaUrl(header.logoUrl) : undefined

  return (
    <div className="p-4">
      <div className="mb-6">
        <h1 className="mb-2 text-3xl font-bold text-foreground">Top Bar</h1>
        <p className="text-muted-foreground">
          Logo de la barra, visibilidad y enlaces del portal. El nombre, el correo y el teléfono se editan en Identidad.
        </p>
      </div>

      <nav className="flex flex-wrap border-b border-border" aria-label="Secciones de la barra superior">
        {TABS.map((tab) => {
          const isActive = tab.id === activeSection
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              className={`fs-tabs__link cursor-pointer border-0 bg-transparent ${
                isActive ? 'fs-tabs__link--active' : 'fs-tabs__link--inactive'
              }`}
              onClick={() => selectSection(tab.id)}
            >
              {tab.label}
            </button>
          )
        })}
      </nav>

      <div role="tabpanel" className="min-h-[16rem] pt-6">
        {activeSection === 'barra' && (
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="mb-4 text-xl font-semibold">Barra superior</h2>
            <div className="mb-6">
              <label className="mb-2 block text-sm font-medium">Logo de la barra</label>
              <MultimediaUpdater
                currentUrl={logoPreview}
                currentType="image"
                onFileChange={(file) => {
                  setLogoFile(file)
                  if (file) setRemoveLogo(false)
                }}
                acceptedTypes={['image/*']}
                maxSize={9}
                aspectRatio="16:9"
                variant="banner"
                previewSize="md"
              />
              {header.logoUrl && !removeLogo ? (
                <Button
                  type="button"
                  variant="text"
                  className="mt-2"
                  onClick={() => {
                    setRemoveLogo(true)
                    setLogoFile(null)
                  }}
                >
                  Quitar logo de la barra
                </Button>
              ) : null}
              <p className="mt-2 text-xs text-muted-foreground">
                Este logo no reemplaza el de Identidad. Si no hay uno aquí, la barra muestra solo el nombre.
              </p>
            </div>
            <div className="space-y-3">
              <ToggleRow
                label="Nombre de la empresa"
                description={identity?.name || 'Sin nombre en Identidad'}
                checked={header.showCompanyName}
                onChange={(checked) => setHeader({ ...header, showCompanyName: checked })}
              />
              <ToggleRow
                label="Correo"
                description={identity?.mail || 'Sin correo en Identidad'}
                checked={header.showMail}
                onChange={(checked) => setHeader({ ...header, showMail: checked })}
              />
              <ToggleRow
                label="Teléfono"
                description={identity?.phone || 'Sin teléfono en Identidad'}
                checked={header.showPhone}
                onChange={(checked) => setHeader({ ...header, showPhone: checked })}
              />
              <ToggleRow
                label="Indicador de UF"
                description="El valor del día se calcula solo"
                checked={header.showUf}
                onChange={(checked) => setHeader({ ...header, showUf: checked })}
              />
              <TextField
                label="Etiqueta de la UF"
                value={header.ufLabel}
                onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
                  setHeader({ ...header, ufLabel: e.target.value })
                }
              />
              <ToggleRow
                label="Ingresar"
                checked={header.showLogin}
                onChange={(checked) => setHeader({ ...header, showLogin: checked })}
              />
              <TextField
                label="Texto de Ingresar"
                value={header.loginLabel}
                onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
                  setHeader({ ...header, loginLabel: e.target.value })
                }
              />
              <ToggleRow
                label="Registrarse"
                checked={header.showRegister}
                onChange={(checked) => setHeader({ ...header, showRegister: checked })}
              />
              <TextField
                label="Texto de Registrarse"
                value={header.registerLabel}
                onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
                  setHeader({ ...header, registerLabel: e.target.value })
                }
              />
            </div>
            <SectionSave section="barra" label="Guardar barra superior" />
          </div>
        )}

        {activeSection === 'navbar' && (
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="mb-4 text-xl font-semibold">NavBar</h2>
            <p className="mb-4 text-sm text-muted-foreground">
              Un enlace apagado desaparece de la barra y del menú lateral. La página sigue disponible por su dirección.
            </p>
            <div className="space-y-3">
              {header.navItems.map((item) => (
                <div key={item.id} className="space-y-2">
                  <ToggleRow
                    label={item.label}
                    checked={item.enabled}
                    onChange={(checked) => setNavEnabled(item.id, checked)}
                  />
                  {item.children?.length ? (
                    <div className="ml-6 space-y-2">
                      {item.children.map((child) => (
                        <ToggleRow
                          key={child.id}
                          label={child.label}
                          checked={child.enabled}
                          onChange={(checked) => setNavEnabled(child.id, checked, item.id)}
                        />
                      ))}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
            <SectionSave section="navbar" label="Guardar NavBar" />
          </div>
        )}

        {activeSection === 'cuenta' && (
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="mb-4 text-xl font-semibold">Menú de cuenta</h2>
            <p className="mb-4 text-sm text-muted-foreground">
              Se muestran en el menú lateral cuando hay una sesión. Cerrar sesión permanece siempre.
            </p>
            <div className="space-y-3">
              {header.accountItems.map((item) => (
                <ToggleRow
                  key={item.id}
                  label={item.label}
                  checked={item.enabled}
                  onChange={(checked) =>
                    setHeader({
                      ...header,
                      accountItems: header.accountItems.map((row) =>
                        row.id === item.id ? { ...row, enabled: checked } : row,
                      ),
                    })
                  }
                />
              ))}
            </div>
            <SectionSave section="cuenta" label="Guardar menú de cuenta" />
          </div>
        )}
      </div>
    </div>
  )
}
