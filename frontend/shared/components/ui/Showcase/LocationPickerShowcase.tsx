import React, { useState } from 'react';
import CreateLocationPicker from '../LocationPicker/CreateLocationPickerWrapper';
import UpdateLocationPicker from '../LocationPicker/UpdateLocationPickerWrapper';


interface Coordinates {
  lat: number;
  lng: number;
}

const LocationPickerShowcase: React.FC = () => {
  const [newLocation, setNewLocation] = useState<Coordinates | null>(null);
  const [existingLocation, setExistingLocation] = useState<Coordinates>({
    lat: -33.45,
    lng: -70.6667, // Santiago, Chile
  });

  return (
    <div className="p-6 space-y-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">LocationPicker Showcase</h1>
      
      {/* Ejemplo para CreateLocationPicker */}
      <div className="border rounded-lg p-6 bg-white shadow-sm">
        <h2 className="text-2xl font-semibold mb-4 text-green-700">CreateLocationPicker</h2>
        <p className="text-gray-600 mb-4">
          Componente para crear nuevas ubicaciones. Obtiene automáticamente la geolocalización del usuario.
        </p>
        
        <CreateLocationPicker 
          onChange={(coords) => {
            setNewLocation(coords);
            console.log('Nueva ubicación creada:', coords);
          }} 
        />
        
        {newLocation && (
          <div className="mt-4 p-4 bg-green-100 rounded-lg">
            <h3 className="font-semibold text-green-800">Ubicación Creada:</h3>
            <p className="text-green-700">Latitud: {newLocation.lat.toFixed(6)}</p>
            <p className="text-green-700">Longitud: {newLocation.lng.toFixed(6)}</p>
          </div>
        )}
      </div>

      {/* Ejemplo para UpdateLocationPicker */}
      <div className="border rounded-lg p-6 bg-white shadow-sm">
        <h2 className="text-2xl font-semibold mb-4 text-blue-700">UpdateLocationPicker</h2>
        <p className="text-gray-600 mb-4">
          Componente para actualizar ubicaciones existentes. Recibe coordenadas iniciales.
        </p>
        
        <UpdateLocationPicker 
          initialLat={existingLocation.lat}
          initialLng={existingLocation.lng}
          onChange={(coords) => {
            if (coords) {
              setExistingLocation(coords);
              console.log('Ubicación actualizada:', coords);
            }
          }} 
        />
        
        <div className="mt-4 p-4 bg-blue-100 rounded-lg">
          <h3 className="font-semibold text-blue-800">Ubicación Actual:</h3>
          <p className="text-blue-700">Latitud: {existingLocation.lat.toFixed(6)}</p>
          <p className="text-blue-700">Longitud: {existingLocation.lng.toFixed(6)}</p>
        </div>
      </div>

      {/* Ejemplo de integración con formularios */}
      <div className="border rounded-lg p-6 bg-gray-50">
        <h2 className="text-2xl font-semibold mb-4">Integración con Formularios</h2>
        <p className="text-gray-600 mb-4">
          Los LocationPicker ahora son componentes independientes que se pueden usar fuera de BaseForm.
        </p>
        
        <div className="bg-gray-800 text-green-400 p-4 rounded-lg text-sm">
          <pre>{`// Ejemplo de uso en un formulario personalizado:
const [formData, setFormData] = useState({
  name: '',
  location: null
});

// Para crear nueva ubicación:
<CreateLocationPicker 
  onChange={(coordinates) => {
    setFormData(prev => ({
      ...prev,
      location: coordinates
    }));
  }}
/>

// Para actualizar ubicación existente:
<UpdateLocationPicker 
  initialCoordinates={formData.location}
  onChange={(coordinates) => {
    if (coordinates) {
      setFormData(prev => ({
        ...prev,
        location: coordinates
      }));
    }
  }}
/>`}</pre>
        </div>
      </div>
    </div>
  );
};

export default LocationPickerShowcase;
