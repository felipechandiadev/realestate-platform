/**
 * @fileoverview Multimedia domain types
 * Handles images, videos and media file management
 */

/**
 * Multimedia file type
 */
export type MediaType = 'IMAGE' | 'VIDEO' | 'DOCUMENT' | 'AUDIO';

/**
 * Multimedia file entity
 */
export interface Multimedia {
  id: string;
  name: string;
  url: string;
  type: MediaType;
  mimeType: string;
  size: number;
  duration?: number;
  width?: number;
  height?: number;
  seoTitle?: string;
  seoDescription?: string;
  relatedItems: string[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Multimedia grid item
 */
export interface MultimediaGridItem {
  id: string;
  name: string;
  thumbnail?: string;
  type: MediaType;
  size: number;
  createdAt: Date;
}

/**
 * Paginated multimedia response
 */
export interface MultimediaGridResponse {
  items: MultimediaGridItem[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

/**
 * Create multimedia DTO
 */
export interface CreateMultimediaDto {
  name: string;
  type: MediaType;
  seoTitle?: string;
  seoDescription?: string;
}

/**
 * Update multimedia DTO
 */
export interface UpdateMultimediaDto {
  name?: string;
  seoTitle?: string;
  seoDescription?: string;
}

/**
 * Query parameters for multimedia filtering
 */
export interface MultimediaQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  type?: MediaType;
  sortField?: 'createdAt' | 'name' | 'size';
  sortOrder?: 'asc' | 'desc';
}

/**
 * Upload response
 */
export interface UploadResponse {
  id: string;
  url: string;
  name: string;
  type: MediaType;
  size: number;
}