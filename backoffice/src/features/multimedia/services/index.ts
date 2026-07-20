/**
 * @fileoverview HTTP service layer for multimedia operations
 */

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { env } from '@/lib/env';
import type {
  Multimedia,
  MultimediaGridResponse,
  CreateMultimediaDto,
  UpdateMultimediaDto,
  MultimediaQueryParams,
  UploadResponse,
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
 * Get all multimedia files
 */
export async function getMultimediaService(
  params?: MultimediaQueryParams
): Promise<MultimediaGridResponse> {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.append('page', String(params.page));
  if (params?.limit) searchParams.append('limit', String(params.limit));
  if (params?.search) searchParams.append('search', params.search);
  if (params?.type) searchParams.append('type', params.type);
  if (params?.sortField) searchParams.append('sortField', params.sortField);
  if (params?.sortOrder) searchParams.append('sortOrder', params.sortOrder);

  const queryString = searchParams.toString();
  const endpoint = `/multimedia${queryString ? `?${queryString}` : ''}`;

  return apiFetch<MultimediaGridResponse>(endpoint);
}

/**
 * Get multimedia by ID
 */
export async function getMultimediaByIdService(id: string): Promise<Multimedia> {
  return apiFetch<Multimedia>(`/multimedia/${id}`);
}

/**
 * Create multimedia record
 */
export async function createMultimediaService(
  data: CreateMultimediaDto
): Promise<Multimedia> {
  return apiFetch<Multimedia>('/multimedia', {
    method: 'POST',
    body: JSON.stringify(data),
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

/**
 * Update multimedia
 */
export async function updateMultimediaService(
  id: string,
  data: UpdateMultimediaDto
): Promise<Multimedia> {
  return apiFetch<Multimedia>(`/multimedia/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

/**
 * Delete multimedia
 */
export async function deleteMultimediaService(id: string): Promise<void> {
  await apiFetch(`/multimedia/${id}`, { method: 'DELETE' });
}

/**
 * Upload multimedia file
 */
export async function uploadMultimediaService(
  file: File,
  documentTypeId?: string
): Promise<UploadResponse> {
  const accessToken = await getAccessToken();
  const url = new URL('/multimedia-upload', env.backendApiUrl).toString();

  const formData = new FormData();
  formData.append('file', file);
  if (documentTypeId) {
    formData.append('documentTypeId', documentTypeId);
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Error uploading file');
  }

  return response.json();
}

/**
 * Get multimedia download URL
 */
export async function getMultimediaUrlService(id: string): Promise<string> {
  const result = await apiFetch<{ url: string }>(
    `/multimedia/${id}/url`
  );
  return result.url;
}

/**
 * Set SEO title for multimedia
 */
export async function setMultimediaSeoTitleService(
  id: string,
  seoTitle: string
): Promise<Multimedia> {
  return apiFetch<Multimedia>(`/multimedia/${id}/seo-title`, {
    method: 'PATCH',
    body: JSON.stringify({ seoTitle }),
    headers: {
      'Content-Type': 'application/json',
    },
  });
}