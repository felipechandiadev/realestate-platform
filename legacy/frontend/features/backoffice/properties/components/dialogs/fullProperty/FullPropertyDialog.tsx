'use client'

import React, { ReactNode, useState, useEffect } from 'react'
import Dialog from '@/shared/components/ui/Dialog/Dialog'
import BasicInfoSection from './BasicInfoSection'
import CharacteristicsSection from './CharacteristicsSection'
import LocationSection from './LocationSection'
import MultimediaSection from './multimedia/MultimediaSection'
import HistorySection from './HistorySection'
import SEOSection from './SEOSection'
import InternalNotesSection from './InternalNotesSection'
import { getPropertyHeaderInfo } from '@/features/backoffice/properties/actions/properties.action'
import { getStatusInSpanish, getStatusChipClasses } from '@/features/backoffice/properties/utils'

export interface FullPropertyDialogProps {
  open: boolean
  onClose: () => void
  propertyTitle?: string
  propertyStatus?: string
  propertyId?: string
  sidebar?: ReactNode
  children?: ReactNode
  propertyInfo?: {
    code?: string
    price?: number
    currency?: string
    operationType?: string
    propertyType?: string
    bedrooms?: number
    bathrooms?: number
    parkingSpaces?: number
    floors?: number
    builtSquareMeters?: number
    landSquareMeters?: number
    address?: string
    city?: string
    state?: string
    multimediaCount?: number
    mainImageUrl?: string
    seoTitle?: string
    seoDescription?: string
    publicationDate?: string
    isFeatured?: boolean
    viewsCount?: number
    leadsCount?: number
    favoritesCount?: number
    assignedAgent?: string
    internalNotes?: string
    changeHistory?: Array<{
      date?: string
      actor?: string
      summary?: string
    }>
  }
}

export default function FullPropertyDialog({
  open,
  onClose,
  propertyTitle,
  propertyStatus,
  propertyId,
  sidebar,
  propertyInfo,
  children,
}: FullPropertyDialogProps) {
  const [headerData, setHeaderData] = useState<any>(null)
  const [loadingHeader, setLoadingHeader] = useState(true)
  const [activeSection, setActiveSection] = useState<string>('Información básica')

  const loadHeaderData = async () => {
    if (propertyId) {
      try {
        setLoadingHeader(true)
        const response = await getPropertyHeaderInfo(propertyId)
        if (response.success && response.data) {
          setHeaderData(response.data)
        } else {
          console.error('Failed to load header:', response.error)
        }
      } catch (error) {
        console.error('Error loading property header:', error)
      } finally {
        setLoadingHeader(false)
      }
    }
  }

  // Load header data when dialog opens
  useEffect(() => {
    if (open && propertyId) {
      loadHeaderData()
    } else {
      setLoadingHeader(false)
    }
  }, [open, propertyId])

  // Use header data if available, fallback to props
  const displayTitle = headerData?.title || propertyTitle || 'Sin título de propiedad'
  const displayStatus = headerData?.status || propertyStatus
  const displayCode = headerData?.code || propertyInfo?.code
  const formatCurrency = (value?: number, currency?: string) => {
    if (value == null) return '—'
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: currency || 'CLP',
      maximumFractionDigits: 0,
    }).format(value)
  }

  const safeValue = (value?: string | number | boolean | null) => {
    if (value === null || value === undefined) return '—'
    if (typeof value === 'boolean') return value ? 'Sí' : 'No'
    return value
  }

  const sidebarSections = [
    { title: 'Información básica', icon: 'info' },
    { title: 'Características', icon: 'home' },
    { title: 'Localización', icon: 'location_on' },
    { title: 'Multimedia', icon: 'image' },
    { title: 'SEO y marketing', icon: 'trending_up' },
    { title: 'Nota interna', icon: 'note' },
    { title: 'Historial', icon: 'history' },
  ]

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Detalles de la Propiedad"
      size="xl"
      showCloseButton={true}
    >
      <div>
        <header className="w-full px-6 py-5 border-b">
          <div className="flex flex-col gap-3">
            {/* Title */}
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Propiedad</p>
              {loadingHeader ? (
                <div className="flex items-center gap-2">
                  <div className="flex justify-center"><span className="material-symbols-outlined animate-spin">progress_activity</span></div>
                  <span className="text-sm text-muted-foreground">Cargando...</span>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <h3 className="text-xl font-semibold text-foreground">{displayTitle}</h3>
                  {headerData?.isFeatured ? (
                    <span className="text-sm px-2 py-1 rounded bg-green-100 text-green-800">
                      Destacada
                    </span>
                  ) : null}
                </div>
              )}
            </div>
            
            {/* ID and Status */}
            <div className="flex items-center gap-4 flex-wrap">
              {displayCode && (
                <p className="text-xs font-mono text-muted-foreground">Código: {displayCode}</p>
              )}
              {propertyId && (
                <p className="text-xs font-mono text-muted-foreground">ID: {propertyId}</p>
              )}
              {displayStatus && (
                <span className={`rounded-lg px-4 py-2 text-sm font-medium ${getStatusChipClasses(displayStatus)}`}>
                  {getStatusInSpanish(displayStatus)}
                </span>
              )}
            </div>
          </div>
        </header>

        <section className="grid gap-6 py-6 grid-cols-[auto_1fr]">
          <aside className="flex min-h-[200px] flex-col gap-4 py-4">
            {sidebar ?? (
              <nav className="space-y-2">
                {sidebarSections.map((section) => (
                  <button
                    key={section.title}
                    onClick={() => setActiveSection(section.title)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold uppercase tracking-wide transition-colors flex items-center gap-3 ${
                      activeSection === section.title
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:bg-muted/50'
                    }`}
                    title={section.title}
                  >
                    <span className="material-symbols-outlined text-base flex-shrink-0">{section.icon}</span>
                    <span className="hidden sm:inline">{section.title}</span>
                  </button>
                ))}
              </nav>
            )}
          </aside>

          <div>
            {children ?? (
              <div>
                {propertyId && activeSection === 'Información básica' && (
                  <BasicInfoSection propertyId={propertyId} onUpdateSuccess={loadHeaderData} />
                )}
                {propertyId && activeSection === 'Características' && (
                  <CharacteristicsSection propertyId={propertyId} />
                )}
                {propertyId && activeSection === 'Localización' && (
                  <LocationSection propertyId={propertyId} />
                )}
                {propertyId && activeSection === 'Multimedia' && (
                  <MultimediaSection propertyId={propertyId} />
                )}
                {propertyId && activeSection === 'SEO y marketing' && (
                  <SEOSection propertyId={propertyId} propertyTitle={displayTitle} onUpdateSuccess={loadHeaderData} />
                )}
                {propertyId && activeSection === 'Nota interna' && (
                  <InternalNotesSection propertyId={propertyId} />
                )}
                {propertyId && activeSection === 'Historial' && (
                  <HistorySection propertyId={propertyId} />
                )}
              </div>
            )}
          </div>
        </section>
      </div>
    </Dialog>
  )
}
