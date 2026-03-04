/**
 * @fileoverview Zod schemas for property validation
 * Used in forms, actions, and API boundary validation
 */

import { z } from 'zod';

/**
 * Property creation/update schema with full validation
 */
export const PropertySchema = z.object({
  title: z
    .string()
    .min(3, 'El título debe tener al menos 3 caracteres')
    .max(100, 'El título no puede exceder 100 caracteres'),
  description: z
    .string()
    .min(10, 'La descripción debe tener al menos 10 caracteres')
    .max(1000, 'La descripción no puede exceder 1000 caracteres'),
  price: z
    .number()
    .positive('El precio debe ser positivo')
    .max(1000000000, 'El precio es demasiado alto'),
  address: z
    .string()
    .min(5, 'La dirección debe tener al menos 5 caracteres')
    .max(200, 'La dirección es demasiado larga'),
  city: z
    .string()
    .min(2, 'La ciudad debe tener al menos 2 caracteres')
    .max(50, 'La ciudad es demasiado larga'),
  country: z
    .string()
    .min(2, 'El país debe tener al menos 2 caracteres')
    .max(50, 'El país es demasiado largo'),
  type: z
    .string()
    .min(2, 'El tipo de propiedad es requerido')
    .max(50, 'El tipo de propiedad es demasiado largo'),
  operation: z.enum(['SALE', 'RENT'], {
    errorMap: () => ({ message: 'La operación debe ser SALE o RENT' }),
  }),
  coordinates: z
    .object({
      latitude: z.number().min(-90).max(90, 'Latitud inválida'),
      longitude: z.number().min(-180).max(180, 'Longitud inválida'),
    })
    .optional(),
  images: z.array(z.string().url(), {
    errorMap: () => ({ message: 'Las imágenes deben ser URLs válidas' }),
  }),
  agentId: z.string().uuid().optional(),
});

/**
 * Schema for basic property updates (subset of fields)
 */
export const PropertyBasicUpdateSchema = PropertySchema.partial({
  images: true,
  coordinates: true,
  agentId: true,
});

/**
 * Schema for property grid filters
 */
export const PropertyFiltersSchema = z.object({
  search: z.string().optional(),
  type: z.string().optional(),
  operation: z.enum(['SALE', 'RENT']).optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'REJECTED', 'ARCHIVED']).optional(),
  minPrice: z.number().min(0).optional(),
  maxPrice: z.number().min(0).optional(),
  city: z.string().optional(),
  published: z.boolean().optional(),
  featured: z.boolean().optional(),
});

/**
 * Schema for pagination parameters
 */
export const PaginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(10),
});

/**
 * Infer TypeScript types from schemas
 */
export type PropertyInput = z.infer<typeof PropertySchema>;
export type PropertyBasicUpdateInput = z.infer<typeof PropertyBasicUpdateSchema>;
export type PropertyFiltersInput = z.infer<typeof PropertyFiltersSchema>;
export type PaginationInput = z.infer<typeof PaginationSchema>;
