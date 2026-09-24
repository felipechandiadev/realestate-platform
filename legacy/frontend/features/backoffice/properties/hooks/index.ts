/**
 * @fileoverview React Query hooks for property data fetching and mutations
 * Handles caching, loading states, error states, and invalidation
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { GridRequestParams, PropertyGridItem, GridResponse } from '../types';
import * as propertiesService from '../services';
import { deleteProperty } from '../actions/properties.action';

/**
 * Query key factory for properties feature
 */
export const propertyKeys = {
  all: () => ['properties'] as const,
  grid: () => [...propertyKeys.all(), 'grid'] as const,
  gridSale: (params?: GridRequestParams) =>
    [...propertyKeys.grid(), 'sale', params] as const,
  gridRent: (params?: GridRequestParams) =>
    [...propertyKeys.grid(), 'rent', params] as const,
  detail: (id: string) => [...propertyKeys.all(), 'detail', id] as const,
  detailFull: (id: string) => [...propertyKeys.all(), 'detail-full', id] as const,
  counts: () => [...propertyKeys.all(), 'counts'] as const,
  countSale: () => [...propertyKeys.counts(), 'sale'] as const,
  countPublished: () => [...propertyKeys.counts(), 'published'] as const,
  countFeatured: () => [...propertyKeys.counts(), 'featured'] as const,
  types: () => [...propertyKeys.all(), 'types'] as const,
  typeCharacteristics: (typeId: string) =>
    [...propertyKeys.types(), 'characteristics', typeId] as const,
};

/**
 * Fetch sale properties with pagination and filters
 */
export function useSalePropertiesGrid(params?: GridRequestParams) {
  return useQuery({
    queryKey: propertyKeys.gridSale(params),
    queryFn: () => propertiesService.getSalePropertiesGridService(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    placeholderData: {
      items: [],
      total: 0,
      page: params?.page || 1,
      limit: params?.limit || 10,
      hasMore: false,
    } as GridResponse<PropertyGridItem>,
  });
}

/**
 * Fetch rent properties with pagination and filters
 */
export function useRentPropertiesGrid(params?: GridRequestParams) {
  return useQuery({
    queryKey: propertyKeys.gridRent(params),
    queryFn: () => propertiesService.getRentPropertiesGridService(params),
    staleTime: 5 * 60 * 1000,
    placeholderData: {
      items: [],
      total: 0,
      page: params?.page || 1,
      limit: params?.limit || 10,
      hasMore: false,
    } as GridResponse<PropertyGridItem>,
  });
}

/**
 * Create new property mutation
 */
export function useCreateProperty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => propertiesService.createPropertyService(data),
    onSuccess: () => {
      // Invalidate all property-related queries
      queryClient.invalidateQueries({ queryKey: propertyKeys.all() });
    },
  });
}

/**
 * Update property mutation
 */
export function useUpdateProperty(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => propertiesService.updatePropertyService(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: propertyKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: propertyKeys.grid() });
    },
  });
}

/**
 * Update property basic fields (fast update)
 */
export function useUpdatePropertyBasic(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => propertiesService.updatePropertyBasicService(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: propertyKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: propertyKeys.grid() });
    },
  });
}

/**
 * Delete property mutation
 */
export function useDeleteProperty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteProperty(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: propertyKeys.grid() });
    },
  });
}

/**
 * Toggle property published status
 */
export function useTogglePublished(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => propertiesService.togglePropertyPublishedService(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: propertyKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: propertyKeys.grid() });
      queryClient.invalidateQueries({ queryKey: propertyKeys.countPublished() });
    },
  });
}

/**
 * Toggle property featured status
 */
export function useToggleFeatured(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => propertiesService.togglePropertyFeaturedService(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: propertyKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: propertyKeys.grid() });
      queryClient.invalidateQueries({ queryKey: propertyKeys.countFeatured() });
    },
  });
}

/**
 * Assign property to agent
 */
export function useAssignAgent(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (agentId: string) =>
      propertiesService.assignPropertyAgentService(id, agentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: propertyKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: propertyKeys.grid() });
    },
  });
}

/**
 * Get property counts (sale, published, featured)
 */
export function usePropertyCounts() {
  const queryClient = useQueryClient();

  const sale = useQuery({
    queryKey: propertyKeys.countSale(),
    queryFn: propertiesService.getSalePropertiesCountService,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  const published = useQuery({
    queryKey: propertyKeys.countPublished(),
    queryFn: propertiesService.getPublishedPropertiesCountService,
    staleTime: 10 * 60 * 1000,
  });

  const featured = useQuery({
    queryKey: propertyKeys.countFeatured(),
    queryFn: propertiesService.getFeaturedPropertiesCountService,
    staleTime: 10 * 60 * 1000,
  });

  return { sale, published, featured };
}

/**
 * Get property types
 */
export function usePropertyTypes() {
  return useQuery({
    queryKey: propertyKeys.types(),
    queryFn: propertiesService.listPropertyTypesService,
    staleTime: 1 * 60 * 60 * 1000, // 1 hour (rarely changes)
  });
}

/**
 * Get characteristics for property type
 */
export function usePropertyTypeCharacteristics(typeId: string) {
  return useQuery({
    queryKey: propertyKeys.typeCharacteristics(typeId),
    queryFn: () => propertiesService.getPropertyTypeCharacteristicsService(typeId),
    staleTime: 1 * 60 * 60 * 1000,
    enabled: !!typeId,
  });
}
