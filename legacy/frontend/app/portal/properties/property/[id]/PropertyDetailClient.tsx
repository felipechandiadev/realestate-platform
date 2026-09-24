'use client';

import React, { useState, useEffect } from 'react';
import { Bed, Bath, Home, Maximize2, ParkingSquare, Heart, Plus } from 'lucide-react';
import { getPublishedPropertyPublic, notifyPropertyInterest, getRelatedProperties, Property } from './actions';
import { Button } from '@/shared/components/ui/Button/Button';
import { TextField } from '@/shared/components/ui/TextField/TextField';
import Dialog from '@/shared/components/ui/Dialog/Dialog';
import { useAlert } from '@/shared/hooks/useAlert';
import FontAwesome from '@/shared/components/ui/FontAwesome/FontAwesome';
import { env } from '@/lib/env';
import { togglePropertyFavorite } from '@/features/backoffice/properties/actions/properties.action';
import PropertyMapWrapper from './PropertyMapWrapper';
import MultimediaGrid from './MultimediaGrid';
import RelatedPropertyCard from '@/app/portal/ui/RelatedPropertyCard';
import { useCookieConsent } from '@/providers/CookieConsentContext';

interface PropertyDetailClientProps {
  property: Property;
}

// Helper function to normalize image URLs (same as PropertyCard)
function normalizeImageUrl(url?: string | null): string | undefined {
  if (!url) return undefined;

  // Clean up paths with ../
  const cleaned = url.replace('/../', '/');

  // If already absolute URL, return as is
  try {
    new URL(cleaned);
    return cleaned;
  } catch {
    // Not an absolute URL, continue
  }

  // If relative, prepend backend URL
  if (cleaned.startsWith('/')) {
    return `${env.backendApiUrl}${cleaned}`;
  }

  // Return cleaned version
  return cleaned;
}

// Helper function to count words
function countWords(text: string): number {
  return text.trim().split(/\s+/).length;
}

// Helper function to get preview text (first 200 words)
function getPreviewText(text: string): string {
  const words = text.trim().split(/\s+/);
  if (words.length <= 200) return text;
  return words.slice(0, 200).join(' ') + '...';
}

interface PropertyDetailClientProps {
  property: Property;
}

