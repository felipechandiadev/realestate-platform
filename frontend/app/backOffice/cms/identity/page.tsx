/**
 * CMS Corporate Identity / Branding Page
 * 
 * Propósito:
 * - Gestionar identidad corporativa (nombre, logo, colores)
 * - Administrar redes sociales (Instagram, Facebook, LinkedIn, YouTube)
 * - Configurar información de contacto público
 * - Actualizar descripción de empresa
 * - Cargar y gestionar multimedia corporativa
 * 
 * Funcionalidad:
 * - Client component: formularios interactivos
 * - Carga/actualiza datos de identidad corporativa
 * - Social media links management
 * - Upload de logo e imágenes corporativas
 * - Validación y notificación de cambios
 * 
 * Audiencia: Administradores, Gerentes corporativos, Diseñadores
 */

'use client'

import React, { useEffect, useState } from 'react'
import { getIdentity, createIdentity, updateIdentity } from '@/features/backoffice/cms/actions/identity.action'
import { env } from '@/lib/env'
import { TextField } from '@/shared/components/ui/TextField/TextField'
import { Button } from '@/shared/components/ui/Button/Button'
import DotProgress from '@/shared/components/ui/DotProgress/DotProgress'
import Switch from '@/shared/components/ui/Switch/Switch'
import IconButton from '@/shared/components/ui/IconButton/IconButton'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInstagram, faFacebook, faLinkedin, faYoutube } from "@fortawesome/free-brands-svg-icons";
import MultimediaUpdater from '@/shared/components/ui/FileUploader/MultimediaUpdater'
import { useAlert } from '@/providers/AlertContext'

interface SocialMediaItem {
  url?: string
  available?: boolean
}

interface SocialMedia {
  instagram?: SocialMediaItem
  facebook?: SocialMediaItem
  linkedin?: SocialMediaItem
  youtube?: SocialMediaItem
}

interface Partnership {
  name: string
  description: string
  logoUrl?: string
}

interface FAQItem {
  question: string
  answer: string
}

interface Identity {
  id?: string
  name: string
  address: string
  phone: string
  mail: string
  businessHours: string
  urlLogo?: string
  socialMedia?: SocialMedia
  partnerships?: Partnership[]
  faqs?: FAQItem[]
}

/**
 * Normaliza URLs de multimedia a rutas absolutas
 */
function normalizeMediaUrl(url?: string | null): string | undefined {
  if (!url) return undefined;

  const cleaned = url.replace('/../', '/');

  try {
    new URL(cleaned);
    return cleaned;
  } catch {
    // No es URL absoluta
  }

  if (cleaned.startsWith('/')) {
    return `${env.backendApiUrl}${cleaned}`;
  }

  return `${env.backendApiUrl}/${cleaned}`;
}

