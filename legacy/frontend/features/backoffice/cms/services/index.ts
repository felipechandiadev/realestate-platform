/**
 * @fileoverview HTTP service layer for CMS operations
 */

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { env } from '@/lib/env';
import type {
  Article,
  ArticleGridResponse,
  AboutUs,
  Testimonial,
  Slide,
  CreateArticleDto,
  UpdateArticleDto,
  CreateTestimonialDto,
  UpdateTestimonialDto,
  CreateSlideDto,
  UpdateSlideDto,
  UpdateAboutUsDto,
  ArticleQueryParams,
} from '../types';

async function getAccessToken(): Promise<string> {
  const session = await getServerSession(authOptions);
  const accessToken = session?.accessToken;

  if (!accessToken) {
    throw new Error('No hay una sesión activa.');
  }

  return accessToken;
}

async function apiFetch<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const accessToken = await getAccessToken();
  const url = new URL(endpoint, env.backendApiUrl).toString();

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
      ...options?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`Error: ${response.status}`);
  }

  return response.json();
}

/**
 * Articles endpoints
 */
export async function getArticlesService(
  params?: ArticleQueryParams
): Promise<ArticleGridResponse> {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.append('page', String(params.page));
  if (params?.limit) searchParams.append('limit', String(params.limit));
  if (params?.search) searchParams.append('search', params.search);
  if (params?.category) searchParams.append('category', params.category);
  if (params?.featured !== undefined)
    searchParams.append('featured', String(params.featured));
  if (params?.published !== undefined)
    searchParams.append('published', String(params.published));

  const queryString = searchParams.toString();
  const endpoint = `/articles${queryString ? `?${queryString}` : ''}`;

  return apiFetch<ArticleGridResponse>(endpoint);
}

export async function getArticleByIdService(id: string): Promise<Article> {
  return apiFetch<Article>(`/articles/${id}`);
}

export async function getArticleBySlugService(slug: string): Promise<Article> {
  return apiFetch<Article>(`/articles/slug/${slug}`);
}

export async function createArticleService(
  data: CreateArticleDto
): Promise<Article> {
  return apiFetch<Article>('/articles', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateArticleService(
  id: string,
  data: UpdateArticleDto
): Promise<Article> {
  return apiFetch<Article>(`/articles/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function deleteArticleService(id: string): Promise<void> {
  await apiFetch(`/articles/${id}`, { method: 'DELETE' });
}

/**
 * About Us endpoints
 */
export async function getAboutUsService(): Promise<AboutUs> {
  return apiFetch<AboutUs>('/about-us');
}

export async function updateAboutUsService(
  data: UpdateAboutUsDto
): Promise<AboutUs> {
  return apiFetch<AboutUs>('/about-us', {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

/**
 * Testimonials endpoints
 */
export async function getTestimonialsService(): Promise<Testimonial[]> {
  return apiFetch<Testimonial[]>('/testimonials');
}

export async function getTestimonialByIdService(id: string): Promise<Testimonial> {
  return apiFetch<Testimonial>(`/testimonials/${id}`);
}

export async function createTestimonialService(
  data: CreateTestimonialDto
): Promise<Testimonial> {
  return apiFetch<Testimonial>('/testimonials', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateTestimonialService(
  id: string,
  data: UpdateTestimonialDto
): Promise<Testimonial> {
  return apiFetch<Testimonial>(`/testimonials/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function deleteTestimonialService(id: string): Promise<void> {
  await apiFetch(`/testimonials/${id}`, { method: 'DELETE' });
}

/**
 * Slides/Carousel endpoints
 */
export async function getSlidesService(): Promise<Slide[]> {
  return apiFetch<Slide[]>('/slides');
}

export async function getSlideByIdService(id: string): Promise<Slide> {
  return apiFetch<Slide>(`/slides/${id}`);
}

export async function createSlideService(
  data: CreateSlideDto
): Promise<Slide> {
  return apiFetch<Slide>('/slides', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateSlideService(
  id: string,
  data: UpdateSlideDto
): Promise<Slide> {
  return apiFetch<Slide>(`/slides/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function deleteSlideService(id: string): Promise<void> {
  await apiFetch(`/slides/${id}`, { method: 'DELETE' });
}

export async function reorderSlidesService(
  slides: Array<{ id: string; order: number }>
): Promise<Slide[]> {
  return apiFetch<Slide[]>('/slides/reorder', {
    method: 'POST',
    body: JSON.stringify({ slides }),
  });
}