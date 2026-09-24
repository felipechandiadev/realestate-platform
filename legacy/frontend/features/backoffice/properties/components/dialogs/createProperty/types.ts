/**
 * Tipos compartidos para CreateProperty y sus componentes hijos
 */

export interface CreatePropertyFormData {
  title: string;
  description?: string;
  price: string | number | undefined;
  operationType: string;
  location: any;
  coordinates?: { lat: number; lng: number };
  state: { id: string; label: string };
  city: { id: string; label: string };
  currencyPrice: string;
  address: string;
  multimedia: File[];
  bedrooms: number;
  bathrooms: number;
  parkingSpaces: number;
  floors: number;
  builtSquareMeters: number;
  landSquareMeters: number;
  constructionYear: number;
  seoTitle: string;
  seoDescription: string;
  status: string;
  propertyTypeId: string;
  internalNotes: string;
}

export interface PropertyTypeOption {
  id: string;
  label?: string;
  name?: string;
  description?: string;
  hasBedrooms: boolean;
  hasBathrooms: boolean;
  hasBuiltSquareMeters: boolean;
  hasLandSquareMeters: boolean;
  hasParkingSpaces: boolean;
  hasFloors: boolean;
  hasConstructionYear: boolean;
}

export interface LocationOption {
  id: string;
  label: string;
  stateId?: string; // ID de la región (para filtrar comunas)
}

export interface CreatePropertyContextType {
  formData: CreatePropertyFormData;
  propertyTypes: PropertyTypeOption[];
  loadingTypes: boolean;
  stateOptions: LocationOption[];
  loadingStates: boolean;
  cityOptions: LocationOption[];
  loadingCities: boolean;
  selectedPropertyType: any;
  isSubmitting: boolean;
  submitError: string | null;
  handleChange: (field: string, value: any) => void;
  handleSubmit: () => Promise<void>;
}
