import React from 'react';
import { Button } from '@/shared/components/ui/Button/Button';

export default function PropertyCard() {
  // Datos de ejemplo (sin props)
  const featured = true;
  const operation = 'FOR SALE';
  const image = '';
  const video = '';
  const propertyType = 'Departamento';
  const bedrooms = 3;
  const bathrooms = 2;
  const builtArea = 85;
  const landArea = 120;
  const parkingSpots = 1;
  const uf = false;
  const price = 145000000;
  const region = 'Metropolitana';
  const commune = 'Las Condes';

  return (
    <div
      className="relative bg-white rounded-lg w-full text-left property-card shadow-lg overflow-hidden group"
      data-test-id="property-card-root"
    >
      {/* Overlay al hacer hover */}
      <div className="absolute inset-0 bg-foreground opacity-0 group-hover:opacity-30 transition-opacity duration-200 z-30 pointer-events-none" style={{ pointerEvents: 'none' }} />
      {/* Botón centrado sobre el overlay */}
      <div className="absolute inset-0 flex items-center justify-center z-40">
        <Button variant="primary" className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 px-6 py-2 text-base font-semibold" style={{ transform: 'translateY(-30%)' }}>Ver propiedad</Button>
      </div>
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
            zIndex: 20,
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
            pointerEvents: 'none',
          }}
          data-test-id="property-card-featured"
        >
          DESTACADA
        </div>
      )}
      <div className={`absolute top-2 right-2 bg-accent text-white text-xs font-semibold px-2 py-1 rounded-full`} data-test-id="property-card-operation">
        {operation === "FOR SALE" ? "En Venta" : operation === "FOR RENT" ? "En Arriendo" : operation}
      </div>
      <div className="flex items-center justify-center w-full aspect-[16/9] bg-gray-200 text-gray-400 overflow-hidden" data-test-id="property-card-media">
        {video ? (
          <video src={video} autoPlay muted loop playsInline className="object-cover w-full h-full" style={{ aspectRatio: '16/9' }} />
        ) : image ? (
          <img src={image} alt={propertyType} className="object-cover w-full h-full" style={{ aspectRatio: '16/9' }} />
        ) : (
          <span className="material-symbols-rounded text-gray-400 text-6xl">image</span>
        )}
      </div>
      <div className={`property-icons-container justify-center flex items-center gap-3 px-4 py-2 bg-gray-100`} data-test-id="property-card-icons">
        {bedrooms !== undefined && (
          <div className="flex items-center gap-1 whitespace-nowrap">
            <span className="material-symbols-rounded text-primary" style={{ fontSize: '20px' }}>bed</span>
            <span className="text-thin text-xs text-gray-700">{bedrooms}</span>
          </div>
        )}
        {bathrooms !== undefined && (
          <div className="flex items-center gap-1 whitespace-nowrap">
            <span className="material-symbols-rounded text-primary" style={{ fontSize: '20px' }}>bathtub</span>
            <span className="text-thin text-xs text-gray-700">{bathrooms}</span>
          </div>
        )}
        {builtArea !== undefined && (
          <div className="flex items-center gap-1 whitespace-nowrap">
            <span className="material-symbols-rounded text-primary" style={{ fontSize: '20px' }}>home</span>
            <span className="text-thin text-xs text-gray-700">{builtArea} m²</span>
          </div>
        )}
        {landArea !== undefined && (
          <div className="flex items-center gap-1 whitespace-nowrap">
            <span className="material-symbols-rounded text-primary" style={{ fontSize: '20px' }}>screenshot_frame_2</span>
            <span className="text-thin text-xs text-gray-700">{landArea} m²</span>
          </div>
        )}
        {parkingSpots !== undefined && (
          <div className="flex items-center gap-1 whitespace-nowrap">
            <span className="material-symbols-rounded text-primary" style={{ fontSize: '20px' }}>parking_sign</span>
            <span className="text-thin text-xs text-gray-700">{parkingSpots}</span>
          </div>
        )}
      </div>
      <div className="p-6 text-center">
        <div className="flex justify-center mb-2 text-thin text-xs" data-test-id="property-card-type">
          <p>{propertyType}</p>
        </div>
        {uf ? (
          <h3 className="text-xl font-bold text-gray-800 mb-2" data-test-id="property-card-uf">UF {price.toLocaleString('es-CL')}</h3>
        ) : (
          <h3 className="text-xl font-bold text-gray-800 mb-2" data-test-id="property-card-clp">$ {price.toLocaleString('es-CL')}</h3>
        )}
        <div className="flex flex-col items-center space-y-2 text-center" data-test-id="property-card-location">
          <p className="text-xs text-gray-400">Region {region}, {commune}</p>
        </div>
      </div>
    </div>
  );
}
