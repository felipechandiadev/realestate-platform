/**
 * @fileoverview React Query hooks for multimedia operations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { MultimediaQueryParams } from '../types';
import * as multimediaService from '../services';

export const multimediaKeys = {
  all: () => ['multimedia'] as const,
  list: (params?: MultimediaQueryParams) =>
    [...multimediaKeys.all(), 'list', params] as const,
  detail: (id: string) => [...multimediaKeys.all(), 'detail', id] as const,
};

/**
 * Get all multimedia files
 */
export function useMultimedia(params?: MultimediaQueryParams) {
  return useQuery({
    queryKey: multimediaKeys.list(params),
    queryFn: () => multimediaService.getMultimediaService(params),
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Get multimedia by ID
 */
export function useMultimediaById(id: string) {
  return useQuery({
    queryKey: multimediaKeys.detail(id),
    queryFn: () => multimediaService.getMultimediaByIdService(id),
    enabled: !!id,
  });
}

/**
 * Create multimedia record
 */
export function useCreateMultimedia() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: multimediaService.createMultimediaService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: multimediaKeys.all() });
    },
  });
}

/**
 * Update multimedia
 */
export function useUpdateMultimedia(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => multimediaService.updateMultimediaService(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: multimediaKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: multimediaKeys.all() });
    },
  });
}

/**
 * Delete multimedia
 */
export function useDeleteMultimedia() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: multimediaService.deleteMultimediaService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: multimediaKeys.all() });
    },
  });
}

/**
 * Upload multimedia file
 */
export function useUploadMultimedia() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ file, documentTypeId }: any) =>
      multimediaService.uploadMultimediaService(file, documentTypeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: multimediaKeys.all() });
    },
  });
}

/**
 * Get multimedia download URL
 */
export function useGetMultimediaUrl(id: string) {
  return useQuery({
    queryKey: [...multimediaKeys.detail(id), 'url'],
    queryFn: () => multimediaService.getMultimediaUrlService(id),
    enabled: !!id,
  });
}

/**
 * Set SEO title for multimedia
 */
export function useSetMultimediaSeoTitle(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (seoTitle: string) =>
      multimediaService.setMultimediaSeoTitleService(id, seoTitle),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: multimediaKeys.detail(id) });
    },
  });
}