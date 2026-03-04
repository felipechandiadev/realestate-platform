'use client'
import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

// Import Leaflet CSS in component to ensure it's loaded
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
    console.warn('[LocationPicker] leaflet icon merge failed', err);
  }
}

interface LocationPickerProps {
  onChange?: (coordinates: { lat: number; lng: number } | null) => void;
  initialLat?: number;
  initialLng?: number;
}

const LocationPicker: React.FC<LocationPickerProps> = ({ onChange, initialLat = 19.4326, initialLng = -99.1332 }) => {
  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(
    initialLat && initialLng ? { lat: initialLat, lng: initialLng } : null
  );

  const [showMap, setShowMap] = useState(false);

  useEffect(() => {
    if (initialLat && initialLng && !position) {
      setPosition({ lat: initialLat, lng: initialLng });
    }
  }, [initialLat, initialLng, position]);

  useEffect(() => {
    setShowMap(true);
    return () => {
      setShowMap(false);
    };
  }, []);

  const handleMapClick = (e: any) => {
    if (!e || !e.latlng) return;
    const newPosition = { lat: e.latlng.lat, lng: e.latlng.lng };
    setPosition(newPosition);
    onChange?.(newPosition);
  };

  // Component to handle map events
  const MapEvents = () => {
    useMapEvents({
      click: handleMapClick,
    });
    return null;
  };

  // Simple Error Boundary wrapper to avoid crashing the page
  class MapErrorBoundary extends React.Component<React.PropsWithChildren<{}>, { hasError: boolean }> {
    state = { hasError: false };

    static getDerivedStateFromError() {
      return { hasError: true };
    }

    componentDidCatch(error: any, info: any) {
      console.error('[LocationPicker] Map initialization error:', error, info);
    }

    reset = () => this.setState({ hasError: false });

    render() {
      if (this.state.hasError) {
        return (
          <div className="p-4 text-center">
            <div className="text-sm text-muted-foreground">Mapa no disponible</div>
            <button
              className="mt-2 px-3 py-1 rounded border"
              onClick={() => {
                this.reset();
                setShowMap(false);
                setTimeout(() => setShowMap(true), 100);
              }}
            >
              Reintentar
            </button>
          </div>
        );
      }
      return this.props.children;
    }
  }

  return (
    <div className="location-container w-full h-full min-h-[300px]" style={{ zIndex: 1, position: 'relative' }}>
      {showMap && (
        <MapErrorBoundary>
          <MapContainer
            center={[initialLat, initialLng]}
            zoom={13}
            style={{ height: '300px', width: '100%' }}
            attributionControl={false}
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <MapEvents />
            {position && <Marker position={[position.lat, position.lng]} />}
          </MapContainer>
        </MapErrorBoundary>
      )}
    </div>
  );
};

export default LocationPicker;