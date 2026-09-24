"use client";

import React, { useMemo, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Bed, Bath, Home, Maximize2, ParkingSquare, Heart } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button/Button';
import { env } from '@/lib/env';
import { useAlert } from '@/shared/hooks/useAlert';
import { togglePropertyFavorite } from '@/features/backoffice/properties/actions/properties.action';
import { useCookieConsent } from '@/providers/CookieConsentContext';
import { useAuth } from '@/app/providers';

type Currency = 'CLP' | 'UF';
type OperationType = 'SALE' | 'RENT';

type MediaVariant = {
  id?: string;
  variantType: string;
  format: 'webp' | 'jpeg' | 'png';
  width: number;
  height: number;
  size: number;
  url: string;
};

type MediaItem = {
  id?: string;
  url: string;
  type?: string;     // e.g. 'PROPERTY_IMG', 'VIDEO'
  format?: string;   // e.g. 'IMG'
  variants?: MediaVariant[];
};

type PropertyTypeLite = {
  id: string;
  name: string;
  hasBedrooms?: boolean;
  hasBathrooms?: boolean;
  hasBuiltSquareMeters?: boolean;
  hasLandSquareMeters?: boolean;
  hasParkingSpaces?: boolean;
  hasFloors?: boolean;
  hasConstructionYear?: boolean;
};

export interface PortalProperty {
  id: string;
  title: string;
  description?: string | null;
  status?: string;
  operationType: OperationType;
  price: number;
  currencyPrice: Currency;
  state?: string | null; // Región
  city?: string | null;  // Comuna
  propertyType?: PropertyTypeLite | null;
  mainImageUrl?: string | null;
  multimedia?: MediaItem[];
  bedrooms?: number | null;
  bathrooms?: number | null;
  builtSquareMeters?: number | null;
  landSquareMeters?: number | null;
  parkingSpaces?: number | null;
  isFeatured?: boolean;
}

export interface PropertyCardProps {
  property: PortalProperty;
  href?: string;                      // opcional, si se quiere navegar a detalle
  onClick?: (id: string) => void;     // opcional, callback al hacer click
}

