import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { propertiesService } from "../services";
import type { CreatePropertyInput, UpdatePropertyInput, PropertyFilterInput } from "../types";

const PROPERTIES_QUERY_KEY = ["properties"];
const FEATURED_PROPERTIES_QUERY_KEY = ["featured-properties"];

export function useProperties(params?: { page?: number; pageSize?: number; filters?: PropertyFilterInput }) {
  return useQuery({
    queryKey: [...PROPERTIES_QUERY_KEY, params],
    queryFn: () => propertiesService.getProperties(params),
  });
}

export function useProperty(id: string) {
  return useQuery({
    queryKey: [...PROPERTIES_QUERY_KEY, id],
    queryFn: () => propertiesService.getProperty(id),
    enabled: !!id,
  });
}

export function usePropertyBySlug(slug: string) {
  return useQuery({
    queryKey: [...PROPERTIES_QUERY_KEY, "slug", slug],
    queryFn: () => propertiesService.getPropertyBySlug(slug),
    enabled: !!slug,
  });
}

export function useCreateProperty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePropertyInput) => propertiesService.createProperty(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROPERTIES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: FEATURED_PROPERTIES_QUERY_KEY });
    },
  });
}

export function useUpdateProperty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePropertyInput }) =>
      propertiesService.updateProperty(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: [...PROPERTIES_QUERY_KEY, id] });
      queryClient.invalidateQueries({ queryKey: PROPERTIES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: FEATURED_PROPERTIES_QUERY_KEY });
    },
  });
}

export function useDeleteProperty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => propertiesService.deleteProperty(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROPERTIES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: FEATURED_PROPERTIES_QUERY_KEY });
    },
  });
}

export function usePropertyImages(id: string) {
  return useQuery({
    queryKey: [...PROPERTIES_QUERY_KEY, id, "images"],
    queryFn: () => propertiesService.getPropertyImages(id),
    enabled: !!id,
  });
}

export function useIncrementViews() {
  return useMutation({
    mutationFn: (id: string) => propertiesService.incrementViews(id),
  });
}

export function useFeaturedProperties(limit?: number) {
  return useQuery({
    queryKey: [...FEATURED_PROPERTIES_QUERY_KEY, { limit }],
    queryFn: () => propertiesService.getFeaturedProperties(limit),
  });
}

export function useRelatedProperties(id: string, limit?: number) {
  return useQuery({
    queryKey: [...PROPERTIES_QUERY_KEY, id, "related", { limit }],
    queryFn: () => propertiesService.getRelatedProperties(id, limit),
    enabled: !!id,
  });
}

export function useSearchProperties(query: string) {
  return useQuery({
    queryKey: [...PROPERTIES_QUERY_KEY, "search", query],
    queryFn: () => propertiesService.searchProperties(query),
    enabled: !!query && query.length > 2,
  });
}

export function useFilterProperties() {
  return useMutation({
    mutationFn: (filters: PropertyFilterInput) => propertiesService.filterProperties(filters),
  });
}