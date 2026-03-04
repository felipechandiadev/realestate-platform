/**
 * @fileoverview React Query hooks for CMS operations
 */

import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import type { ArticleQueryParams } from '../types';
import * as cmsService from '../services';

export const cmsKeys = {
  articles: () => ['articles'] as const,
  articleList: (params?: ArticleQueryParams) =>
    [...cmsKeys.articles(), 'list', params] as const,
  articleDetail: (id: string) =>
    [...cmsKeys.articles(), 'detail', id] as const,
  articleSlug: (slug: string) =>
    [...cmsKeys.articles(), 'slug', slug] as const,
  aboutUs: () => ['aboutUs'] as const,
  testimonials: () => ['testimonials'] as const,
  testimonialDetail: (id: string) =>
    [...cmsKeys.testimonials(), 'detail', id] as const,
  slides: () => ['slides'] as const,
  slideDetail: (id: string) =>
    [...cmsKeys.slides(), 'detail', id] as const,
};

/**
 * Articles hooks
 */
export function useArticles(params?: ArticleQueryParams) {
  return useQuery({
    queryKey: cmsKeys.articleList(params),
    queryFn: () => cmsService.getArticlesService(params),
    staleTime: 5 * 60 * 1000,
  });
}

export function useArticleById(id?: string) {
  return useQuery({
    queryKey: cmsKeys.articleDetail(id || ''),
    queryFn: () => cmsService.getArticleByIdService(id as string),
    staleTime: 10 * 60 * 1000,
    enabled: !!id,
  });
}

export function useArticleBySlug(slug: string) {
  return useQuery({
    queryKey: cmsKeys.articleSlug(slug),
    queryFn: () => cmsService.getArticleBySlugService(slug),
    staleTime: 10 * 60 * 1000,
    enabled: !!slug,
  });
}

export function useCreateArticle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => cmsService.createArticleService(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cmsKeys.articles() });
    },
  });
}

export function useUpdateArticle(id?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: any) => {
      const resolvedId = id ?? payload?.id;
      const data = id ? payload : payload?.data;
      return cmsService.updateArticleService(resolvedId, data);
    },
    onSuccess: () => {
      if (id) {
        queryClient.invalidateQueries({ queryKey: cmsKeys.articleDetail(id) });
      }
      queryClient.invalidateQueries({ queryKey: cmsKeys.articles() });
    },
  });
}

export function useDeleteArticle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cmsService.deleteArticleService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cmsKeys.articles() });
    },
  });
}

/**
 * About Us hooks
 */
export function useAboutUs() {
  return useQuery({
    queryKey: cmsKeys.aboutUs(),
    queryFn: cmsService.getAboutUsService,
    staleTime: 15 * 60 * 1000,
  });
}

export function useUpdateAboutUs() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => cmsService.updateAboutUsService(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cmsKeys.aboutUs() });
    },
  });
}

/**
 * Testimonials hooks
 */
export function useTestimonials() {
  return useQuery({
    queryKey: cmsKeys.testimonials(),
    queryFn: cmsService.getTestimonialsService,
    staleTime: 10 * 60 * 1000,
  });
}

export function useTestimonialById(id?: string) {
  return useQuery({
    queryKey: cmsKeys.testimonialDetail(id || ''),
    queryFn: () => cmsService.getTestimonialByIdService(id as string),
    enabled: !!id,
  });
}

export function useCreateTestimonial() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => cmsService.createTestimonialService(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cmsKeys.testimonials() });
    },
  });
}

export function useUpdateTestimonial(id?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: any) => {
      const resolvedId = id ?? payload?.id;
      const data = id ? payload : payload?.data;
      return cmsService.updateTestimonialService(resolvedId, data);
    },
    onSuccess: () => {
      if (id) {
        queryClient.invalidateQueries({ queryKey: cmsKeys.testimonialDetail(id) });
      }
      queryClient.invalidateQueries({ queryKey: cmsKeys.testimonials() });
    },
  });
}

export function useDeleteTestimonial() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cmsService.deleteTestimonialService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cmsKeys.testimonials() });
    },
  });
}

/**
 * Slides hooks
 */
export function useSlides() {
  return useQuery({
    queryKey: cmsKeys.slides(),
    queryFn: cmsService.getSlidesService,
    staleTime: 10 * 60 * 1000,
  });
}

export function useSlideById(id?: string) {
  return useQuery({
    queryKey: cmsKeys.slideDetail(id || ''),
    queryFn: () => cmsService.getSlideByIdService(id as string),
    enabled: !!id,
  });
}

export function useCreateSlide() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => cmsService.createSlideService(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cmsKeys.slides() });
    },
  });
}

export function useUpdateSlide(id?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: any) => {
      const resolvedId = id ?? payload?.id;
      const data = id ? payload : payload?.data;
      return cmsService.updateSlideService(resolvedId, data);
    },
    onSuccess: () => {
      if (id) {
        queryClient.invalidateQueries({ queryKey: cmsKeys.slideDetail(id) });
      }
      queryClient.invalidateQueries({ queryKey: cmsKeys.slides() });
    },
  });
}

export function useDeleteSlide() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cmsService.deleteSlideService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cmsKeys.slides() });
    },
  });
}

export function useReorderSlides() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (slides: any) => cmsService.reorderSlidesService(slides),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cmsKeys.slides() });
    },
  });
}

export const useCMSArticlesGrid = useArticles;