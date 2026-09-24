import { useQuery, UseQueryResult } from "@tanstack/react-query";
import * as LocationService from "../services";
import type { Region, City, Commune, Location, LocationSearchResponse, LocationSearchFilters } from "../types";

export function useRegions(): UseQueryResult<Region[], Error> {
  return useQuery({
    queryKey: ["locations", "regions"],
    queryFn: LocationService.listRegions,
    staleTime: 1000 * 60 * 60,
  });
}

export function useRegion(regionId: string | null | undefined): UseQueryResult<Region, Error> {
  return useQuery({
    queryKey: ["locations", "region", regionId],
    queryFn: () => LocationService.getRegion(regionId!),
    enabled: Boolean(regionId),
  });
}

export function useCities(regionId: string | null | undefined): UseQueryResult<City[], Error> {
  return useQuery({
    queryKey: ["locations", "cities", regionId],
    queryFn: () => LocationService.listCities(regionId!),
    enabled: Boolean(regionId),
    staleTime: 1000 * 60 * 30,
  });
}

export function useCity(cityId: string | null | undefined): UseQueryResult<City, Error> {
  return useQuery({
    queryKey: ["locations", "city", cityId],
    queryFn: () => LocationService.getCity(cityId!),
    enabled: Boolean(cityId),
  });
}

export function useCommunes(cityId: string | null | undefined): UseQueryResult<Commune[], Error> {
  return useQuery({
    queryKey: ["locations", "communes", cityId],
    queryFn: () => LocationService.listCommunes(cityId!),
    enabled: Boolean(cityId),
    staleTime: 1000 * 60 * 30,
  });
}

export function useCommune(communeId: string | null | undefined): UseQueryResult<Commune, Error> {
  return useQuery({
    queryKey: ["locations", "commune", communeId],
    queryFn: () => LocationService.getCommune(communeId!),
    enabled: Boolean(communeId),
  });
}

export function useSearchLocations(filters: LocationSearchFilters): UseQueryResult<LocationSearchResponse[], Error> {
  return useQuery({
    queryKey: ["locations", "search", filters],
    queryFn: () => LocationService.searchLocations(filters),
    enabled: Boolean(filters.query || filters.regionId || filters.cityId),
    staleTime: 1000 * 60 * 5,
  });
}

export function useLocation(locationId: string | null | undefined): UseQueryResult<Location, Error> {
  return useQuery({
    queryKey: ["locations", "location", locationId],
    queryFn: () => LocationService.getLocation(locationId!),
    enabled: Boolean(locationId),
  });
}