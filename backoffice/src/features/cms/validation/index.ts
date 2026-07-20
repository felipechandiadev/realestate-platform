/**
 * @fileoverview Zod schemas for CMS validation
 */

import { z } from 'zod';

/**
 * Article creation schema
 */
export const CreateArticleSchema = z.object({
  title: z
    .string()
    .min(3, 'El título debe tener al menos 3 caracteres')
    .max(200, 'El título no puede exceder 200 caracteres'),
  slug: z
    .string()
    .min(1, 'El slug es requerido')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'El slug tiene un formato inválido'),
  content: z
    .string()
    .min(10, 'El contenido debe tener al menos 10 caracteres')
    .max(50000, 'El contenido no puede exceder 50000 caracteres'),
  description: z
    .string()
    .min(10, 'La descripción debe tener al menos 10 caracteres')
    .max(500, 'La descripción no puede exceder 500 caracteres'),
  author: z
    .string()
    .min(2, 'El autor debe tener al menos 2 caracteres')
    .max(100, 'El autor es demasiado largo'),
  category: z
    .string()
    .min(2, 'La categoría es requerida')
    .max(50, 'La categoría es demasiado larga'),
  featured: z.boolean().optional(),
  published: z.boolean().optional(),
  thumbnail: z.string().url('La URL del thumbnail es inválida').optional(),
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
 * Article update schema
 */
export const UpdateArticleSchema = CreateArticleSchema.partial();
export const ArticleSchema = CreateArticleSchema;

/**
 * Testimonial creation schema
 */
export const CreateTestimonialSchema = z.object({
  name: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre es demasiado largo'),
  email: z.string().email('Email inválido').optional(),
  role: z.string().max(100, 'El rol es demasiado largo').optional(),
  company: z.string().max(100, 'La empresa es demasiado larga').optional(),
  content: z
    .string()
    .min(10, 'El contenido debe tener al menos 10 caracteres')
    .max(1000, 'El contenido no puede exceder 1000 caracteres'),
  rating: z
    .number()
    .min(1, 'La calificación mínima es 1')
    .max(5, 'La calificación máxima es 5'),
  image: z.string().url('La URL de imagen es inválida').optional(),
  featured: z.boolean().optional(),
  published: z.boolean().optional(),
});

/**
 * Testimonial update schema
 */
export const UpdateTestimonialSchema = CreateTestimonialSchema.partial();
export const TestimonialSchema = CreateTestimonialSchema;

/**
 * Slide creation schema
 */
export const CreateSlideSchema = z.object({
  title: z
    .string()
    .min(1, 'El título es requerido')
    .max(200, 'El título no puede exceder 200 caracteres'),
  description: z
    .string()
    .max(1000, 'La descripción no puede exceder 1000 caracteres')
    .optional(),
  image: z.string().url('La URL de imagen es inválida'),
  url: z.string().url('La URL es inválida').optional(),
  order: z.coerce.number().positive('El orden debe ser positivo'),
  active: z.boolean().optional(),
  cta: z
    .string()
    .max(100, 'El CTA no puede exceder 100 caracteres')
    .optional(),
});

/**
 * Slide update schema
 */
export const UpdateSlideSchema = CreateSlideSchema.partial();

/**
 * About Us update schema
 */
export const UpdateAboutUsSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  content: z.string().min(10).max(50000).optional(),
  mission: z.string().min(10).max(1000).optional(),
  vision: z.string().min(10).max(1000).optional(),
  values: z.array(z.string()).optional(),
});

/**
 * Article query params schema
 */
export const ArticleQuerySchema = z.object({
  page: z.coerce.number().positive().default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  search: z.string().optional(),
  category: z.string().optional(),
  featured: z.coerce.boolean().optional(),
  published: z.coerce.boolean().optional(),
  sortField: z.enum(['createdAt', 'views', 'title']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

/**
 * Infer TypeScript types from schemas
 */
export type CreateArticleInput = z.infer<typeof CreateArticleSchema>;
export type UpdateArticleInput = z.infer<typeof UpdateArticleSchema>;
export type CreateTestimonialInput = z.infer<typeof CreateTestimonialSchema>;
export type UpdateTestimonialInput = z.infer<typeof UpdateTestimonialSchema>;
export type CreateSlideInput = z.infer<typeof CreateSlideSchema>;
export type UpdateSlideInput = z.infer<typeof UpdateSlideSchema>;
export type UpdateAboutUsInput = z.infer<typeof UpdateAboutUsSchema>;
export type ArticleQueryInput = z.infer<typeof ArticleQuerySchema>;