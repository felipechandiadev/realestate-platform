/**
 * @fileoverview Zod schemas for multimedia validation
 */

import { z } from 'zod';

/**
 * Multimedia type schema
 */
export const MediaTypeSchema = z.enum(['IMAGE', 'VIDEO', 'DOCUMENT', 'AUDIO'], {
  errorMap: () => ({ message: 'Tipo de media inválido' }),
});

/**
 * Create multimedia schema
 */
export const CreateMultimediaSchema = z.object({
  name: z
    .string()
    .min(1, 'El nombre es requerido')
    .max(255, 'El nombre no puede exceder 255 caracteres'),
  type: MediaTypeSchema,
  seoTitle: z
    .string()
    .max(60, 'El SEO title no puede exceder 60 caracteres')
    .optional(),
  seoDescription: z
    .string()
    .max(160, 'La descripción SEO no puede exceder 160 caracteres')
    .optional(),
});

/**
 * Update multimedia schema
 */
export const UpdateMultimediaSchema = CreateMultimediaSchema.partial();

/**
 * File upload schema
 */
export const FileUploadSchema = z.object({
  file: z
    .instanceof(File)
    .refine((file) => file.size > 0, 'El archivo es requerido')
    .refine((file) => file.size <= 100 * 1024 * 1024, 'El archivo no puede exceder 100MB'),
  documentTypeId: z.string().uuid().optional(),
});

/**
 * Multimedia query params schema
 */
export const MultimediaQuerySchema = z.object({
  page: z.coerce.number().positive().default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  search: z.string().optional(),
  type: MediaTypeSchema.optional(),
  sortField: z.enum(['createdAt', 'name', 'size']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

/**
 * Infer TypeScript types
 */
export type CreateMultimediaInput = z.infer<typeof CreateMultimediaSchema>;
export type UpdateMultimediaInput = z.infer<typeof UpdateMultimediaSchema>;
export type FileUploadInput = z.infer<typeof FileUploadSchema>;
export type MultimediaQueryInput = z.infer<typeof MultimediaQuerySchema>;