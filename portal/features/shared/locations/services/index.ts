import { apiClient } from "@/lib/api/client";
import type { Region, City, Commune, Location, LocationSearchResponse, LocationSearchFilters } from "../types";

const BASE_URL = "/locations";

export async function listRegions(): Promise<Region[]> {
  const response = await apiClient.get<Region[]>(`${BASE_URL}/regions`);
  return response.data;
}

export async function getRegion(regionId: string): Promise<Region> {
  const response = await apiClient.get<Region>(`${BASE_URL}/regions/${regionId}`);
  return response.data;
}

export async function listCities(regionId: string): Promise<City[]> {
  const response = await apiClient.get<City[]>(`${BASE_URL}/regions/${regionId}/cities`);
  return response.data;
}

export async function getCity(cityId: string): Promise<City> {
  const response = await apiClient.get<City>(`${BASE_URL}/cities/${cityId}`);
  return response.data;
}

export async function listCommunes(cityId: string): Promise<Commune[]> {
  const response = await apiClient.get<Commune[]>(`${BASE_URL}/cities/${cityId}/communes`);
  return response.data;
}

export async function getCommune(communeId: string): Promise<Commune> {
  const response = await apiClient.get<Commune>(`${BASE_URL}/communes/${communeId}`);
  return response.data;
}

export async function searchLocations(filters: LocationSearchFilters): Promise<LocationSearchResponse[]> {
  const params = new URLSearchParams();
  if (filters.regionId) params.append("regionId", filters.regionId);
  if (filters.cityId) params.append("cityId", filters.cityId);
  if (filters.query) params.append("query", filters.query);
  if (filters.limit) params.append("limit", filters.limit.toString());
  if (filters.offset) params.append("offset", filters.offset.toString());
  
  const response = await apiClient.get<LocationSearchResponse[]>(
    `${BASE_URL}/search?${params.toString()}`
  );
  return response.data;
}

export async function getCoordinates(locationId: string): Promise<{ latitude: number; longitude: number }> {
  const response = await apiClient.get<{ latitude: number; longitude: number }>(
    `${BASE_URL}/${locationId}/coordinates`
  );
  return response.data;
}

export async function getLocation(locationId: string): Promise<Location> {
  const response = await apiClient.get<Location>(`${BASE_URL}/${locationId}`);
  return response.data;
}