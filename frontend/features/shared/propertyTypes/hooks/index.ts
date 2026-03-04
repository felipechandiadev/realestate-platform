import { useQuery, UseQueryResult } from "@tanstack/react-query";
import * as PropertyTypeService from "../services";
import type { PropertyType, PropertyTypeCategory, PropertyCharacteristic, PropertyTypeDetail } from "../types";

export function usePropertyTypes(): UseQueryResult<PropertyType[], Error> {
  return useQuery({
    queryKey: ["propertyTypes"],
    queryFn: PropertyTypeService.listPropertyTypes,
    staleTime: 1000 * 60 * 60,
  });
}

export function usePropertyType(typeId: string | null | undefined): UseQueryResult<PropertyTypeDetail, Error> {
  return useQuery({
    queryKey: ["propertyTypes", "detail", typeId],
    queryFn: () => PropertyTypeService.getPropertyType(typeId!),
    enabled: Boolean(typeId),
    staleTime: 1000 * 60 * 30,
  });
}

export function usePropertyTypesByCategory(categoryId: string | null | undefined): UseQueryResult<PropertyType[], Error> {
  return useQuery({
    queryKey: ["propertyTypes", "category", categoryId],
    queryFn: () => PropertyTypeService.listPropertyTypesByCategory(categoryId!),
    enabled: Boolean(categoryId),
    staleTime: 1000 * 60 * 30,
  });
}

export function usePropertyTypeCharacteristics(typeId: string | null | undefined): UseQueryResult<PropertyCharacteristic[], Error> {
  return useQuery({
    queryKey: ["propertyTypes", "characteristics", typeId],
    queryFn: () => PropertyTypeService.getCharacteristics(typeId!),
    enabled: Boolean(typeId),
    staleTime: 1000 * 60 * 30,
  });
}

export function usePropertyTypeCategories(): UseQueryResult<PropertyTypeCategory[], Error> {
  return useQuery({
    queryKey: ["propertyTypes", "categories"],
    queryFn: PropertyTypeService.listCategories,
    staleTime: 1000 * 60 * 60,
  });
}

export function usePropertyTypeCategory(categoryId: string | null | undefined): UseQueryResult<PropertyTypeCategory, Error> {
  return useQuery({
    queryKey: ["propertyTypes", "category", "detail", categoryId],
    queryFn: () => PropertyTypeService.getCategory(categoryId!),
    enabled: Boolean(categoryId),
  });
}

export function useSearchPropertyTypes(query: string): UseQueryResult<PropertyType[], Error> {
  return useQuery({
    queryKey: ["propertyTypes", "search", query],
    queryFn: () => PropertyTypeService.searchPropertyTypes(query),
    enabled: query.length > 0,
    staleTime: 1000 * 60 * 5,
  });
}