export default function IdentityPage() {
  const socialIcons = {
    instagram: faInstagram,
    facebook: faFacebook,
    linkedin: faLinkedin,
    youtube: faYoutube,
  }
  const { success, error } = useAlert()
  const [identity, setIdentity] = useState<Identity>({
    name: '',
    address: '',
    phone: '',
    mail: '',
    businessHours: '',
    socialMedia: {},
    partnerships: [],
    faqs: []
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [newLogoFile, setNewLogoFile] = useState<File | null>(null)
  const [newPartnershipLogoFiles, setNewPartnershipLogoFiles] = useState<(File | null)[]>([])

  useEffect(() => {
    async function loadIdentity() {
      try {
        const data = await getIdentity()
        if (data) {
          setIdentity(data)
          // Inicializar array de partnership logo files
          const partnershipCount = data.partnerships?.length || 0
          setNewPartnershipLogoFiles(new Array(partnershipCount).fill(null))
        }
      } catch (err) {
        error('Error cargando identidad')
      } finally {
        setLoading(false)
      }
    }
    loadIdentity()
  }, [])

  const handleLogoChange = (file: File | null) => {
    setNewLogoFile(file)
  }

  const handlePartnershipLogoChange = (index: number, file: File | null) => {
    setNewPartnershipLogoFiles(prev => {
      const newState = [...prev]
      newState[index] = file
      return newState
    })
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const formData = new FormData()

      // Add identity data
      formData.append('name', identity.name)
      formData.append('address', identity.address)
      formData.append('phone', identity.phone)
      formData.append('mail', identity.mail)
      formData.append('businessHours', identity.businessHours)

      formData.append('socialMedia', JSON.stringify(identity.socialMedia || {}))
      formData.append('partnerships', JSON.stringify(identity.partnerships || []))
      formData.append('faqs', JSON.stringify(identity.faqs || []))

      // Add logo file si hay uno nuevo
      if (newLogoFile) {
        formData.append('logo', newLogoFile)
      }

      // Add partnership logo files que han cambiado
      const changedPartnershipLogos: File[] = []
      const partnershipLogoIndexes: number[] = []
      
      newPartnershipLogoFiles.forEach((file, index) => {
        if (file) {
          changedPartnershipLogos.push(file)
          partnershipLogoIndexes.push(index)
        }
      })

      if (changedPartnershipLogos.length > 0) {
        changedPartnershipLogos.forEach(file => {
          formData.append('partnershipLogos', file)
        })
        formData.append('partnershipLogoIndexes', JSON.stringify(partnershipLogoIndexes))
      }

      // Create or update based on whether identity exists
      let result
      if (identity.id) {
        result = await updateIdentity(identity.id, formData)
        success('Identidad actualizada exitosamente')
      } else {
        result = await createIdentity(formData)
        success('Identidad creada exitosamente')
      }

      // Update local state with server response to ensure ID is set
      if (result) {
        setIdentity(result)
        setNewLogoFile(null)
        setNewPartnershipLogoFiles(new Array(result.partnerships?.length || 0).fill(null))
      }
    } catch (err) {
      error('Error guardando identidad')
    } finally {
      setSaving(false)
    }
  }

  const updateSocialMedia = (platform: keyof SocialMedia, field: keyof SocialMediaItem, value: any) => {
    setIdentity(prev => ({
      ...prev,
      socialMedia: {
        ...prev.socialMedia,
        [platform]: {
          ...prev.socialMedia?.[platform],
          [field]: value
        }
      }
    }))
  }

  const addPartnership = () => {
    setIdentity(prev => ({
      ...prev,
      partnerships: [...(prev.partnerships || []), { name: '', description: '' }]
    }))
    // Agregar espacio para el nuevo archivo
    setNewPartnershipLogoFiles(prev => [...prev, null])
  }

  const updatePartnership = (index: number, field: keyof Partnership, value: string) => {
    setIdentity(prev => ({
      ...prev,
      partnerships: prev.partnerships?.map((p, i) => i === index ? { ...p, [field]: value } : p)
    }))
  }

  const removePartnership = (index: number) => {
    setIdentity(prev => ({
      ...prev,
      partnerships: prev.partnerships?.filter((_, i) => i !== index)
    }))
    // Eliminar también del estado de archivos
    setNewPartnershipLogoFiles(prev => prev.filter((_, i) => i !== index))
  }

  const addFAQ = () => {
    setIdentity(prev => ({
      ...prev,
      faqs: [...(prev.faqs || []), { question: '', answer: '' }]
    }))
  }

  const updateFAQ = (index: number, field: keyof FAQItem, value: string) => {
    setIdentity(prev => ({
      ...prev,
      faqs: prev.faqs?.map((faq, i) => i === index ? { ...faq, [field]: value } : faq)
    }))
  }

  const removeFAQ = (index: number) => {
    setIdentity(prev => ({
      ...prev,
      faqs: prev.faqs?.filter((_, i) => i !== index)
    }))
  }

  if (loading) return (
    <div className="flex justify-center items-center min-h-[400px]">
      <DotProgress />
    </div>
  )

  return (
    <div className="p-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Identidad de la Empresa</h1>
        <p className="text-muted-foreground">Gestiona la información básica y redes sociales de tu empresa</p>
      </div>

      <div className="space-y-8">
        {/* Información Básica */}
        <div className="bg-card rounded-lg p-6 border border-border">
          <h2 className="text-xl font-semibold mb-4">Información Básica</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <TextField
              label="Nombre de la Empresa"
              value={identity.name}
              onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setIdentity({ ...identity, name: e.target.value })}
              required
            />
            <TextField
              label="Dirección"
              value={identity.address}
              onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setIdentity({ ...identity, address: e.target.value })}
              required
            />
            <TextField
              label="Teléfono"
              value={identity.phone}
              onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setIdentity({ ...identity, phone: e.target.value })}
              required
            />
            <TextField
              label="Correo Electrónico"
              type="email"
              value={identity.mail}
              onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setIdentity({ ...identity, mail: e.target.value })}
              required
            />
            <div className="md:col-span-2">
              <TextField
                label="Horarios de Atención"
                value={identity.businessHours}
                onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setIdentity({ ...identity, businessHours: e.target.value })}
                type="textarea"
                rows={3}
                required
              />
            </div>
            <div className="md:col-span-2">
              <div>
                <label className="block text-sm font-medium mb-2">Logo de la Empresa</label>
                
                {/* Updater - Banner variant for company logo */}
                <MultimediaUpdater
                  currentUrl={identity.urlLogo ? normalizeMediaUrl(identity.urlLogo) : undefined}
                  currentType="image"
                  onFileChange={handleLogoChange}
                  acceptedTypes={['image/*']}
                  maxSize={9}
                  aspectRatio="16:9"
                  variant="banner"
                  previewSize="md"
                />
                
              </div>
            </div>
          </div>
        </div>

        {/* Redes Sociales */}
        <div className="bg-card rounded-lg p-6 border border-border">
          <h2 className="text-xl font-semibold mb-4">Redes Sociales</h2>
          <div className="space-y-4">
            {([
              { key: 'instagram', label: 'Instagram' },
              { key: 'facebook', label: 'Facebook' },
              { key: 'linkedin', label: 'LinkedIn' },
              { key: 'youtube', label: 'YouTube' }
            ] as const).map(({ key, label }) => (
              <div key={key} className="w-full mb-3">
                <div className="rounded-lg p-4">
                  <div className="flex items-center gap-4">
                    {/* Ícono y nombre de la red social */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center">
                        <FontAwesomeIcon icon={socialIcons[key]} className="text-sm" />
                      </div>
                      <span className="text-sm font-medium">{label}</span>
                    </div>

                    {/* Switch y campo URL */}
                    <div className="flex items-center gap-3 flex-1">
                      <Switch
                        checked={identity.socialMedia?.[key]?.available || false}
                        onChange={(checked) => updateSocialMedia(key, 'available', checked)}
                        label=""
                      />
                      <TextField
                        label="URL"
                        value={identity.socialMedia?.[key]?.url || ''}
                        onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => updateSocialMedia(key, 'url', e.target.value)}
                        placeholder={`https://${key}.com/...`}
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Alianzas/Partners */}
        <div className="bg-card rounded-lg p-6 border border-border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Alianzas y Partners</h2>
            <IconButton
              icon="add"
              variant="containedSecondary"
              onClick={addPartnership}
              ariaLabel="Agregar Alianza"
            />
          </div>
          <div className="space-y-4">
            {identity.partnerships?.map((partnership, index) => (
              <div key={index} className="rounded-lg py-4 px-0 bg-background">
                <div className="flex items-start justify-between mb-4 px-4">
                  <h3 className="text-lg font-medium">Alianza {index + 1}</h3>
                  <IconButton
                    icon="delete"
                    variant="text"
                    onClick={() => removePartnership(index)}
                    className="text-red-500"
                  />
                </div>
                <div className="space-y-4 px-4">
                  {/* Nombre ocupa todo el ancho */}
                  <TextField
                    label="Nombre"
                    value={partnership.name}
                    onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => updatePartnership(index, 'name', e.target.value)}
                    required
                  />
                  
                  {/* Imagen de la alianza - Banner variant */}
                  <div className="px-0">
                    <label className="block text-sm font-medium mb-2">Imagen</label>
                    
                    {/* Updater - Banner variant for partnership logo */}
                    <MultimediaUpdater
                      currentUrl={partnership.logoUrl ? normalizeMediaUrl(partnership.logoUrl) : undefined}
                      currentType="image"
                      onFileChange={(file) => handlePartnershipLogoChange(index, file)}
                      acceptedTypes={['image/*']}
                      maxSize={9}
                      aspectRatio="16:9"
                      variant="banner"
                      previewSize="md"
                    />
                  </div>
                  
                  {/* Descripción al final */}
                  <TextField
                    label="Descripción"
                    value={partnership.description}
                    onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => updatePartnership(index, 'description', e.target.value)}
                    type="textarea"
                    rows={3}
                    required
                  />
                </div>
              </div>
            ))}
            {(!identity.partnerships || identity.partnerships.length === 0) && (
              <div className="text-center py-8 text-muted-foreground">
                No hay alianzas registradas. Haz clic en "Agregar Alianza" para comenzar.
              </div>
            )}
          </div>
        </div>

        {/* Preguntas Frecuentes (FAQs) */}
        <div className="bg-card rounded-lg p-6 border border-border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Preguntas Frecuentes</h2>
            <IconButton
              icon="add"
              variant="containedSecondary"
              onClick={addFAQ}
              ariaLabel="Agregar Pregunta Frecuente"
            />
          </div>
          <div className="space-y-4">
            {identity.faqs?.map((faq, index) => (
              <div key={index} className="rounded-lg p-4">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-lg font-medium">Pregunta {index + 1}</h3>
                  <IconButton
                    icon="delete"
                    variant="text"
                    onClick={() => removeFAQ(index)}
                    className="text-red-500"
                  />
                </div>
                <div className="space-y-4">
                  <TextField
                    label="Pregunta"
                    value={faq.question}
                    onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => updateFAQ(index, 'question', e.target.value)}
                    type="textarea"
                    rows={2}
                    required
                  />
                  <TextField
                    label="Respuesta"
                    value={faq.answer}
                    onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => updateFAQ(index, 'answer', e.target.value)}
                    type="textarea"
                    rows={4}
                    required
                  />
                </div>
              </div>
            ))}
            {(!identity.faqs || identity.faqs.length === 0) && (
              <div className="text-center py-8 text-muted-foreground">
                No hay preguntas frecuentes registradas. Haz clic en "Agregar Pregunta Frecuente" para comenzar.
              </div>
            )}
          </div>
        </div>

        {/* Botón Guardar */}
        <div className="flex justify-end">
          <Button
            onClick={handleSave}
            disabled={saving}
            variant="primary"
            size="lg"
          >
            {saving ? (
              <DotProgress className="w-4 h-4" />
            ) : (
              'Guardar'
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