export default function PropertyDetailClient({
  property,
}: PropertyDetailClientProps) {
  const { showAlert } = useAlert();
  const { hasConsented: cookiesAccepted } = useCookieConsent();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDescriptionDialog, setShowDescriptionDialog] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });
  const [favoritesCount, setFavoritesCount] = useState(property.favoritesCount || 0);
  const [isFavorited, setIsFavorited] = useState(false);
  const [isLoadingFav, setIsLoadingFav] = useState(false);
  const [relatedProperties, setRelatedProperties] = useState<Property[]>([]);
  const [isLoadingRelated, setIsLoadingRelated] = useState(true);

  // Check if user has favorited this property
  useEffect(() => {
    try {
      const favCookie = document.cookie
        .split('; ')
        .find((row) => row.startsWith('favorites='));
      
      if (favCookie) {
        const favoritesStr = decodeURIComponent(favCookie.split('=')[1]);
        let favorites: string[] = [];
        if (favoritesStr && favoritesStr.trim() !== '') {
          favorites = JSON.parse(favoritesStr);
        }
        setIsFavorited(Array.isArray(favorites) && favorites.includes(property.id));
      }
    } catch (error) {
      console.error('Error reading favorites from cookie:', error);
    }
  }, [property.id]);

  // Load related properties
  useEffect(() => {
    const loadRelatedProperties = async () => {
      try {
        setIsLoadingRelated(true);
        const result = await getRelatedProperties(property.id, 3);
        
        if (result.success && result.data) {
          setRelatedProperties(result.data);
        }
      } catch (error) {
        console.error('Error loading related properties:', error);
      } finally {
        setIsLoadingRelated(false);
      }
    };

    loadRelatedProperties();
  }, [property.id]);

  const mainImage = property.multimedia?.[0];

  const agentName =
    property.assignedAgent?.personalInfo?.firstName && property.assignedAgent?.personalInfo?.lastName
      ? `${property.assignedAgent.personalInfo.firstName} ${property.assignedAgent.personalInfo.lastName}`
      : property.assignedAgent?.personalInfo?.firstName ||
        'Agente Inmobiliario';

  let priceFormatted = '';
  if (property.currencyPrice === 'UF') {
    priceFormatted = `${new Intl.NumberFormat('es-CL', { minimumFractionDigits: 0 }).format(property.price)} UF`;
  } else if (property.currencyPrice === 'CLP') {
    priceFormatted = new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
    }).format(property.price);
  } else {
    priceFormatted = `${property.price}`;
  }

  const locationText = property.state && property.city
    ? `${property.city}, ${property.state}`
    : property.address
    ? property.address
    : 'Ubicación no especificada';

  // Normalize image URLs
  const mainImageUrl = mainImage ? normalizeImageUrl(mainImage.url) : undefined;
  
  // Normalize all multimedia URLs except the first one (which is mainImageUrl)
  const normalizedMultimedia = property.multimedia?.slice(1).map((m) => ({
    ...m,
    url: normalizeImageUrl(m.url) || m.url,
  })) || [];

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleToggleFavorite = async () => {
    if (isLoadingFav) return;
    setIsLoadingFav(true);

    try {
      const result = await togglePropertyFavorite(property.id);

      if (!result.success) {
        showAlert({
          message: result.error || 'Error al agregar/remover favorito',
          type: 'error',
          duration: 3000,
        });
        setIsLoadingFav(false);
        return;
      }

      // Update cookie
      try {
        const favCookie = document.cookie
          .split('; ')
          .find((row) => row.startsWith('favorites='));
        
        let favorites: string[] = [];
        if (favCookie) {
          const favoritesStr = decodeURIComponent(favCookie.split('=')[1]);
          if (favoritesStr && favoritesStr.trim() !== '') {
            favorites = JSON.parse(favoritesStr);
          }
        }

        // Toggle: if already favorited, remove it; otherwise add it
        const isFavBefore = favorites.includes(property.id);
        const newFavorites = isFavBefore
          ? favorites.filter((id) => id !== property.id)
          : [...favorites, property.id];

        // Save to cookie
        const expires = new Date();
        expires.setTime(expires.getTime() + 365 * 24 * 60 * 60 * 1000);
        document.cookie = `favorites=${encodeURIComponent(JSON.stringify(newFavorites))}; expires=${expires.toUTCString()}; path=/`;

        // Update UI
        const isFavNow = newFavorites.includes(property.id);
        setIsFavorited(isFavNow);
        setFavoritesCount(prev => isFavNow ? prev + 1 : Math.max(prev - 1, 0));

        showAlert({
          message: isFavNow
            ? 'Agregado a favoritos'
            : 'Removido de favoritos',
          type: 'success',
          duration: 2000,
        });
      } catch (error) {
        console.error('Error updating favorites cookie:', error);
        showAlert({
          message: 'Error al actualizar favorito',
          type: 'error',
          duration: 2000,
        });
      }
    } finally {
      setIsLoadingFav(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.phone || !formData.message) {
      showAlert({
        message: 'Por favor completa todos los campos',
        type: 'warning',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Enviar notificación de interés en propiedad
      const result = await notifyPropertyInterest({
        propertyId: property.id,
        assignedAgentId: property.assignedAgent?.id,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        message: formData.message,
      });

      if (!result.success) {
        showAlert({
          message: result.error || 'No se pudo notificar el interés',
          type: 'error',
          duration: 3000,
        });
        return;
      }

      showAlert({
        message: 'Mensaje enviado correctamente. El agente se pondrá en contacto pronto.',
        type: 'success',
        duration: 3000,
      });

      setFormData({ name: '', email: '', phone: '', message: '' });
    } catch (error) {
      showAlert({
        message: 'Error al enviar el mensaje. Intenta nuevamente.',
        type: 'error',
        duration: 3000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-background">
      {/* Header Section - Centered Info */}
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <div className="flex flex-col items-center justify-center mb-8 text-center">
          {/* Title */}
          <h1 className="text-4xl font-bold text-foreground mb-4">
            {property.title}
          </h1>

          {/* Property Type */}
          <div className="mb-2">
            <span className="text-sm font-light text-muted-foreground">
              {property.propertyType?.name || 'Propiedad'} en{' '}
              {property.operationType === 'RENT' ? 'Arriendo' : 'Venta'}
            </span>
          </div>

          {/* Price */}
          <div className="mb-2">
            <span className="text-2xl font-bold text-foreground">
              {priceFormatted}
            </span>
          </div>

          {/* Location */}
          <div className="flex items-center justify-center space-x-2 mb-3">
            <FontAwesome icon="location-dot" className="text-muted-foreground" />
            <span className="text-sm font-light text-muted-foreground">
              {locationText}
            </span>
          </div>
        </div>

        {/* Main Content - Two Column Layout */}
        <div className="flex flex-col lg:flex-row gap-8 mb-8">
          {/* Left Column - Images, Details and Map */}
          <div className="w-full lg:w-3/4 rounded-lg p-6">
            {/* Gallery Section */}
            <div className="mb-6">
              <MultimediaGrid
                mainImageUrl={mainImageUrl}
                multimedia={normalizedMultimedia}
                propertyTitle={property.title}
              />
            </div>

            {/* Key Characteristics */}
            {(property.bedrooms !== undefined || property.bathrooms !== undefined || 
              property.builtSquareMeters !== undefined || property.landSquareMeters !== undefined || 
              property.parkingSpaces !== undefined) && (
              <div className="mb-6 border-t pt-4">
                <div className="flex flex-row items-center gap-4 min-h-[40px] py-1">
                  {/* Características */}
                  {property.bedrooms != null && property.bedrooms > 0 && (
                    <div className="flex items-center space-x-1">
                      <Bed size={20} className="text-primary" />
                      <span className="text-xs text-foreground">
                        {property.bedrooms}
                      </span>
                    </div>
                  )}
                  {property.bathrooms != null && property.bathrooms > 0 && (
                    <div className="flex items-center space-x-1">
                      <Bath size={20} className="text-primary" />
                      <span className="text-xs text-foreground">
                        {property.bathrooms}
                      </span>
                    </div>
                  )}
                  {property.builtSquareMeters != null && property.builtSquareMeters > 0 && (
                    <div className="flex items-center space-x-1">
                      <Home size={20} className="text-primary" />
                      <span className="text-xs text-foreground">
                        {Math.round(property.builtSquareMeters)}
                      </span>
                    </div>
                  )}
                  {property.landSquareMeters != null && property.landSquareMeters > 0 && (
                    <div className="flex items-center space-x-1">
                      <Maximize2 size={20} className="text-primary" />
                      <span className="text-xs text-foreground">
                        {property.landSquareMeters}
                      </span>
                    </div>
                  )}
                  {property.parkingSpaces != null && property.parkingSpaces > 0 && (
                    <div className="flex items-center space-x-1">
                      <ParkingSquare size={20} className="text-primary" />
                      <span className="text-xs text-foreground">
                        {property.parkingSpaces}
                      </span>
                    </div>
                  )}
                  {/* Botón de favorito alineado vertical y derecha - solo si cookies aceptadas */}
                  {cookiesAccepted && (
                    <div className="flex-1 flex justify-end items-center">
                      <button
                        onClick={handleToggleFavorite}
                        disabled={isLoadingFav}
                        className="flex items-center justify-center p-1 rounded-full transition-all duration-200 hover:scale-110 disabled:opacity-50"
                        title={isFavorited ? 'Remover de favoritos' : 'Agregar a favoritos'}
                      >
                        <Heart
                          size={22}
                          fill={isFavorited ? 'currentColor' : 'none'}
                          className={`transition-all ${
                            isFavorited
                              ? 'text-red-500'
                              : 'text-gray-400 hover:text-red-500'
                          }`}
                        />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Description */}
            {property.description && (
              <div className="mb-6 border-t pt-4">
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  Descripción
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed text-justify">
                  {countWords(property.description) > 200 
                    ? getPreviewText(property.description) 
                    : property.description}
                </p>
                {countWords(property.description) > 200 && (
                  <div className="mt-4">
                    <Button
                      variant="outlined"
                      onClick={() => setShowDescriptionDialog(true)}
                      className="w-full sm:w-auto"
                    >
                      <Plus size={16} className="mr-2" />
                      Ver todo
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Location Map Section - Moved inside left column */}
            {(property.state || property.city || property.address || (property.latitude && property.longitude)) && (
              <div className="border-t pt-4">
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  Ubicación
                </h3>
                {/* Map if coordinates available */}
                {property.latitude && property.longitude && (
                  <PropertyMapWrapper
                    latitude={property.latitude}
                    longitude={property.longitude}
                    title={property.title}
                    address={property.address}
                    city={property.city}
                    state={property.state}
                  />
                )}
              </div>
            )}

            {/* Related Properties Section */}
            {!isLoadingRelated && relatedProperties.length > 0 && (
              <div className="border-t pt-6 mt-6">
                <h3 className="text-xl font-semibold text-foreground mb-4">
                  Propiedades Relacionadas
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {relatedProperties.map((relatedProp) => (
                    <RelatedPropertyCard key={relatedProp.id} property={relatedProp} />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Contact Form - Sticky */}
          <div className="w-full lg:w-1/4">
            <div className="rounded-lg p-6 h-fit sticky top-32">
              <h3 className="text-xl font-bold text-foreground text-center mb-4 pb-3 border-b">
                Contáctanos
              </h3>

              {/* Agent Info */}
              {property.assignedAgent && (
                <div className="flex flex-col items-center space-y-3 mb-6">
                  <div className="w-24 h-24 rounded-full border-4 border-secondary bg-primary/20 flex items-center justify-center overflow-hidden">
                    {property.assignedAgent.personalInfo && 'avatarUrl' in property.assignedAgent.personalInfo && property.assignedAgent.personalInfo.avatarUrl ? (
                      <img
                        src={normalizeImageUrl((property.assignedAgent.personalInfo as any).avatarUrl)}
                        alt={agentName}
                        className="w-full h-full object-cover rounded-full"
                      />
                    ) : (
                      <FontAwesome
                        icon="user"
                        className="text-primary text-4xl"
                      />
                    )}
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-semibold text-foreground">
                      {agentName}
                    </p>
                  </div>
                </div>
              )}

              {/* Contact Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <TextField
                  label="Nombre"
                  type="text"
                  placeholder="Tu Nombre"
                  name="name"
                  value={formData.name}
                  onChange={handleFormChange}
                  disabled={isSubmitting}
                />

                <TextField
                  label="Correo"
                  type="email"
                  placeholder="Tu Correo Electrónico"
                  name="email"
                  value={formData.email}
                  onChange={handleFormChange}
                  disabled={isSubmitting}
                />

                <TextField
                  label="Teléfono"
                  type="tel"
                  placeholder="+56 9 1234 5678"
                  name="phone"
                  value={formData.phone}
                  onChange={handleFormChange}
                  disabled={isSubmitting}
                />

                <TextField
                  label="Mensaje"
                  type="textarea"
                  name="message"
                  placeholder="Escribe tu mensaje..."
                  value={formData.message}
                  onChange={handleFormChange}
                  disabled={isSubmitting}
                  rows={4}
                />

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full justify-center"
                >
                  {isSubmitting ? (
                    <>
                      <div className="flex justify-center"><span className="material-symbols-outlined animate-spin">progress_activity</span></div>
                      <span className="ml-2">Enviando...</span>
                    </>
                  ) : (
                    'Estoy interesado'
                  )}
                </Button>
              </form>

              {/* WhatsApp Button */}
              {/* WhatsApp Button eliminado por requerimiento */}
            </div>
          </div>
        </div>
      </div>

      {/* Description Dialog */}
      <Dialog
        open={showDescriptionDialog}
        title="Descripción Completa"
        onClose={() => setShowDescriptionDialog(false)}
      >
        <div className="max-h-96 overflow-y-auto">
          <p className="text-sm text-muted-foreground leading-relaxed text-justify whitespace-pre-wrap">
            {property.description}
          </p>
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <Button
            variant="outlined"
            onClick={() => setShowDescriptionDialog(false)}
          >
            Cerrar
          </Button>
        </div>
      </Dialog>
    </main>
  );
}
