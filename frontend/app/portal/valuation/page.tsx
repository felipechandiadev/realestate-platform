/**
 * Property Valuation Page (Portal - ML Prediction)
 * 
 * Propósito:
 * - Herramienta de tasación automática de propiedades
 * - Predicción de precio usando Machine Learning
 * - Lead generation: captura datos de usuarios interesados
 * - Valor agregado para visitantes antes de publicar
 * 
 * Funcionalidad:
 * - Client component: StepperBaseForm con wizard guiado
 * - Paso 1: Operación (venta/arriendo) y tipo de propiedad
 * - Paso 2: Ubicación (región, comuna)
 * - Paso 3: Características (m2, habitaciones, baños)
 * - Submit a predictPropertyValue (ML model)
 * - Resultado: precio predicho + rango de confianza
 * - Diálogo final con opción de publicar propiedad
 * - Loading states durante predicción
 * - Autenticación requerida (redirects a login)
 * 
 * Audiencia: Propietarios interesados en conocer valor de mercado, leads potenciales
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import StepperBaseForm, { StepperStep, BaseFormField } from '@/shared/components/ui/BaseForm/StepperBaseForm';
import Alert from '@/shared/components/ui/Alert/Alert';
import { Button } from '@/shared/components/ui/Button/Button';
import Dialog from '@/shared/components/ui/Dialog/Dialog';
import { TextField } from '@/shared/components/ui/TextField/TextField';
import { useAlert } from '@/shared/hooks/useAlert';
import { getRegiones, getComunasByRegion } from '@/features/shared/common/actions/commons.action';
import { listPropertyTypesPublic, PropertyTypeWithFeatures, getPropertyTypeCharacteristicsPublic, publishPropertyPublic } from '@/features/backoffice/properties/actions/properties.action';
import { predictPropertyValue, PredictPropertyResult } from '@/features/shared/predictions/actions/predict.action';
import { useAuth } from '@/app/providers';

// ========================================
// Types
// ========================================
type PredictionResult = PredictPropertyResult;

type FormValues = {
  operacion: 'SALE' | 'RENTAL';
  tipo_propiedad: string | null;
  region: string | null;
  comuna: string | null;
  m2_construidos: number;
  m2_terreno: number;
  habitaciones: number;
  banos: number;
};

const INITIAL_VALUES: FormValues = {
  operacion: 'SALE',
  tipo_propiedad: null,
  region: null,
  comuna: null,
  m2_construidos: 80,
  m2_terreno: 0,
  habitaciones: 2,
  banos: 1,
};

const parseOptionalNumber = (input: unknown): number | undefined => {
  if (typeof input === 'number') {
    return Number.isFinite(input) ? input : undefined;
  }

  if (typeof input === 'string') {
    const trimmed = input.trim();
    if (!trimmed) {
      return undefined;
    }

    const parsed = Number(trimmed);
    return Number.isFinite(parsed) ? parsed : undefined;
  }

  return undefined;
};

// Mapeo de IDs de tipos de propiedad a nombres para el modelo
const PROPERTY_TYPE_MAP: Record<string, string> = {
  'departamento': 'Departamento',
  'casa': 'Casa',
  'oficina': 'Oficina',
  'terreno': 'Terreno',
  'estacionamiento': 'Estacionamiento',
  'bodega': 'Bodega',
  'local-comercial': 'Local Comercial',
  'parcela': 'Parcela',
};

// ========================================
// Result Card Component
// ========================================
interface ValuationResultCardProps {
  result: PredictionResult;
  propertyType: string;
  location: string;
  characteristics: {
    m2: number;
    habitaciones: number;
    banos: number;
  };
  onPublish: () => void;
  onNewValuation: () => void;
}

function ValuationResultCard({
  result,
  propertyType,
  location,
  characteristics,
  onPublish,
  onNewValuation,
}: ValuationResultCardProps) {
  const isRental = result.operacion === 'RENTAL';
  const confidencePercentage = Math.round(result.confianza * 100);

  return (
    <div className="bg-card rounded-xl overflow-hidden border border-border shadow-lg">
      {/* Header con gradiente */}
      <div className={`p-6 ${isRental ? 'bg-gradient-to-r from-blue-500 to-blue-600' : 'bg-gradient-to-r from-green-500 to-green-600'} text-white`}>
        <div className="text-center">
          <p className="text-sm uppercase tracking-wider opacity-90 mb-1">
            Valor estimado de {isRental ? 'arriendo mensual' : 'venta'}
          </p>
          <h2 className="text-4xl font-bold">{result.valor_formateado}</h2>
          <p className="text-sm opacity-90 mt-1">{result.rango_formateado}</p>
        </div>
      </div>

      {/* Contenido */}
      <div className="p-6 space-y-4">
        {/* Badge de confianza */}
        <div className="flex items-center justify-center gap-2">
          <span className="text-sm text-muted-foreground">Nivel de confianza:</span>
          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
            confidencePercentage >= 90 ? 'bg-green-100 text-green-700' :
            confidencePercentage >= 75 ? 'bg-blue-100 text-blue-700' :
            'bg-yellow-100 text-yellow-700'
          }`}>
            {confidencePercentage}%
          </span>
        </div>

        {/* Detalles de la propiedad */}
        <div className="bg-muted/50 rounded-lg p-4 space-y-3">
          <h4 className="font-semibold text-foreground">Detalles de la propiedad</h4>
          
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <span className="material-symbols-rounded text-primary text-lg">home</span>
              <span>{propertyType}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-rounded text-primary text-lg">location_on</span>
              <span>{location}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-rounded text-primary text-lg">home</span>
              <span>{characteristics.m2} m²</span>
            </div>
            {characteristics.habitaciones > 0 && (
              <div className="flex items-center gap-2">
                <span className="material-symbols-rounded text-primary text-lg">bed</span>
                <span>{characteristics.habitaciones} hab.</span>
              </div>
            )}
            {characteristics.banos > 0 && (
              <div className="flex items-center gap-2">
                <span className="material-symbols-rounded text-primary text-lg">bathtub</span>
                <span>{characteristics.banos} baños</span>
              </div>
            )}
          </div>
        </div>

        {/* Call to action */}
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined text-primary text-2xl">lightbulb</span>
            <div>
              <h5 className="font-semibold text-foreground">¿Te interesa publicar tu propiedad?</h5>
              <p className="text-sm text-muted-foreground mt-1">
                {isRental 
                  ? 'Publica tu propiedad en arriendo y encuentra al inquilino ideal.'
                  : 'Publica tu propiedad en venta y conecta con compradores interesados.'
                }
              </p>
            </div>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Button
            onClick={onPublish}
            className="flex-1"
          >
            <span className="material-symbols-outlined mr-2">publish</span>
            Publicar propiedad
          </Button>
          <Button
            variant="outlined"
            onClick={onNewValuation}
            className="flex-1"
          >
            <span className="material-symbols-outlined mr-2">refresh</span>
            Nueva valoración
          </Button>
        </div>
      </div>
    </div>
  );
}

// ========================================
// Main Component
// ========================================
export default function ValoracionPage() {
  const router = useRouter();
  const { showAlert } = useAlert();
  const { user, status, accessToken } = useAuth();
  
  const [values, setValues] = useState<FormValues>(INITIAL_VALUES);
  const [propertyTypes, setPropertyTypes] = useState<Array<{ id: string; label: string }>>([]);
  const [selectedPropertyType, setSelectedPropertyType] = useState<PropertyTypeWithFeatures | null>(null);
  const [regions, setRegions] = useState<Array<{ id: string; label: string }>>([]);
  const [comunas, setComunas] = useState<Array<{ id: string; label: string }>>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [predictionResult, setPredictionResult] = useState<PredictionResult | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [loadingCharacteristics, setLoadingCharacteristics] = useState(false);

  // Load property types and regions on mount
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [typesResult, regionsResult] = await Promise.all([
          listPropertyTypesPublic(),
          getRegiones(),
        ]);

        if (typesResult.success && typesResult.data) {
          const mappedTypes = typesResult.data.map(pt => ({ id: pt.id, label: pt.name }));
          setPropertyTypes(mappedTypes);
        }

        setRegions(regionsResult);
      } catch (error) {
        console.error('Error loading initial data:', error);
        showAlert({ message: 'Error cargando datos iniciales', type: 'error' });
      }
    };

    loadInitialData();
  }, [showAlert]);

  // Load property type characteristics when propertyTypeId changes
  useEffect(() => {
    if (values.tipo_propiedad) {
      const loadCharacteristics = async () => {
        setLoadingCharacteristics(true);
        try {
          const result = await getPropertyTypeCharacteristicsPublic(values.tipo_propiedad as string);
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
  }, [values.tipo_propiedad]);

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

  const handleChange = (field: string, value: unknown) => {
    setValues(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      setErrors([]);

      // Validaciones
      if (!values.tipo_propiedad) {
        setErrors(['Por favor selecciona un tipo de propiedad']);
        return;
      }

      if (!values.region || !values.comuna) {
        setErrors(['Por favor selecciona la ubicación']);
        return;
      }

      const builtSquareMeters = parseOptionalNumber(values.m2_construidos);
      if (!builtSquareMeters || builtSquareMeters <= 0) {
        setErrors(['Por favor ingresa los metros cuadrados']);
        return;
      }

      const landSquareMetersRaw = parseOptionalNumber(values.m2_terreno);
      const landSquareMeters = landSquareMetersRaw && landSquareMetersRaw >= 1 ? landSquareMetersRaw : undefined;

      // Obtener nombre del tipo de propiedad para el modelo
      const selectedType = propertyTypes.find(pt => pt.id === values.tipo_propiedad);
      const tipoNombre = selectedType?.label || 'Departamento';

      // Obtener nombre de la región
      const selectedRegion = regions.find(r => r.id === values.region);
      const regionNombre = selectedRegion?.label || 'Metropolitana';

      // Obtener nombre de la comuna
      const selectedComuna = comunas.find(c => c.id === values.comuna);
      const comunaNombre = selectedComuna?.label || '';

      // Artificial delay to give "processing" feel (minimum 3 seconds)
      const startTime = Date.now();

      // Llamar al server action de predicción
      const result = await predictPropertyValue({
        operacion: values.operacion,
        region: regionNombre,
        comuna: comunaNombre,
        tipo_propiedad: tipoNombre,
        habitaciones: values.habitaciones,
        banos: values.banos,
        m2_construidos: builtSquareMeters,
        m2_terreno: landSquareMeters ?? builtSquareMeters,
      });

      if (!result.success || !result.data) {
        throw new Error(result.error || 'Error en la predicción');
      }

      // Ensure at least 3 seconds of loading for user experience
      const endTime = Date.now();
      const elapsed = endTime - startTime;
      const minDuration = 3000;
      if (elapsed < minDuration) {
        await new Promise(resolve => setTimeout(resolve, minDuration - elapsed));
      }

      setPredictionResult(result.data);
      
      showAlert({ 
        message: '¡Valoración completada exitosamente!', 
        type: 'success',
        duration: 3000 
      });

    } catch (error) {
      console.error('Error en predicción:', error);
      setErrors(['Error al realizar la valoración. Por favor intenta de nuevo.']);
      showAlert({ message: 'Error al realizar la valoración', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Estado para el diálogo de publicación
  const [showPublishDialog, setShowPublishDialog] = useState(false);
  const [contactData, setContactData] = useState({
    contactName: '',
    contactPhone: '',
    contactEmail: '',
  });
  const [isPublishing, setIsPublishing] = useState(false);
  const [contactErrors, setContactErrors] = useState<string[]>([]);

  // Pre-llenar datos de contacto si el usuario está logueado
  useEffect(() => {
    if (user && status === 'authenticated') {
      setContactData({
        contactName: user.name || '',
        contactPhone: (user as any).phone || '',
        contactEmail: user.email || '',
      });
    }
  }, [user, status]);

  const handlePublish = () => {
    // Mostrar diálogo para solicitar datos de contacto
    setShowPublishDialog(true);
    setContactErrors([]);
  };

  const handleContactChange = (field: string, value: string) => {
    setContactData(prev => ({ ...prev, [field]: value }));
  };

  const handleConfirmPublish = async () => {
    try {
      // Validar datos de contacto
      const errors: string[] = [];
      if (!contactData.contactName.trim()) {
        errors.push('El nombre es requerido');
      }
      if (!contactData.contactPhone.trim()) {
        errors.push('El teléfono es requerido');
      }
      if (!contactData.contactEmail.trim()) {
        errors.push('El correo electrónico es requerido');
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactData.contactEmail)) {
        errors.push('El correo electrónico no es válido');
      }

      if (errors.length > 0) {
        setContactErrors(errors);
        return;
      }

      setIsPublishing(true);
      setContactErrors([]);

      // Obtener datos de la valoración
      const selectedType = propertyTypes.find(pt => pt.id === values.tipo_propiedad);
      const selectedRegion = regions.find(r => r.id === values.region);
      const selectedComuna = comunas.find(c => c.id === values.comuna);

      // Construir título automático
      const operationLabel = values.operacion === 'RENTAL' ? 'Arriendo' : 'Venta';
      const title = `Valoración - ${selectedType?.label || 'Propiedad'} en ${operationLabel} ${selectedComuna?.label || ''}`;

      // Usar el precio estimado de la valoración
      const estimatedPrice = predictionResult?.valor_estimado || 0;
      const isRental = values.operacion === 'RENTAL';

      const builtSquareMeters = parseOptionalNumber(values.m2_construidos) ?? 0;
      const landSquareMetersRaw = parseOptionalNumber(values.m2_terreno);
      const landSquareMeters = landSquareMetersRaw && landSquareMetersRaw >= 1 ? landSquareMetersRaw : undefined;

      // Crear la solicitud de publicación
      const result = await publishPropertyPublic({
        title,
        propertyTypeId: values.tipo_propiedad || '',
        operationType: values.operacion === 'RENTAL' ? 'RENT' : 'SALE',
        builtSquareMeters,
        landSquareMeters,
        bedrooms: values.habitaciones || undefined,
        bathrooms: values.banos || undefined,
        price: estimatedPrice.toString(),
        currencyPrice: isRental ? 'CLP' : 'UF',
        region: selectedRegion?.label || '',
        city: selectedComuna?.label || '',
        address: `${selectedComuna?.label || ''}, ${selectedRegion?.label || ''}`,
        contactName: contactData.contactName,
        contactPhone: contactData.contactPhone,
        contactEmail: contactData.contactEmail,
        accessToken, // Pasar el token si existe
      });

      if (result.success) {
        setShowPublishDialog(false);
        showAlert({
          message: '¡Solicitud de publicación enviada exitosamente! Nos pondremos en contacto contigo pronto.',
          type: 'success',
          duration: 5000,
        });
        // Redirigir al portal después de un momento
        setTimeout(() => {
          router.push('/portal');
        }, 2000);
      } else {
        setContactErrors([result.error || 'Error al enviar la solicitud']);
      }
    } catch (error) {
      console.error('Error al publicar:', error);
      setContactErrors(['Error al enviar la solicitud. Por favor intenta de nuevo.']);
    } finally {
      setIsPublishing(false);
    }
  };

  const handleNewValuation = () => {
    setPredictionResult(null);
    setValues(INITIAL_VALUES);
  };

  // Step 1: Tipo de operación y propiedad
  const step1Fields: BaseFormField[][] = [
    [
      {
        name: 'operacion',
        label: '¿Qué quieres hacer con tu propiedad?',
        type: 'select',
        options: [
          { id: 'SALE', label: 'Vender' },
          { id: 'RENTAL', label: 'Arrendar' },
        ],
        required: true,
      },
    ],
    [
      {
        name: 'tipo_propiedad',
        label: 'Tipo de propiedad',
        type: 'select',
        options: propertyTypes,
        required: true,
        props: { placeholder: 'Selecciona el tipo' },
      },
    ],
  ];

  // Step 2: Ubicación
  const step2Fields: BaseFormField[][] = [
    [
      {
        name: 'region',
        label: 'Región',
        type: 'select',
        options: regions,
        required: true,
        props: { placeholder: 'Selecciona la región' },
      },
    ],
    [
      {
        name: 'comuna',
        label: 'Comuna',
        type: 'autocomplete',
        options: comunas,
        required: true,
        props: { placeholder: 'Busca la comuna' },
      },
    ],
  ];

  // Step 3: Características (dinámicas según tipo de propiedad)
  const buildStep3Fields = (): BaseFormField[][] => {
    const rows: BaseFormField[][] = [];

    // Si no hay tipo de propiedad seleccionado
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
                <span>Selecciona un tipo de propiedad en el primer paso para ver las características disponibles.</span>
              </div>
            )}
          </div>
        ),
      }]];
    }

    // Siempre mostrar m2 construidos
    rows.push([{
      name: 'm2_construidos',
      label: 'M² construidos',
      type: 'number',
      required: true,
      props: { placeholder: '80', min: 10, max: 10000 },
    }]);

    // M2 terreno si aplica
    if (selectedPropertyType.hasLandSquareMeters) {
      rows.push([{
        name: 'm2_terreno',
        label: 'M² terreno',
        type: 'number',
        props: { placeholder: '0', min: 0 },
      }]);
    }

    // Habitaciones si aplica
    if (selectedPropertyType.hasBedrooms) {
      rows.push([{
        name: 'habitaciones',
        label: 'Habitaciones',
        type: 'number',
        props: { placeholder: '2', min: 0, max: 20 },
      }]);
    }

    // Baños si aplica
    if (selectedPropertyType.hasBathrooms) {
      rows.push([{
        name: 'banos',
        label: 'Baños',
        type: 'number',
        props: { placeholder: '1', min: 0, max: 10 },
      }]);
    }

    return rows;
  };

  const step3Fields = buildStep3Fields();

  // Steps definition
  const steps: StepperStep[] = [
    {
      title: 'Tipo de propiedad',
      description: '¿Qué tipo de propiedad quieres valorar?',
      fields: step1Fields,
    },
    {
      title: 'Ubicación',
      description: '¿Dónde está ubicada tu propiedad?',
      fields: step2Fields,
    },
    {
      title: 'Características',
      description: 'Cuéntanos sobre tu propiedad',
      fields: step3Fields,
    },
  ];

  // Vista de procesamiento de datos (Loading View)
  if (isSubmitting) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-8">
          <div className="flex flex-col items-center justify-center">
            <div className="relative mb-4">
              <div className="flex justify-center"><span className="material-symbols-outlined animate-spin">progress_activity</span></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="material-symbols-outlined text-4xl text-primary animate-pulse">
                  calculate
                </span>
              </div>
            </div>
            <div className="h-2 w-48 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-primary animate-pulse w-full"></div>
            </div>
          </div>
          
          <div className="space-y-3">
            <h2 className="text-3xl font-bold text-foreground">Estamos valorando tu propiedad</h2>
            <p className="text-lg text-muted-foreground">
              Analizando precios de mercado, ubicación y tendencias actuales para entregarte la mejor estimación...
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 pt-4">
            <div className="flex items-center gap-3 bg-muted/30 p-4 rounded-xl border border-border/50 animate-pulse [animation-duration:2s]">
              <span className="material-symbols-outlined text-primary">location_on</span>
              <span className="text-sm font-medium">Verificando ubicación en {comunas.find(c => c.id === values.comuna)?.label}</span>
            </div>
            <div className="flex items-center gap-3 bg-muted/30 p-4 rounded-xl border border-border/50 animate-pulse [animation-duration:2.5s]">
              <span className="material-symbols-outlined text-primary">query_stats</span>
              <span className="text-sm font-medium">Comparando con propiedades de {values.m2_construidos}m²</span>
            </div>
            <div className="flex items-center gap-3 bg-muted/30 p-4 rounded-xl border border-border/50 animate-pulse [animation-duration:3s]">
              <span className="material-symbols-outlined text-primary">analytics</span>
              <span className="text-sm font-medium">Calculando nivel de confianza...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Si ya tenemos resultado, mostrar la tarjeta de resultado
  if (predictionResult) {
    const selectedType = propertyTypes.find(pt => pt.id === values.tipo_propiedad);
    const selectedRegion = regions.find(r => r.id === values.region);
    const selectedComuna = comunas.find(c => c.id === values.comuna);

    return (
      <div className="min-h-screen bg-background py-8 px-4">
        <div className="max-w-lg mx-auto">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-foreground">Resultado de Valoración</h1>
            <p className="text-muted-foreground mt-2">
              Hemos estimado el valor de tu propiedad
            </p>
          </div>

          <ValuationResultCard
            result={predictionResult}
            propertyType={selectedType?.label || 'Propiedad'}
            location={`${selectedComuna?.label || ''}, ${selectedRegion?.label || ''}`}
            characteristics={{
              m2: values.m2_construidos,
              habitaciones: values.habitaciones,
              banos: values.banos,
            }}
            onPublish={handlePublish}
            onNewValuation={handleNewValuation}
          />
        </div>

        {/* Diálogo de datos de contacto para publicación */}
        <Dialog
          open={showPublishDialog}
          onClose={() => setShowPublishDialog(false)}
          title="Datos de contacto"
          maxWidth="sm"
        >
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Para publicar tu propiedad, necesitamos tus datos de contacto para que los interesados puedan comunicarse contigo.
            </p>

            {contactErrors.length > 0 && (
              <Alert variant="error">
                <ul className="list-disc list-inside">
                  {contactErrors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </Alert>
            )}

            <TextField
              label="Nombre completo"
              value={contactData.contactName}
              onChange={(e) => handleContactChange('contactName', e.target.value)}
              placeholder="Tu nombre"
              required
            />

            <TextField
              label="Teléfono"
              value={contactData.contactPhone}
              onChange={(e) => handleContactChange('contactPhone', e.target.value)}
              placeholder="+56 9 1234 5678"
              required
            />

            <TextField
              label="Correo electrónico"
              type="email"
              value={contactData.contactEmail}
              onChange={(e) => handleContactChange('contactEmail', e.target.value)}
              placeholder="tu@email.com"
              required
            />

            <div className="flex gap-3 pt-4">
              <Button
                variant="outlined"
                onClick={() => setShowPublishDialog(false)}
                className="flex-1"
                disabled={isPublishing}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleConfirmPublish}
                className="flex-1"
                disabled={isPublishing}
              >
                {isPublishing ? (
                  <>
                    <div className="flex justify-center"><span className="material-symbols-outlined animate-spin">progress_activity</span></div>
                    Enviando...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined mr-2">send</span>
                    Enviar solicitud
                  </>
                )}
              </Button>
            </div>
          </div>
        </Dialog>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <StepperBaseForm
          title="Valoración de Propiedad"
          subtitle="Obtén una estimación del valor de tu propiedad en 3 simples pasos"
          steps={steps}
          values={values}
          onChange={handleChange}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          submitLabel="Obtener Valoración"
          errors={errors}
          columns={1}
        />
      </div>
    </div>
  );
}
