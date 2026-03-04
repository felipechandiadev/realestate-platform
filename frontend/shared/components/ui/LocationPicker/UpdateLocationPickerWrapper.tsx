import dynamic from 'next/dynamic';

/**
 * Wrapper con dynamic import para usar LocationPicker en formularios de actualización
 * Evita errores de SSR con Leaflet
 */
const UpdateLocationPickerWrapper = dynamic(() => import('./LocationPicker'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-64 bg-gray-100 rounded-md flex items-center justify-center">
      <div className="text-center text-gray-500">
        <div className="mb-2">📍</div>
        <span className="text-sm">Cargando mapa...</span>
      </div>
    </div>
  ),
});

export default UpdateLocationPickerWrapper;