const FALLBACK_IMAGE_DATA_URL =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720">
      <rect width="100%" height="100%" fill="#e5e7eb"/>
    </svg>`
  );

function normalizeMediaUrl(url?: string | null): string | undefined {
  if (!url) return undefined;

  // Sanea rutas con ../
  const cleaned = url.replace('/../', '/');

  // Si ya es absoluta (http:// o https://), devuélvela tal cual
  if (cleaned.startsWith('http://') || cleaned.startsWith('https://')) {
    // Si apunta a localhost:3000 (frontend), convertirlo a backend
    if (cleaned.includes('localhost:3000') || cleaned.includes('127.0.0.1:3000')) {
      const backendUrl = cleaned.replace(/https?:\/\/[^\/]+/, env.backendApiUrl);
      console.log('🔄 [PropertyCard] Converted localhost URL to backend:', backendUrl);
      return backendUrl;
    }
    console.log('✅ [PropertyCard] Already absolute:', cleaned);
    return cleaned;
  }

  // Si es relativa (comienza con /), prepend backend API URL
  if (cleaned.startsWith('/')) {
    const absolute = `${env.backendApiUrl}${cleaned}`;
    console.log('✅ [PropertyCard] Made absolute:', absolute);
    return absolute;
  }

  console.log('⚠️ [PropertyCard] Unexpected URL format:', url);
  // Cualquier otro caso, devolver limpiada
  return cleaned;
}

function isVideoFile(url: string): boolean {
  const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi', '.mkv'];
  const lowerUrl = url.toLowerCase();
  return videoExtensions.some(ext => lowerUrl.includes(ext));
}

function normalizeVariantType(value?: string): string {
  return (value || '').trim().toLowerCase().replace(/-/g, '_');
}

function pickBestImageVariantUrl(mediaItem: MediaItem): string | undefined {
  if (!mediaItem.variants || mediaItem.variants.length === 0) return undefined;

  const preferredTypes = ['thumbnail_md', 'thumbnail_lg', 'thumbnail_sm', 'full', 'og_image'];

  const findVariant = (format: 'webp' | 'jpeg' | 'png') =>
    preferredTypes
      .map((type) => mediaItem.variants?.find((variant) => {
        const matchesType = normalizeVariantType(variant.variantType) === type;
        const matchesFormat = (variant.format || '').toLowerCase() === format;
        return matchesType && matchesFormat && !!variant.url;
      }))
      .find(Boolean);

  return (
    findVariant('webp')?.url ||
    findVariant('jpeg')?.url ||
    findVariant('png')?.url ||
    mediaItem.variants.find((variant) => !!variant.url)?.url
  );
}

function resolveMediaUrl(mediaItem: MediaItem): string | undefined {
  const baseUrl = mediaItem.url;
  const isVideo = baseUrl ? isVideoFile(baseUrl) : false;
  const finalUrl = isVideo ? baseUrl : pickBestImageVariantUrl(mediaItem) || baseUrl;
  return normalizeMediaUrl(finalUrl);
}

function getOrderedMedia(property: PortalProperty): Array<{ type: 'image' | 'video'; url: string }> {
  const media: Array<{ type: 'image' | 'video'; url: string }> = [];

  const isDebugProperty = property.id === '047c17f4-a582-4509-ac61-8177b12750ee';
  const logPrefix = isDebugProperty ? '🔍🔍 [DEBUG PROPERTY]' : '🔍 [getOrderedMedia]';

  console.log(`${logPrefix} Property multimedia details:`, {
    propertyId: property.id,
    mainImageUrl: property.mainImageUrl,
    multimedia: property.multimedia?.map(m => ({
      id: m.id,
      url: m.url,
      type: m.type,
      format: m.format
    })) || []
  });

  // Agregar todo el multimedia (imágenes y videos) priorizando variantes optimizadas para imágenes
  if (property.multimedia && property.multimedia.length > 0) {
    console.log(`${logPrefix} Processing ${property.multimedia.length} multimedia items`);

    property.multimedia.forEach((mediaItem, index) => {
      console.log(`${logPrefix} Processing media ${index + 1}/${property.multimedia!.length}:`, {
        id: mediaItem.id,
        url: mediaItem.url,
        type: mediaItem.type,
        format: mediaItem.format,
        isVideo: isVideoFile(mediaItem.url),
        urlLength: mediaItem.url?.length || 0
      });

      const url = resolveMediaUrl(mediaItem);
      
      if (url) {
        const type = isVideoFile(url) ? 'video' : 'image';
        
        // Evitar duplicados con mainImageUrl
        if (!media.find(m => m.url === url)) {
          media.push({ type, url });
          console.log(`${logPrefix} ✅ Added multimedia ${type} ${index + 1}:`, url);
        } else {
          console.log(`${logPrefix} ⚠️ Skipped duplicate ${index + 1}:`, url);
        }
      } else {
        console.log(`${logPrefix} ❌ Skipped invalid media ${index + 1} (no url)`);
      }
    });
  } else {
    console.log(`${logPrefix} No multimedia array found`);
  }

  // Fallback a mainImageUrl sólo si no hay multimedia utilizable
  if (media.length === 0 && property.mainImageUrl) {
    const mainUrl = normalizeMediaUrl(property.mainImageUrl);
    if (mainUrl) {
      const type = isVideoFile(mainUrl) ? 'video' : 'image';
      media.push({ type, url: mainUrl });
      console.log(`${logPrefix} Added fallback mainImageUrl as ${type}:`, mainUrl);
    }
  }

  console.log(`${logPrefix} Final result:`, {
    totalMultimedia: property.multimedia?.length || 0,
    mediaFound: media.length,
    media: media
  });

  return media;
}

function getPrimaryMedia(property: PortalProperty): { type: 'image' | 'video'; url: string } | undefined {
  // Primero, intentar obtener la primera imagen de multimedia (más confiable)
  if (property.multimedia && property.multimedia.length > 0) {
    // Buscar imagen primero
    const firstImage = property.multimedia.find(m => m.type === 'PROPERTY_IMG' || m.format === 'IMG');
    if (firstImage) {
      const url = resolveMediaUrl(firstImage);
      if (url && !isVideoFile(url)) {
        return { type: 'image', url };
      }
    }
    
    // Si no hay imagen, buscar video
    const firstVideo = property.multimedia.find(m => m.type === 'PROPERTY_VIDEO' || isVideoFile(m.url));
    if (firstVideo) {
      const url = resolveMediaUrl(firstVideo);
      if (url) {
        return { type: 'video', url };
      }
    }
  }

  // Fallback: usar mainImageUrl
  if (property.mainImageUrl) {
    const url = normalizeMediaUrl(property.mainImageUrl);
    if (!url) return undefined;
    
    if (isVideoFile(url)) {
      return { type: 'video', url };
    } else {
      return { type: 'image', url };
    }
  }

  // Si no hay nada, devolver undefined (mostrar placeholder)
  return undefined;
}

function formatPrice(price: number, currency: Currency): string {
  if (currency === 'UF') {
    return `UF ${price.toLocaleString('es-CL')}`;
  }
  // CLP
  return `$ ${price.toLocaleString('es-CL')}`;
}

function operationLabel(op: OperationType): string {
  return op === 'SALE' ? 'En Venta' : op === 'RENT' ? 'En Arriendo' : op;
}

export default function PropertyCard({ property, href, onClick }: PropertyCardProps) {
  const primaryMedia = getPrimaryMedia(property);
  const isDebugProperty = property.id === '047c17f4-a582-4509-ac61-8177b12750ee';
  const logPrefix = isDebugProperty ? '🎯🎯 [DEBUG PROPERTY]' : '🎯 [PropertyCard]';

  console.log(`${logPrefix} Property ID:`, property.id);
  console.log(`${logPrefix} mainImageUrl:`, property.mainImageUrl);
  console.log(`${logPrefix} primaryMedia (after getPrimaryMedia):`, primaryMedia);
  
  // Get ordered media (images + videos) for navigation
  const mediaItems = getOrderedMedia(property);
  const hasMedia = mediaItems.length > 0;
  
  console.log(`${logPrefix} Debug info:`, {
    propertyId: property.id,
    mainImageUrl: property.mainImageUrl,
    multimediaCount: property.multimedia?.length || 0,
    mediaFound: mediaItems.length,
    hasMedia,
    currentMediaIndex: hasMedia ? 0 : -1,
    allMedia: mediaItems
  });
  
  const [mediaSrc, setMediaSrc] = useState<{ type: 'image' | 'video'; url: string } | undefined>(() => {
    console.log('🎯 [PropertyCard] Initial mediaSrc state:', primaryMedia);
    return primaryMedia;
  });
  const [currentMediaIndex, setCurrentMediaIndex] = useState(hasMedia ? 0 : -1);
  const [isFavorited, setIsFavorited] = useState(false);
  const [isLoadingFav, setIsLoadingFav] = useState(false);
  const { showAlert } = useAlert();
  const { hasConsented: cookiesAccepted } = useCookieConsent();
  const { status: authStatus } = useAuth();
  
  const isUF = property.currencyPrice === 'UF';
  const opText = operationLabel(property.operationType);
  const featured = !!property.isFeatured;

  const propertyTypeName = property.propertyType?.name || '';
  const region = property.state || '';
  const commune = property.city || '';
  const showBedrooms = property.bedrooms != null && (property.propertyType?.hasBedrooms ?? true);
  const showBathrooms = property.bathrooms != null && (property.propertyType?.hasBathrooms ?? true);
  const showBuiltSquareMeters = property.builtSquareMeters != null && (property.propertyType?.hasBuiltSquareMeters ?? true);
  const showLandSquareMeters = property.landSquareMeters != null && (property.propertyType?.hasLandSquareMeters ?? true);
  const showParkingSpaces = property.parkingSpaces != null && (property.propertyType?.hasParkingSpaces ?? true);

  // Check favorite status on mount and from cookies
  useEffect(() => {
    const checkFavorite = () => {
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
        } else {
          setIsFavorited(false);
        }
      } catch (error) {
        console.error('Error reading favorites cookie:', error);
        setIsFavorited(false);
      }
    };

    checkFavorite();
    // Re-check periodically or when auth status changes
    const interval = setInterval(checkFavorite, 2000); 
    return () => clearInterval(interval);
  }, [property.id, authStatus]);

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (isLoadingFav) return;
    setIsLoadingFav(true);

    try {
      // Update DB and cookies
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

      // Update cookie - read fresh state from cookie
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

        // Use the API result as the source of truth for the property status
        const isFavoritedNow = result.isFavorited;
        
        let newFavorites: string[];
        if (isFavoritedNow) {
          // Add to favorites, ensure no duplicates
          newFavorites = Array.from(new Set([...favorites, property.id]));
        } else {
          // Remove from favorites
          newFavorites = favorites.filter((id) => id !== property.id);
        }

        // Save to cookie
        const expires = new Date();
        expires.setTime(expires.getTime() + 365 * 24 * 60 * 60 * 1000);
        document.cookie = `favorites=${encodeURIComponent(JSON.stringify(newFavorites))}; expires=${expires.toUTCString()}; path=/`;

        // Update UI state
        setIsFavorited(!!isFavoritedNow);

        showAlert({
          message: isFavoritedNow
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

  const handleClick = () => {
    // Redirigir a la página de detalle en una nueva ventana
    window.open(`/portal/properties/property/${property.id}`, '_blank');
    if (onClick) onClick(property.id);
  };

  const handlePrevImage = () => {
    setCurrentMediaIndex(prev => {
      const newIndex = prev <= 0 ? mediaItems.length - 1 : prev - 1;
      console.log('⬅️ [PropertyCard] Previous media:', newIndex, mediaItems[newIndex]);
      return newIndex;
    });
  };

  const handleNextImage = () => {
    setCurrentMediaIndex(prev => {
      const newIndex = prev >= mediaItems.length - 1 ? 0 : prev + 1;
      console.log('➡️ [PropertyCard] Next media:', newIndex, mediaItems[newIndex]);
      return newIndex;
    });
  };

  // Media container (img or video or fallback)
  const mediaEl = useMemo(() => {
    // If we have media items, show the current one from the array
    if (hasMedia && currentMediaIndex >= 0 && currentMediaIndex < mediaItems.length) {
      const currentMedia = mediaItems[currentMediaIndex];
      
      if (currentMedia.type === 'video') {
        return (
          <video
            src={currentMedia.url}
            className="object-cover w-full h-full"
            style={{ aspectRatio: '16/9' }}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            onError={(e) => {
              console.warn('⚠️ [PropertyCard] Video failed to load, trying next:', currentMedia.url);
              handleNextImage();
            }}
            onLoadedData={() => {
              console.log('✅ [PropertyCard] Video loaded successfully:', currentMedia.url);
            }}
          />
        );
      }
      
      // Image
      return (
        <img
          src={currentMedia.url}
          alt={`${propertyTypeName || property.title} - Media ${currentMediaIndex + 1} de ${mediaItems.length}`}
          className="object-cover w-full h-full"
          style={{ aspectRatio: '16/9' }}
          loading="lazy"
          onError={(e) => {
            console.warn('⚠️ [PropertyCard] Image failed to load, trying next:', e.currentTarget.src);
            handleNextImage();
          }}
        />
      );
    }

    // Fallback to original logic if no media available
    if (!mediaSrc) {
      return (
        <div 
          className="flex items-center justify-center w-full h-full bg-white" 
          style={{ 
            aspectRatio: '16/9'
          }}
        >
        </div>
      );
    }

    if (mediaSrc.type === 'video') {
      return (
        <video
          src={mediaSrc.url}
          className="object-cover w-full h-full"
          style={{ aspectRatio: '16/9' }}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          onError={(e) => {
            console.warn('⚠️ [PropertyCard] Video failed to load, showing fallback:', mediaSrc.url);
            setMediaSrc(undefined);
          }}
          onLoadedData={() => {
            console.log('✅ [PropertyCard] Video loaded successfully');
          }}
        />
      );
    }

    // Fallback image
    return (
      <img
        src={mediaSrc.url}
        alt={propertyTypeName || property.title}
        className="object-cover w-full h-full"
        style={{ aspectRatio: '16/9' }}
        onError={(e) => {
          console.warn('⚠️ [PropertyCard] Image failed to load, showing fallback:', e.currentTarget.src);
          setMediaSrc(undefined);
        }}
      />
    );
  }, [mediaSrc, hasMedia, currentMediaIndex, mediaItems, propertyTypeName, property.title]);

  const CardInner = (
    <div
      className="relative bg-white rounded-lg w-full text-left property-card shadow-lg overflow-hidden z-0 flex flex-col h-full"
      data-test-id="property-card-root"
    >
      {featured && (
        <div
          className="featured-ribbon"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            backgroundColor: '#16a34a',
            color: 'white',
            fontWeight: 'bold',
            fontSize: '0.7rem',
            padding: '0.25rem 2rem',
            transformOrigin: '0% 0%',
            transform: 'translate(-20%, 270%) rotate(-45deg)',
            zIndex: 10,
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
            pointerEvents: 'none',
          }}
          data-test-id="property-card-featured"
        >
          DESTACADA
        </div>
      )}

      {opText && opText.trim() && (
        <div
          className="absolute top-2 right-2 bg-blue-600 text-white text-xs font-semibold px-2 py-1 rounded-full border-2 border-white shadow-lg z-10"
          data-test-id="property-card-operation"
        >
          {opText}
        </div>
      )}

      <div className="flex-1 flex flex-col">
        <div
          className="flex items-center justify-center w-full aspect-[16/9] text-gray-400 overflow-hidden relative bg-white"
          data-test-id="property-card-media"
        >
          {mediaEl}

          {/* Navigation chevrons - only show if multiple media items */}
          {hasMedia && mediaItems.length > 1 && (
            <>
              {/* Previous button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrevImage();
                }}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/70 hover:bg-black/90 text-white rounded-full flex items-center justify-center transition-all duration-200 opacity-80 hover:opacity-100 shadow-lg"
                aria-label="Media anterior"
              >
                <ChevronLeft size={24} />
              </button>

              {/* Next button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleNextImage();
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/70 hover:bg-black/90 text-white rounded-full flex items-center justify-center transition-all duration-200 opacity-80 hover:opacity-100 shadow-lg"
                aria-label="Media siguiente"
              >
                <ChevronRight size={24} />
              </button>
            </>
          )}
        </div>

        <div
          className="property-icons-container justify-center flex items-center gap-3 px-4 py-1 md:py-2 bg-secondary/30 shrink-0"
          data-test-id="property-card-icons"
        >
          {showBedrooms && (
            <div className="flex items-center gap-1 whitespace-nowrap">
              <Bed size={20} className="text-primary" />
              <span className="text-thin text-xs text-gray-700">{property.bedrooms}</span>
            </div>
          )}
          {showBathrooms && (
            <div className="flex items-center gap-1 whitespace-nowrap">
              <Bath size={20} className="text-primary" />
              <span className="text-thin text-xs text-gray-700">{property.bathrooms}</span>
            </div>
          )}
          {showBuiltSquareMeters && (
            <div className="flex items-center gap-1 whitespace-nowrap">
              <Home size={20} className="text-primary" />
              <span className="text-thin text-xs text-gray-700">{Math.round(property.builtSquareMeters ?? 0)} m²</span>
            </div>
          )}
          {showLandSquareMeters && (
            <div className="flex items-center gap-1 whitespace-nowrap">
              <Maximize2 size={20} className="text-primary" />
              <span className="text-thin text-xs text-gray-700">{property.landSquareMeters} m²</span>
            </div>
          )}
          {showParkingSpaces && (
            <div className="flex items-center gap-1 whitespace-nowrap">
              <ParkingSquare size={20} className="text-primary" />
              <span className="text-thin text-xs text-gray-700">{property.parkingSpaces}</span>
            </div>
          )}
        </div>

        <div className="px-4 md:px-6 pt-2 md:pt-3 pb-2 md:pb-3 text-center flex flex-col flex-1 justify-start gap-1">
          <div className="flex justify-center text-thin text-xs" data-test-id="property-card-type">
            <p>{propertyTypeName}</p>
          </div>

          {/* Property Title */}
          <h2 className="text-sm md:text-lg font-bold text-gray-800 line-clamp-2 leading-tight">
            {property.title}
          </h2>

          <h3 className="text-base md:text-xl font-bold text-gray-800" data-test-id={isUF ? 'property-card-uf' : 'property-card-clp'}>
            {formatPrice(property.price, property.currencyPrice)}
          </h3>

          <div className="flex flex-col items-center text-center" data-test-id="property-card-location">
            <div className="flex justify-center items-center gap-2 flex-wrap">
              {region && <span className="text-xs text-gray-600 font-medium">{region}</span>}
              {region && commune && <span className="text-xs text-gray-400">•</span>}
              {commune && <span className="text-xs text-gray-600 font-medium">{commune}</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Row inferior con botón y corazón */}
      <div className="flex justify-between items-center px-4 md:px-6 py-1 md:py-2 border-t border-gray-100 mt-auto min-h-[40px] md:min-h-[52px]">
        <Button
          onClick={(e: React.MouseEvent) => {
            e.stopPropagation();
            window.open(`/portal/properties/property/${property.id}`, '_blank');
          }}
          className="px-2 md:px-3 py-1 text-xs md:text-sm font-medium"
          variant="primary"
        >
          Ver propiedad
        </Button>

        {/* Favorite heart button - only show if cookies accepted */}
        {cookiesAccepted ? (
          <button
            onClick={handleToggleFavorite}
            disabled={isLoadingFav}
            className="transition-all duration-200 hover:scale-110 disabled:opacity-50 p-2 rounded-full"
            title={isFavorited ? 'Remover de favoritos' : 'Agregar a favoritos'}
          >
            <Heart
              size={24}
              fill={isFavorited ? 'currentColor' : 'none'}
              className={`transition-all ${
                isFavorited
                  ? 'text-accent'
                  : 'text-gray-400 hover:text-accent'
              }`}
            />
          </button>
        ) : (
          <span className="w-10 h-10" aria-hidden />
        )}
      </div>
    </div>
  );

  return CardInner;
}
