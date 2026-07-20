/**
 * @fileoverview Property domain types and data transfer objects
 * Used for type safety across services, actions, and components
 */

export type Operation = 'SALE' | 'RENT';

export type PropertyStatus = 'DRAFT' | 'PUBLISHED' | 'REJECTED' | 'ARCHIVED';

/**
 * Main Property domain model
 */
export interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  address: string;
  city: string;
  country: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  type: string; // 'apartment', 'house', etc.
  operation: Operation;
  status: PropertyStatus;
  published: boolean;
  featured: boolean;
  images: string[];
  agentId?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Grid view property with minimal fields for lists
 */
export interface PropertyGridItem {
  id: string;
  title: string;
  price: number;
  address: string;
  city: string;
  type: string;
  operation: Operation;
  status: PropertyStatus;
  published: boolean;
  featured: boolean;
  thumbnail?: string;
  agentId?: string;
  createdAt?: Date | string;
}

/**
 * DTO for creating new properties
 */
export interface CreatePropertyDto {
  title: string;
  description: string;
  price: number;
  address: string;
  city: string;
  country: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  type: string;
  operation: Operation;
  images: string[];
  agentId?: string;
}

/**
 * DTO for updating properties
 */
export interface UpdatePropertyDto extends Partial<CreatePropertyDto> {
  id: string;
}

/**
 * DTO for basic property updates
 */
export interface UpdatePropertyBasicDto {
  title?: string;
  description?: string;
  price?: number;
  address?: string;
  city?: string;
  country?: string;
}

/**
 * Query filters for property grid
 */
export interface PropertyFilters {
  search?: string;
  type?: string;
  operation?: Operation;
  status?: PropertyStatus;
  minPrice?: number;
  maxPrice?: number;
  city?: string;
  published?: boolean;
  featured?: boolean;
}

/**
 * Pagination parameters
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
}

/**
 * Grid request parameters
 */
export interface GridRequestParams {
  fields?: string;
  sort?: string;
  sortField?: string;
  search?: string;
  filters?: string;
  filtration?: boolean;
  pagination?: boolean;
  page?: number;
  limit?: number;
}

/**
 * Grid response with items and metadata
 */
export interface GridResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

/**
 * API response wrapper for single property
 */
export interface SinglePropertyResponse {
  success: boolean;
  data?: Property;
  error?: string;
  statusCode: number;
}

/**
 * API response wrapper for property list
 */
export interface PropertyListResponse {
  success: boolean;
  data?: GridResponse<PropertyGridItem>;
  error?: string;
  statusCode: number;
}

/**
 * Property type catalog
 */
export interface PropertyType {
  id: string;
  name: string;
  description?: string;
}

/**
 * Property characteristic for a type
 */
export interface PropertyCharacteristic {
  id: string;
  name: string;
  fieldType: 'text' | 'number' | 'boolean' | 'select' | 'multiselect';
  required: boolean;
  options?: string[];
}

export type PropertyTypeCharacteristicsResponse = PropertyCharacteristic[];
