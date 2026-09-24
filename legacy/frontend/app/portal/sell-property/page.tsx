/**
 * Sell Property Publication Page (Portal)
 * 
 * Propósito:
 * - Formulario multi-step para publicar propiedad en VENTA
 * - Permitir a usuarios publicar propiedades para vender
 * - Wizard guiado con validación paso a paso
 * - Preview antes de publicar
 * 
 * Funcionalidad:
 * - Client component: StepperBaseForm con 4 pasos
 * - Paso 1: Tipo propiedad y operación (forzado a SALE)
 * - Paso 2: Características básicas (m2, habitaciones, baños, etc.)
 * - Paso 3: Ubicación (región, comuna, coordenadas con mapa)
 * - Paso 4: Precio, descripción, imágenes (FileUploader)
 * - Preview: PropertyPreviewCard antes de submit
 * - Validación dinámica por tipo de propiedad
 * - Autenticación requerida (redirects a login)
 * - Submit a publishProperty o publishPropertyPublic
 * 
 * Audiencia: Usuarios registrados que quieren vender su propiedad
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import dynamic from 'next/dynamic';
import StepperBaseForm, { StepperStep, BaseFormField } from '@/shared/components/ui/BaseForm/StepperBaseForm';
import { 
  listPropertyTypesPublic, 
  getPropertyTypeCharacteristicsPublic, 
  PropertyTypeWithFeatures, 
  publishPropertyPublic,
  publishProperty 
} from '@/features/backoffice/properties/actions/properties.action';
import { getRegiones, getComunasByRegion } from '@/features/shared/common/actions/commons.action';
import Alert from '@/shared/components/ui/Alert/Alert';
import { Button } from '@/shared/components/ui/Button/Button';

// Dynamic import for LocationPreview to avoid SSR issues with Leaflet
const LocationPreview = dynamic(() => import('@/shared/components/ui/LocationPicker/LocationPreview'), {
  ssr: false,
  loading: () => (
    <div className="w-full">
      <h5 className="text-base font-semibold mb-2">Ubicación en mapa</h5>
      <div
        style={{
          width: '100%',
          height: '200px',
          borderRadius: '0.375rem',
          overflow: 'hidden',
          backgroundColor: '#f3f4f6'
        }}
        className="flex items-center justify-center"
      >
        <div className="text-center text-gray-500 text-sm">
          <div className="mb-2">📍</div>
          <div>Cargando mapa...</div>
        </div>
      </div>
    </div>
  )
});

// ========================================
// PropertyPreviewCard - Tarjeta de preview sin botones de acción
// ========================================
interface PropertyPreviewCardProps {
  title: string;
  operationType: 'SALE' | 'RENT';
  price: number;
  currencyPrice: 'CLP' | 'UF';
  location: string;
  propertyTypeName?: string;
  bedrooms?: number | null;
  bathrooms?: number | null;
  builtSquareMeters?: number | null;
  landSquareMeters?: number | null;
  parkingSpaces?: number | null;
  imageUrl?: string;
  propertyType?: PropertyTypeWithFeatures | null;
}

function PropertyPreviewCard({
  title,
  operationType,
  price,
  currencyPrice,
  location,
  propertyTypeName,
  bedrooms,
  bathrooms,
  builtSquareMeters,
  landSquareMeters,
  parkingSpaces,
  imageUrl,
  propertyType,
}: PropertyPreviewCardProps) {
  // Formatear precio
  const formatPrice = (value: number, currency: 'CLP' | 'UF') => {
    if (currency === 'UF') {
      return `UF ${value.toLocaleString('es-CL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    return `$${value.toLocaleString('es-CL')}`;
  };

  return (
    <div className="bg-card rounded-xl overflow-hidden border border-border shadow-md">
      {/* Imagen */}
      <div className="relative aspect-video bg-muted">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="material-symbols-outlined text-muted-foreground" style={{ fontSize: '48px' }}>
              image
            </span>
          </div>
        )}
        {/* Badge de tipo de operación */}
        <div className="absolute top-3 left-3">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
            operationType === 'RENT' 
              ? 'bg-blue-500 text-white' 
              : 'bg-green-500 text-white'
          }`}>
            {operationType === 'RENT' ? 'Arriendo' : 'Venta'}
          </span>
        </div>
      </div>

      {/* Contenido */}
      <div className="p-4 space-y-3">
        {/* Precio */}
        <div className="text-2xl font-bold text-primary">
          {formatPrice(price, currencyPrice)}
        </div>

        {/* Título */}
        <h3 className="text-lg font-semibold text-foreground line-clamp-2">{title || 'Sin título'}</h3>

        {/* Ubicación */}
        <div className="flex items-center gap-1 text-muted-foreground text-sm">
          <span className="material-symbols-outlined text-base">location_on</span>
          <span>{location || 'Ubicación no especificada'}</span>
        </div>

        {/* Tipo de propiedad */}
        {propertyTypeName && (
          <div className="flex items-center gap-1 text-muted-foreground text-sm">
            <span className="material-symbols-outlined text-base">home</span>
            <span>{propertyTypeName}</span>
          </div>
        )}

        {/* Características */}
        <div className="flex flex-wrap gap-3 pt-2 border-t border-border">
          {propertyType?.hasBedrooms && bedrooms !== null && bedrooms !== undefined && bedrooms > 0 && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <span className="material-symbols-outlined text-base">bed</span>
              <span>{bedrooms}</span>
            </div>
          )}
          {propertyType?.hasBathrooms && bathrooms !== null && bathrooms !== undefined && bathrooms > 0 && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <span className="material-symbols-outlined text-base">shower</span>
              <span>{bathrooms}</span>
            </div>
          )}
          {propertyType?.hasBuiltSquareMeters && builtSquareMeters !== null && builtSquareMeters !== undefined && builtSquareMeters > 0 && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <span className="material-symbols-outlined text-base">square_foot</span>
              <span>{builtSquareMeters} m²</span>
            </div>
          )}
          {propertyType?.hasLandSquareMeters && landSquareMeters !== null && landSquareMeters !== undefined && landSquareMeters > 0 && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <span className="material-symbols-outlined text-base">landscape</span>
              <span>{landSquareMeters} m²</span>
            </div>
          )}
          {propertyType?.hasParkingSpaces && parkingSpaces !== null && parkingSpaces !== undefined && parkingSpaces > 0 && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <span className="material-symbols-outlined text-base">directions_car</span>
              <span>{parkingSpaces}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ========================================
// Main Component
// ========================================
type FormValues = {
  title: string;
  description: string;
  propertyTypeId: string | null;
  builtSquareMeters: number;
  landSquareMeters: number;
  bedrooms: number;
  bathrooms: number;
  parkingSpaces: number;
  floors: number;
  constructionYear: number;
  price: string;
  currencyPrice: string;
  region: string | null;
  city: string | null;
  address: string;
  coordinates: { lat: number; lng: number } | null;
  multimedia: File[];
  contactName: string;
  contactPhone: string;
  contactEmail: string;
};

const INITIAL_VALUES: FormValues = {
  title: '',
  description: '',
  propertyTypeId: null,
  builtSquareMeters: 0,
  landSquareMeters: 0,
  bedrooms: 0,
  bathrooms: 0,
  parkingSpaces: 0,
  floors: 0,
  constructionYear: new Date().getFullYear(),
  price: '',
  currencyPrice: 'UF', // Por defecto UF para ventas
  region: null,
  city: null,
  address: '',
  coordinates: null,
  multimedia: [],
  contactName: '',
  contactPhone: '',
  contactEmail: '',
};

export default function SellPropertyPage() {
  const { data: session } = useSession();
  const [values, setValues] = useState<FormValues>(INITIAL_VALUES);
  const router = useRouter();
  const [propertyTypes, setPropertyTypes] = useState<Array<{ id: string; label: string }>>([]);
  const [selectedPropertyType, setSelectedPropertyType] = useState<PropertyTypeWithFeatures | null>(null);
  const [regions, setRegions] = useState<Array<{ id: string; label: string }>>([]);
  const [comunas, setComunas] = useState<Array<{ id: string; label: string }>>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [loadingCharacteristics, setLoadingCharacteristics] = useState(false);
  const [showPostSubmitLoading, setShowPostSubmitLoading] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  // Pre-fill contact info if session exists
  useEffect(() => {
    if (session?.user) {
      setValues(prev => ({
        ...prev,
        contactName: session.user.name || prev.contactName,
        contactEmail: session.user.email || prev.contactEmail,
        // Assuming phone might be available in user object if your custom session includes it
        contactPhone: (session.user as any).phone || prev.contactPhone || '',
      }));
    }
  }, [session]);

  // Load property types and regions on mount
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        console.log('📥 [SellProperty] Loading initial data...');
        const [typesResult, regionsResult] = await Promise.all([
          listPropertyTypesPublic(),
          getRegiones(),
        ]);

        console.log('📦 [SellProperty] Types result:', typesResult);
        console.log('📦 [SellProperty] Regions result:', regionsResult);

        if (typesResult.success && typesResult.data) {
          const mappedTypes = typesResult.data.map(pt => ({ id: pt.id, label: pt.name }));
          console.log('✅ [SellProperty] Property types loaded:', mappedTypes);
          setPropertyTypes(mappedTypes);
        } else {
          console.warn('⚠️ [SellProperty] Types result not successful:', typesResult);
        }

        setRegions(regionsResult);
      } catch (error) {
        console.error('❌ [SellProperty] Error loading initial data:', error);
      }
    };

    loadInitialData();
  }, []);

  // Load property type characteristics when propertyTypeId changes
  useEffect(() => {
    if (values.propertyTypeId) {
      const loadCharacteristics = async () => {
        setLoadingCharacteristics(true);
        try {
          const result = await getPropertyTypeCharacteristicsPublic(values.propertyTypeId as string);
          if (result.success && result.data) {
            setSelectedPropertyType(result.data);
          }
        } catch (error) {
          console.error('Error loading property type characteristics:', error);
        } finally {
          setLoadingCharacteristics(false);
        }
      };

      loadCharacteristics();
    } else {
      setSelectedPropertyType(null);
    }
  }, [values.propertyTypeId]);

  // Load comunas when region changes
  useEffect(() => {
    if (values.region) {
      const loadComunas = async () => {
        try {
          const result = await getComunasByRegion(values.region as string);
          setComunas(result);
        } catch (error) {
          console.error('Error loading comunas:', error);
        }
      };

      loadComunas();
    }
  }, [values.region]);

  // Handle post-submit loading delay
  useEffect(() => {
    if (showPostSubmitLoading) {
      const timer = setTimeout(() => {
        setShowPostSubmitLoading(false);
        setShowSuccessMessage(true);
      }, 3000); // 3 seconds delay

      return () => clearTimeout(timer);
    }
  }, [showPostSubmitLoading]);

  const handleChange = (field: string, value: unknown) => {
    setValues(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      setErrors([]);

      // Validación final
      if (!values.title || !values.propertyTypeId) {
        setErrors(['Por favor completa la información básica']);
        return;
      }

      if (!values.region || !values.city || !values.address) {
        setErrors(['Por favor completa la ubicación']);
        return;
      }

      const multimedia = values.multimedia as File[];
      if (multimedia.length === 0) {
        setErrors(['Por favor carga al menos una imagen']);
        return;
      }

      if (!values.contactName || !values.contactPhone || !values.contactEmail) {
        setErrors(['Por favor completa tus datos de contacto']);
        return;
      }

      // Llamar server action para publicar
      console.log('📤 [handleSubmit] Enviando solicitud de venta...');
      console.log('📤 [handleSubmit] Datos a enviar:', {
        title: values.title,
        propertyTypeId: values.propertyTypeId,
        operationType: 'SALE',
        coordinates: values.coordinates,
        multimediaCount: multimedia?.length || 0,
        isAuthenticated: !!session?.accessToken
      });
      
      const payload = {
        title: values.title as string,
        propertyTypeId: values.propertyTypeId as string,
        operationType: 'SALE' as const, // Siempre SALE para venta
        builtSquareMeters: values.builtSquareMeters as number,
        landSquareMeters: values.landSquareMeters as number,
        bedrooms: values.bedrooms as number,
        bathrooms: values.bathrooms as number,
        parkingSpaces: values.parkingSpaces as number,
        floors: values.floors as number,
        constructionYear: values.constructionYear as number,
        price: (values.price as string)?.toString().replace(/[^\d.-]/g, ''),
        currencyPrice: values.currencyPrice as string,
        region: regions.find(r => r.id === values.region)?.label || values.region as string,
        city: comunas.find(c => c.id === values.city)?.label || values.city as string,
        address: values.address as string,
        coordinates: values.coordinates ? {
          latitude: (values.coordinates as { lat: number; lng: number }).lat,
          longitude: (values.coordinates as { lat: number; lng: number }).lng
        } : undefined,
        contactName: values.contactName as string,
        contactPhone: values.contactPhone as string,
        contactEmail: values.contactEmail as string,
        multimediaFiles: multimedia,
      };

      // Si el usuario está autenticado, usar publishProperty para que se asocie a su cuenta
      // De lo contrario, usar publishPropertyPublic
      const result = session?.accessToken 
        ? await publishProperty(payload)
        : await publishPropertyPublic(payload);

      if (!result.success) {
        console.error('❌ Error:', result.error);
        setErrors([result.error || 'Error al enviar la solicitud']);
        return;
      }

      // Éxito: mostrar loading y luego mensaje de éxito
      console.log('✅ Solicitud de venta enviada:', result.data.id);
      
      // Scroll hacia arriba para mostrar el mensaje
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
      // Mostrar loading por 3 segundos antes del mensaje de éxito
      setShowPostSubmitLoading(true);
    } catch (error) {
      console.error('Error submitting sell request:', error);
      setErrors(['Error al enviar la solicitud']);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Build step 1 fields - Información básica (sin características)
  const buildStep1Fields = (): BaseFormField[][] => {
    const rows: BaseFormField[][] = [
      [
        {
          name: 'title',
          label: 'Título de la propiedad',
          type: 'text',
          required: true,
          props: { placeholder: 'Ej: Casa 4D 3B en Las Condes con piscina' }
        }
      ],
      [
        {
          name: 'description',
          label: 'Descripción',
          type: 'textarea',
          props: { 
            placeholder: 'Describe las características principales de tu propiedad...',
            rows: 3
          }
        }
      ],
      [
        {
          name: 'propertyTypeId',
          label: 'Tipo de propiedad',
          type: 'select',
          options: propertyTypes,
          required: true,
          props: { placeholder: 'Selecciona el tipo' }
        }
      ],
    ];

    // Add price and currency in the same row - Precio de venta
    rows.push([
      {
        name: 'price',
        label: 'Precio de venta',
        type: 'currency',
        required: true,
        props: {
          currencyField: 'currencyPrice',
          placeholder: '5.000'
        }
      },
      {
        name: 'currencyPrice',
        label: 'Moneda',
        type: 'select',
        options: [
          { id: 'UF', label: 'UF' },
          { id: 'CLP', label: 'CLP (Pesos)' }
        ],
        required: true
      }
    ]);

    return rows;
  };

  // Build step 2 fields - Características (dinámicas según tipo de propiedad)
  const buildStep2Fields = (): BaseFormField[][] => {
    const rows: BaseFormField[][] = [];

    // Solo mostrar campos si hay un tipo de propiedad seleccionado
    if (!selectedPropertyType || loadingCharacteristics) {
      return [[{
        name: 'noPropertyType',
        label: '',
        type: 'custom',
        renderComponent: () => (
          <div className="text-center py-8 text-muted-foreground">
            {loadingCharacteristics ? (
              <div className="flex flex-col items-center gap-2">
                <div className="flex justify-center"><span className="material-symbols-outlined animate-spin">progress_activity</span></div>
                <span>Cargando características...</span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <span className="material-symbols-outlined text-4xl">info</span>
                <span>Selecciona un tipo de propiedad en el paso anterior para ver las características disponibles.</span>
              </div>
            )}
          </div>
        )
      }]];
    }

    // Agregar características según el tipo de propiedad
    if (selectedPropertyType.hasBuiltSquareMeters) {
      rows.push([{
        name: 'builtSquareMeters',
        label: 'M² construidos',
        type: 'number',
        props: { placeholder: '0', min: 0 }
      }]);
    }

    if (selectedPropertyType.hasLandSquareMeters) {
      rows.push([{
        name: 'landSquareMeters',
        label: 'M² terreno',
        type: 'number',
        props: { placeholder: '0', min: 0 }
      }]);
    }

    if (selectedPropertyType.hasBedrooms) {
      rows.push([{
        name: 'bedrooms',
        label: 'Habitaciones',
        type: 'number',
        props: { placeholder: '0', min: 0 }
      }]);
    }

    if (selectedPropertyType.hasBathrooms) {
      rows.push([{
        name: 'bathrooms',
        label: 'Baños',
        type: 'number',
        props: { placeholder: '0', min: 0 }
      }]);
    }

    if (selectedPropertyType.hasParkingSpaces) {
      rows.push([{
        name: 'parkingSpaces',
        label: 'Estacionamientos',
        type: 'number',
        props: { placeholder: '0', min: 0 }
      }]);
    }

    if (selectedPropertyType.hasFloors) {
      rows.push([{
        name: 'floors',
        label: 'Pisos',
        type: 'number',
        props: { placeholder: '0', min: 0 }
      }]);
    }

    if (selectedPropertyType.hasConstructionYear) {
      rows.push([{
        name: 'constructionYear',
        label: 'Año de construcción',
        type: 'number',
        props: { placeholder: new Date().getFullYear().toString(), min: 1900, max: new Date().getFullYear() }
      }]);
    }

    // Si no hay características para este tipo
    if (rows.length === 0) {
      return [[{
        name: 'noCharacteristics',
        label: '',
        type: 'custom',
        renderComponent: () => (
          <div className="text-center py-8 text-muted-foreground">
            <div className="flex flex-col items-center gap-2">
              <span className="material-symbols-outlined text-green-500" style={{ fontSize: '48px' }}>check_circle</span>
              <span>Este tipo de propiedad no requiere características adicionales.</span>
              <span className="text-sm">Puedes continuar al siguiente paso.</span>
            </div>
          </div>
        )
      }]];
    }

    return rows;
  };

  const step1Fields = buildStep1Fields();
  const step2Fields = buildStep2Fields();

  const step3Fields: BaseFormField[] = [
    {
      name: 'region',
      label: 'Región',
      type: 'select',
      options: regions,
      required: true,
      props: { placeholder: 'Selecciona la región' }
    },
    {
      name: 'city',
      label: 'Comuna',
      type: 'autocomplete',
      options: comunas,
      required: true,
      props: { placeholder: 'Busca la comuna' }
    },
    {
      name: 'address',
      label: 'Dirección',
      type: 'textarea',
      required: true,
      multiline: true,
      rows: 2,
      props: { placeholder: 'Calle Los Aromos 1234, Las Condes' }
    },
    {
      name: 'coordinates',
      label: 'Ubicación en mapa',
      type: 'location',
      props: {
        initialLat: -33.45,  // Santiago por defecto
        initialLng: -70.6667,
        mode: 'edit'
      }
    }
  ];

  const step4Fields: BaseFormField[] = [
    {
      name: 'multimedia',
      label: 'Imágenes de la propiedad',
      type: 'multimedia',
      props: {
        uploadPath: '/properties/multimedia',
        maxFiles: 3,
        maxSize: 10,
        accept: 'image/*',
      }
    }
  ];

  const step5Fields: BaseFormField[] = [
    {
      name: 'contactName',
      label: 'Nombre completo',
      type: 'text',
      required: true,
      props: { 
        placeholder: 'Tu nombre',
        disabled: !!session?.user
      }
    },
    {
      name: 'contactPhone',
      label: 'Teléfono',
      type: 'text',
      required: true,
      props: { 
        placeholder: '+56 9 1234 5678',
        disabled: !!session?.user && !!(session.user as any).phone
      }
    },
    {
      name: 'contactEmail',
      label: 'Correo electrónico',
      type: 'email',
      required: true,
      props: { 
        placeholder: 'tu@email.com',
        disabled: !!session?.user
      }
    }
  ];

  // Generar URL de imagen para preview
  const getPreviewImageUrl = (): string | undefined => {
    const multimedia = values.multimedia as File[];
    if (multimedia && multimedia.length > 0) {
      return URL.createObjectURL(multimedia[0]);
    }
    return undefined;
  };

  const steps: StepperStep[] = [
    {
      title: 'Información básica',
      description: 'Título, tipo de propiedad y precio de venta',
      fields: step1Fields,
    },
    {
      title: 'Características',
      description: 'Define las características de tu propiedad',
      fields: step2Fields,
    },
    {
      title: 'Ubicación',
      description: 'Dónde está ubicada tu propiedad',
      fields: step3Fields,
    },
    {
      title: 'Multimedia',
      description: 'Carga imágenes de tu propiedad (máximo 3)',
      fields: step4Fields,
    },
    {
      title: 'Datos de contacto',
      description: session?.user 
        ? 'Confirmamos tus datos de contacto registrados en tu cuenta' 
        : 'Cómo pueden contactarte los interesados',
      fields: step5Fields,
    },
    {
      title: 'Resumen',
      description: 'Revisa la información antes de enviar',
      renderContent: () => {
        const locationStr = [
          comunas.find(c => c.id === values.city)?.label,
          regions.find(r => r.id === values.region)?.label
        ].filter(Boolean).join(', ');

        return (
          <div className="space-y-4">
            <Alert variant="info">
              Revisa la información de tu propiedad antes de enviar la solicitud. Tu propiedad será revisada por nuestro equipo antes de ser publicada.
            </Alert>

            {/* Tarjeta de preview personalizada */}
            <div className="flex justify-center">
              <div className="w-full max-w-md">
                <PropertyPreviewCard
                  title={values.title}
                  operationType="SALE"
                  price={parseFloat((values.price || '0').replace(/\./g, '').replace(/,/g, '')) || 0}
                  currencyPrice={(values.currencyPrice || 'UF') as 'CLP' | 'UF'}
                  location={locationStr}
                  propertyTypeName={selectedPropertyType?.name}
                  bedrooms={values.bedrooms}
                  bathrooms={values.bathrooms}
                  builtSquareMeters={values.builtSquareMeters}
                  landSquareMeters={values.landSquareMeters}
                  parkingSpaces={values.parkingSpaces}
                  imageUrl={getPreviewImageUrl()}
                  propertyType={selectedPropertyType}
                />
              </div>
            </div>

            {/* Descripción si existe */}
            {values.description && (
              <div className="bg-white p-3 rounded-lg border">
                <h5 className="text-base font-semibold mb-1">Descripción</h5>
                <p className="text-gray-700 text-sm">{values.description}</p>
              </div>
            )}

            {/* Dirección aparte */}
            <div className="bg-white p-3 rounded-lg border">
              <h5 className="text-base font-semibold mb-1">Dirección</h5>
              <p className="text-gray-700 text-sm">{values.address || 'No especificada'}</p>
            </div>

            {/* Mapa de ubicación */}
            {values.coordinates && (
              <LocationPreview
                latitude={values.coordinates.lat}
                longitude={values.coordinates.lng}
              />
            )}

            {/* Otros datos adicionales - solo mostrar si hay elementos */}
            {((selectedPropertyType?.hasConstructionYear && values.constructionYear > 0) ||
              (selectedPropertyType?.hasFloors && values.floors > 0)) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {selectedPropertyType?.hasConstructionYear && values.constructionYear > 0 && (
                  <div className="bg-white p-3 rounded-lg border">
                    <h5 className="text-base font-semibold mb-1">Año de construcción</h5>
                    <p className="text-gray-700 text-sm">{values.constructionYear}</p>
                  </div>
                )}

                {selectedPropertyType?.hasFloors && values.floors > 0 && (
                  <div className="bg-white p-3 rounded-lg border">
                    <h5 className="text-base font-semibold mb-1">Número de pisos</h5>
                    <p className="text-gray-700 text-sm">{values.floors}</p>
                  </div>
                )}
              </div>
            )}

            {/* Datos de contacto */}
            <div className="bg-white p-3 rounded-lg border">
              <h5 className="text-base font-semibold mb-1">Datos de contacto</h5>
              <div className="space-y-1">
                <p className="text-gray-700 text-sm"><strong>Nombre:</strong> {values.contactName || 'No especificado'}</p>
                <p className="text-gray-700 text-sm"><strong>Teléfono:</strong> {values.contactPhone || 'No especificado'}</p>
                <p className="text-gray-700 text-sm"><strong>Email:</strong> {values.contactEmail || 'No especificado'}</p>
              </div>
            </div>
          </div>
        );
      }
    }
  ];

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {showPostSubmitLoading ? (
          // Loading después del envío exitoso
          <div className="flex flex-col items-center justify-center min-h-[400px] space-y-6">
            <div className="flex justify-center"><span className="material-symbols-outlined animate-spin">progress_activity</span></div>
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-foreground">Procesando tu solicitud...</h2>
              <p className="text-muted-foreground">
                Tu propiedad está siendo enviada para revisión. Esto tomará solo un momento.
              </p>
            </div>
          </div>
        ) : showSuccessMessage ? (
          // Mensaje de éxito
          <div className="flex flex-col items-center justify-center min-h-[400px] space-y-6">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <span className="material-symbols-outlined text-green-600" style={{ fontSize: '32px' }}>
                  check_circle
                </span>
              </div>
              <h2 className="text-3xl font-bold text-foreground">¡Solicitud enviada correctamente!</h2>
              <p className="text-lg text-muted-foreground max-w-md">
                Tu solicitud de venta ha sido recibida y será revisada por nuestro equipo en las próximas horas.
                Te notificaremos cuando tu propiedad esté disponible en el portal.
              </p>
              <div className="pt-4">
                <Button
                  onClick={() => router.push('/portal')}
                  className="px-8 py-3"
                >
                  Volver al inicio
                </Button>
              </div>
            </div>
          </div>
        ) : (
          // Stepper normal
          <StepperBaseForm
            title="Publica tu propiedad en venta"
            subtitle="Completa los 6 pasos para publicar tu propiedad"
            steps={steps}
            values={values}
            onChange={handleChange}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            submitLabel="Enviar solicitud"
            errors={errors}
            columns={2}
          />
        )}
      </div>
    </div>
  );
}
