export interface Region {
  id: string;
  name: string;
  code: string;
}

export interface City {
  id: string;
  name: string;
  regionId: string;
  region?: Region;
}

export interface Commune {
  id: string;
  name: string;
  cityId: string;
  city?: City;
}

export interface CoordinatePoint {
  latitude: number;
  longitude: number;
}

export interface Location {
  id: string;
  regionId: string;
  cityId: string;
  communeId: string;
  coordinates?: CoordinatePoint;
  region: Region;
  city: City;
  commune: Commune;
  createdAt: string;
  updatedAt: string;
}

export interface LocationSearchResponse {
  id: string;
  label: string;
  regionName: string;
  cityName: string;
  communeName: string;
  coordinates?: CoordinatePoint;
}

export interface LocationSearchFilters {
  regionId?: string;
  cityId?: string;
  query?: string;
  limit?: number;
  offset?: number;
}