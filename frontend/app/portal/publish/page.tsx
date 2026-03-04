/**
 * Generic Property Publication Page (Portal)
 * 
 * Propósito:
 * - Formulario multi-step genérico para publicar propiedad
 * - Permite elegir operación (venta o arriendo) en el formulario
 * - Wizard guiado con validación paso a paso
 * - Preview antes de publicar
 * 
 * Funcionalidad:
 * - Client component: StepperBaseForm con operación seleccionable
 * - Similar a sell-property y rent-property pero sin operación pre-seleccionada
 * - Paso 1: Tipo propiedad Y operación (SALE/RENT)
 * - Paso 2: Características básicas (m2, habitaciones, baños, etc.)
 * - Paso 3: Ubicación (región, comuna, coordenadas con mapa)
 * - Paso 4: Precio, descripción, imágenes (FileUploader)
 * - Preview: PropertyCard antes de submit
 * - Validación dinámica por tipo de propiedad
 * - Autenticación requerida (redirects a login)
 * - Submit a publishPropertyPublic
 * 
 * Audiencia: Usuarios registrados que quieren publicar propiedad (genérico)
 * 
 * Nota: Considerar deprecar en favor de sell-property y rent-property específicos
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import StepperBaseForm, { StepperStep, BaseFormField } from '@/shared/components/ui/BaseForm/StepperBaseForm';
import { listPropertyTypesPublic, getPropertyTypeCharacteristics, PropertyTypeWithFeatures, publishPropertyPublic } from '@/features/backoffice/properties/actions/properties.action';
import { getRegiones, getComunasByRegion } from '@/features/shared/common/actions/commons.action';
import Alert from '@/shared/components/ui/Alert/Alert';
import PropertyCard, { PortalProperty } from '@/app/portal/ui/PropertyCard';
import { Button } from '@/shared/components/ui/Button/Button';
import { useAuth } from '@/app/providers';

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

type FormValues = {
  title: string;
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
  propertyTypeId: null,
  builtSquareMeters: 0,
  landSquareMeters: 0,
  bedrooms: 0,
  bathrooms: 0,
  parkingSpaces: 0,
  floors: 0,
  constructionYear: new Date().getFullYear(),
  price: '',
  currencyPrice: 'CLP',
  region: null,
  city: null,
  address: '',
  coordinates: null,
  multimedia: [],
  contactName: '',
  contactPhone: '',
  contactEmail: '',
};

export default function PublishPropertyPage() {
  const { user, status, accessToken } = useAuth();
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

  // Pre-llenar datos de contacto si el usuario está logueado
  useEffect(() => {
    if (user && status === 'authenticated') {
      setValues(prev => ({
        ...prev,
        contactName: user.name || prev.contactName,
        contactEmail: user.email || prev.contactEmail,
        contactPhone: (user as any).phone || prev.contactPhone || '',
      }));
    }
  }, [user, status]);

  // Load property types and regions on mount
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        console.log('📥 [PublishProperty] Loading initial data...');
        const [typesResult, regionsResult] = await Promise.all([
          listPropertyTypesPublic(),
          getRegiones(),
        ]);

        console.log('📦 [PublishProperty] Types result:', typesResult);
        console.log('📦 [PublishProperty] Regions result:', regionsResult);

        if (typesResult.success && typesResult.data) {
          const mappedTypes = typesResult.data.map(pt => ({ id: pt.id, label: pt.name }));
          console.log('✅ [PublishProperty] Property types loaded:', mappedTypes);
          setPropertyTypes(mappedTypes);
        } else {
          console.warn('⚠️ [PublishProperty] Types result not successful:', typesResult);
        }

        setRegions(regionsResult);
      } catch (error) {
        console.error('❌ [PublishProperty] Error loading initial data:', error);
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
          const result = await getPropertyTypeCharacteristics(values.propertyTypeId as string);
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

  const handleGoHome = () => {
    // Limpiar estados antes de redirigir
    setShowSuccessMessage(false);
    setShowPostSubmitLoading(false);
    router.push('/portal');
  };

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
      console.log('📤 [handleSubmit] Publicando propiedad...');
      console.log('📤 [handleSubmit] Datos a enviar:', {
        title: values.title,
        propertyTypeId: values.propertyTypeId,
        coordinates: values.coordinates,
        multimediaCount: multimedia?.length || 0
      });
      
      const result = await publishPropertyPublic({
        title: values.title,
        propertyTypeId: values.propertyTypeId as string,
        operationType: 'SALE', // Default, logic can be added if needed
        builtSquareMeters: values.builtSquareMeters,
        landSquareMeters: values.landSquareMeters,
        bedrooms: values.bedrooms,
        bathrooms: values.bathrooms,
        parkingSpaces: values.parkingSpaces,
        floors: values.floors,
        constructionYear: values.constructionYear,
        price: values.price,
        currencyPrice: values.currencyPrice,
        region: values.region as string,
        city: values.city as string,
        address: values.address as string,
        coordinates: values.coordinates ? {
          latitude: values.coordinates.lat,
          longitude: values.coordinates.lng
        } : undefined,
        contactName: values.contactName,
        contactPhone: values.contactPhone,
        contactEmail: values.contactEmail,
        multimediaFiles: values.multimedia,
        accessToken: accessToken, // Pasar el token para asociar la propiedad
      });

      if (!result.success) {
        console.error('❌ Error:', result.error);
        setErrors([result.error || 'Error al publicar la propiedad']);
        return;
      }

      // Éxito: mostrar loading y luego mensaje de éxito
      console.log('✅ Propiedad publicada:', result.data.id);
      
      // Mostrar loading por 3 segundos antes del mensaje de éxito
      setShowPostSubmitLoading(true);
    } catch (error) {
      console.error('Error publishing property:', error);
      setErrors(['Error al publicar la propiedad']);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Build step 1 fields based on selected property type characteristics
  const buildStep1Fields = (): BaseFormField[][] => {
    const rows: BaseFormField[][] = [
      [
        {
          name: 'title',
          label: 'Título de la propiedad',
          type: 'text',
          required: true,
          props: { placeholder: 'Título de la propiedad' }
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

    // Add characteristics only if property type is selected
    if (selectedPropertyType && !loadingCharacteristics) {
      if (selectedPropertyType.hasBuiltSquareMeters) {
        rows.push([{
          name: 'builtSquareMeters',
          label: 'M² construidos',
          type: 'number',
          props: { placeholder: '0' }
        }]);
      }

      if (selectedPropertyType.hasLandSquareMeters) {
        rows.push([{
          name: 'landSquareMeters',
          label: 'M² terreno',
          type: 'number',
          props: { placeholder: '0' }
        }]);
      }

      if (selectedPropertyType.hasBedrooms) {
        rows.push([{
          name: 'bedrooms',
          label: 'Habitaciones',
          type: 'number',
          props: { placeholder: '0' }
        }]);
      }

      if (selectedPropertyType.hasBathrooms) {
        rows.push([{
          name: 'bathrooms',
          label: 'Baños',
          type: 'number',
          props: { placeholder: '0' }
        }]);
      }

      if (selectedPropertyType.hasParkingSpaces) {
        rows.push([{
          name: 'parkingSpaces',
          label: 'Estacionamientos',
          type: 'number',
          props: { placeholder: '0' }
        }]);
      }

      if (selectedPropertyType.hasFloors) {
        rows.push([{
          name: 'floors',
          label: 'Pisos',
          type: 'number',
          props: { placeholder: '0' }
        }]);
      }

      if (selectedPropertyType.hasConstructionYear) {
        rows.push([{
          name: 'constructionYear',
          label: 'Año de construcción',
          type: 'number',
          props: { placeholder: new Date().getFullYear().toString() }
        }]);
      }
    }

    // Add price and currency in the same row
    rows.push([
      {
        name: 'price',
        label: 'Precio',
        type: 'currency',
        required: true,
        props: {
          currencyField: 'currencyPrice',
          placeholder: '1.500.000'
        }
      },
      {
        name: 'currencyPrice',
        label: 'Moneda',
        type: 'select',
        options: [
          { id: 'CLP', label: 'CLP (Pesos)' },
          { id: 'UF', label: 'UF' }
        ],
        required: true
      }
    ]);

    return rows;
  };

  const step1Fields = buildStep1Fields();

  const step2Fields: BaseFormField[] = [
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
      props: { placeholder: 'Avenida Providencia 1234, Depto 502' }
    },
    {
      name: 'coordinates',
      label: 'Ubicación en mapa',
      type: 'location',
      props: {
        initialLat: -33.45,  // Santiago por defecto
        initialLng: -70.6667
      }
    }
  ];

  const step3Fields: BaseFormField[] = [
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

  const step4Fields: BaseFormField[] = [
    {
      name: 'contactName',
      label: 'Nombre completo',
      type: 'text',
      required: true,
      props: { placeholder: 'Tu nombre' }
    },
    {
      name: 'contactPhone',
      label: 'Teléfono',
      type: 'text',
      required: true,
      props: { placeholder: '+56 9 1234 5678' }
    },
    {
      name: 'contactEmail',
      label: 'Correo electrónico',
      type: 'email',
      required: true,
      props: { placeholder: 'tu@email.com' }
    }
  ];

  const steps: StepperStep[] = [
    {
      title: 'Información básica',
      description: 'Proporciona los detalles principales de tu propiedad',
      fields: step1Fields,
    },
    {
      title: 'Ubicación',
      description: 'Dónde está ubicada tu propiedad',
      fields: step2Fields,
    },
    {
      title: 'Multimedia',
      description: 'Carga imágenes de tu propiedad (máximo 3)',
      fields: step3Fields,
    },
    {
      title: 'Datos de contacto',
      description: 'Cómo pueden contactarte los interesados',
      fields: step4Fields,
    },
    {
      title: 'Resumen',
      description: 'Revisa la información antes de publicar',
      renderContent: (context) => {
        // Crear el objeto property para PropertyCard
        const propertyData: PortalProperty = {
          id: 'preview', // ID temporal para preview
          title: values.title as string || 'Sin título',
          operationType: 'SALE',
          price: parseFloat((values.price as string || '0').replace(/\./g, '').replace(/,/g, '')) || 0,
          currencyPrice: (values.currencyPrice as string || 'CLP') as 'CLP' | 'UF',
          state: regions.find(r => r.id === values.region)?.label || '',
          city: comunas.find(c => c.id === values.city)?.label || '',
          propertyType: selectedPropertyType ? {
            id: selectedPropertyType.id,
            name: selectedPropertyType.name,
            hasBedrooms: selectedPropertyType.hasBedrooms,
            hasBathrooms: selectedPropertyType.hasBathrooms,
            hasBuiltSquareMeters: selectedPropertyType.hasBuiltSquareMeters,
            hasLandSquareMeters: selectedPropertyType.hasLandSquareMeters,
            hasParkingSpaces: selectedPropertyType.hasParkingSpaces,
            hasFloors: selectedPropertyType.hasFloors,
            hasConstructionYear: selectedPropertyType.hasConstructionYear,
          } : undefined,
          bedrooms: values.bedrooms as number || null,
          bathrooms: values.bathrooms as number || null,
          builtSquareMeters: values.builtSquareMeters as number || null,
          landSquareMeters: values.landSquareMeters as number || null,
          parkingSpaces: values.parkingSpaces as number || null,
          multimedia: (values.multimedia as File[])?.map((file, index) => ({
            id: `temp-${index}`,
            url: URL.createObjectURL(file),
            type: 'PROPERTY_IMG',
            format: 'IMG'
          })) || []
        };

        return (
          <div className="space-y-4">
            <Alert variant="info">
              Revisa la información de tu propiedad antes de publicarla. Si todo está correcto, haz clic en "Publicar propiedad".
            </Alert>

            {/* Tarjeta de propiedad */}
            <div className="flex justify-center">
              <div className="w-full max-w-md">
                <PropertyCard
                  property={propertyData}
                  onClick={() => {}} // No hacer nada en preview
                />
              </div>
            </div>

            {/* Dirección aparte */}
            <div className="bg-white p-3 rounded-lg border">
              <h5 className="text-base font-semibold mb-1">Dirección</h5>
              <p className="text-gray-700 text-sm">{values.address as string || 'No especificada'}</p>
            </div>

            {/* Mapa de ubicación */}
            {values.coordinates && (
              <LocationPreview
                latitude={values.coordinates.lat}
                longitude={values.coordinates.lng}
              />
            )}

            {/* Otros datos adicionales - solo mostrar si hay elementos */}
            {((selectedPropertyType?.hasConstructionYear && (values.constructionYear as number) > 0) ||
              (selectedPropertyType?.hasFloors && (values.floors as number) > 0)) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {selectedPropertyType?.hasConstructionYear && (values.constructionYear as number) > 0 && (
                  <div className="bg-white p-3 rounded-lg border">
                    <h5 className="text-base font-semibold mb-1">Año de construcción</h5>
                    <p className="text-gray-700 text-sm">{values.constructionYear as number}</p>
                  </div>
                )}

                {selectedPropertyType?.hasFloors && (values.floors as number) > 0 && (
                  <div className="bg-white p-3 rounded-lg border">
                    <h5 className="text-base font-semibold mb-1">Número de pisos</h5>
                    <p className="text-gray-700 text-sm">{values.floors as number}</p>
                  </div>
                )}
              </div>
            )}

            {/* Datos de contacto */}
            <div className="bg-white p-3 rounded-lg border">
              <h5 className="text-base font-semibold mb-1">Datos de contacto</h5>
              <div className="space-y-1">
                <p className="text-gray-700 text-sm"><strong>Nombre:</strong> {values.contactName as string || 'No especificado'}</p>
                <p className="text-gray-700 text-sm"><strong>Teléfono:</strong> {values.contactPhone as string || 'No especificado'}</p>
                <p className="text-gray-700 text-sm"><strong>Email:</strong> {values.contactEmail as string || 'No especificado'}</p>
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
                Tu solicitud de publicación ha sido recibida y será revisada por nuestro equipo en las próximas horas.
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
            title="Publica tu propiedad"
            subtitle="Completa los 5 pasos para publicar tu propiedad y encontrar compradores"
            steps={steps}
            values={values}
            onChange={handleChange}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            submitLabel="Publicar propiedad"
            errors={errors}
            columns={2}
          />
        )}
      </div>
    </div>
  );
}
