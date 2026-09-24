/**
 * @fileoverview Backoffice Properties Feature
 *
 * Public API for property management in the backoffice.
 * This module combines server actions, React Query hooks, and domain types.
 *
 * @example
 * ```tsx
 * import {
 *   useSalePropertiesGrid,
 *   useCreateProperty,
 *   PropertySchema,
 * } from '@/features/backoffice/properties';
 *
 * // Fetch data
 * const { data, isLoading } = useSalePropertiesGrid({ page: 1, limit: 10 });
 *
 * // Create mutation
 * const { mutate } = useCreateProperty();
 * mutate({ title: 'New Property', price: 500000, ... });
 *
 * // Validate input
 * const validated = PropertySchema.parse(formData);
 * ```
 */

// ============================================================================
// Server Actions (mutation triggers)
// ============================================================================
/**
 * Server actions for properties
 * @see properties.action.ts for implementation details
 */
export {
  // Grid operations (read)
  getSalePropertiesGrid,
  getRentPropertiesGrid,
  listAvailableRentProperties,
  getProperty,
  getFullProperty,
  // Counts
  getSalePropertiesCountSale,
  getSalePropertiesCountPublished,
  getSalePropertiesCountFeatured,
  // Property types
  listPropertyTypes,
  listPropertyTypesPublic,
  getPropertyTypeCharacteristics,
  getPropertyTypeCharacteristicsPublic,
  // Mutations (create/update/delete)
  createProperty,
  publishProperty,
  publishPropertyPublic,
  updateProperty,
  updatePropertyBasic,
  deleteProperty,
  togglePropertyPublished,
  togglePropertyFeatured,
  assignPropertyAgent,
} from './actions/properties.action';

// ============================================================================
// React Query Hooks (recommended for client-side data fetching)
// ============================================================================
/**
 * Query hooks for fetching property data with automatic caching
 *
 * ```tsx
 * // Fetch sale properties with filters
 * const { data, isLoading } = useSalePropertiesGrid({
 *   page: 1,
 *   limit: 10,
 *   search: 'apartment',
 * });
 *
 * // Create property mutation
 * const { mutate, isPending } = useCreateProperty();
 *
 * // Toggle published status
 * const { mutate: togglePublished } = useTogglePublished(propertyId);
 * ```
 */
export {
  // Query hooks (read)
  useSalePropertiesGrid,
  useRentPropertiesGrid,
  usePropertyCounts,
  usePropertyTypes,
  usePropertyTypeCharacteristics,
  propertyKeys, // Use for manual cache management
  // Mutation hooks (write)
  useCreateProperty,
  useUpdateProperty,
  useUpdatePropertyBasic,
  useDeleteProperty,
  useTogglePublished,
  useToggleFeatured,
  useAssignAgent,
} from './hooks';

// ============================================================================
// HTTP Service Layer (advanced: use hooks instead in most cases)
// ============================================================================
/**
 * Pure HTTP service functions
 * Used internally by hooks, but can be called directly from actions
 *
 * ⚠️ These are server-only functions. Use hooks in components instead.
 */
export * as propertiesService from './services';

// ============================================================================
// Domain Types (for TypeScript type safety)
// ============================================================================
/**
 * TypeScript types and DTOs
 *
 * ```tsx
 * import type { Property, CreatePropertyDto } from '@/features/backoffice/properties';
 * ```
 */
export type {
  Property,
  PropertyGridItem,
  CreatePropertyDto,
  UpdatePropertyDto,
  UpdatePropertyBasicDto,
  PropertyFilters,
  PropertyType,
  PropertyCharacteristic,
  PropertyTypeCharacteristicsResponse,
  GridResponse,
} from './types';

// ============================================================================
// Validation Schemas (Zod for runtime type safety)
// ============================================================================
/**
 * Zod validation schemas for forms and API boundaries
 *
 * ```tsx
 * import { PropertySchema, PropertyFiltersSchema } from '@/features/backoffice/properties';
 *
 * // Validate form submission
 * const result = PropertySchema.safeParse(formData);
 * if (!result.success) {
 *   setErrors(result.error.flatten());
 * }
 * ```
 */
export { PropertySchema, PropertyBasicUpdateSchema, PropertyFiltersSchema } from './validation';
