'use client'
import React from 'react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet - Only on client side
if (typeof window !== 'undefined') {
  try {
    // @ts-ignore
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    });
  } catch (err) {
    console.warn('[LocationPreview] leaflet icon merge failed', err);
  }
}

interface LocationPreviewProps {
  latitude: number;
  longitude: number;
  /** Altura del mapa (default: 200px) */
  height?: number | string;
  /** Nivel de zoom (default: 15) */
  zoom?: number;
  /** Clases CSS adicionales */
  className?: string;
}

/**
 * Componente de solo lectura para mostrar una ubicación en el mapa
 */
const LocationPreview: React.FC<LocationPreviewProps> = ({
  latitude,
  longitude,
  height = 200,
  zoom = 15,
  className = '',
}) => {
  const heightStyle = typeof height === 'number' ? `${height}px` : height;

  return (
    <div className="w-full">
      <h5 className="text-base font-semibold mb-2">Ubicación en mapa</h5>
      <div
        className={`overflow-hidden rounded-md border border-gray-200 ${className}`}
        style={{ zIndex: 1, height: heightStyle, width: '100%' }}
      >
        <MapContainer
          center={[latitude, longitude]}
          zoom={zoom}
          style={{ height: '100%', width: '100%' }}
          attributionControl={false}
          scrollWheelZoom={false}
          dragging={false}
          doubleClickZoom={false}
          zoomControl={false}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={[latitude, longitude]} />
        </MapContainer>
      </div>
    </div>
  );
};

export default LocationPreview;
