export type PropertyType = "apartment" | "house" | "land" | "commercial" | "office";
export type PropertyStatus = "available" | "sold" | "rented" | "pending" | "inactive";
export type ListingType = "sale" | "rent";

export interface PropertyLocation {
  address: string;
  city: string;
  state: string;
  zipCode: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
}

export interface PropertyFeatures {
  bedrooms: number;
  bathrooms: number;
  kitchens: number;
  parkingSpaces: number;
  totalArea: number;
  builtArea: number;
  hasPool: boolean;
  hasGarden: boolean;
  hasGym: boolean;
  hasSecurity: boolean;
}

export interface Property {
  id: string;
  title: string;
  description: string;
  type: PropertyType;
  status: PropertyStatus;
  listingType: ListingType;
  price: number;
  location: PropertyLocation;
  features: PropertyFeatures;
  images: string[];
  thumbnail: string;
  owner: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  createdAt: Date;
  updatedAt: Date;
  viewsCount: number;
  isFavorited?: boolean;
}

export interface PropertyFilter {
  searchQuery?: string;
  listingType?: ListingType;
  type?: PropertyType;
  priceRange?: { min: number; max: number };
  bedrooms?: number;
  bedroomsOperator?: 'lte' | 'eq' | 'gte';
  bathrooms?: number;
  bathroomsOperator?: 'lte' | 'eq' | 'gte';
  parkingSpaces?: number;
  parkingSpacesOperator?: 'lte' | 'eq' | 'gte';
  city?: string;
  state?: string;
  typeProperty?: string;
  currency?: string;
  radius?: number;
}

export interface PropertyListResponse {
  items: Property[];
  total: number;
  page: number;
  pageSize: number;
}

export type CreatePropertyInput = Omit<Property, "id" | "createdAt" | "updatedAt" | "viewsCount" | "isFavorited">;
export type UpdatePropertyInput = Partial<Omit<Property, "id" | "owner" | "createdAt" | "updatedAt" | "viewsCount">>;
export type PropertyFilterInput = PropertyFilter;