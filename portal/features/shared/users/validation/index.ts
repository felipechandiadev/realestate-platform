/**
 * @fileoverview Zod schemas for user validation
 */

import { z } from 'zod';

/**
 * User role schema
 */
export const UserRoleSchema = z.enum(['ADMIN', 'AGENT', 'MANAGER', 'COMMUNITY', 'CUSTOMER'], {
  errorMap: () => ({ message: 'Rol de usuario inválido' }),
});

/**
 * User status schema
 */
export const UserStatusSchema = z.enum(
  ['ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING_VERIFICATION'],
  {
    errorMap: () => ({ message: 'Estado de usuario inválido' }),
  }
);

/**
 * Email schema
 */
export const EmailSchema = z
  .string()
  .email('El email debe ser válido')
  .toLowerCase();

/**
 * Password schema
 */
export const PasswordSchema = z
  .string()
  .min(8, 'La contraseña debe tener al menos 8 caracteres')
  .regex(/[A-Z]/, 'La contraseña debe contener al menos una mayúscula')
  .regex(/[a-z]/, 'La contraseña debe contener al menos una minúscula')
  .regex(/[0-9]/, 'La contraseña debe contener al menos un número');

/**
 * Create user schema
 */
export const CreateUserSchema = z.object({
  email: EmailSchema,
  firstName: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(50, 'El nombre no puede exceder 50 caracteres'),
  lastName: z
    .string()
    .min(2, 'El apellido debe tener al menos 2 caracteres')
    .max(50, 'El apellido no puede exceder 50 caracteres'),
  phone: z
    .string()
    .regex(/^[\d\s\-\+\(\)]+$/, 'El teléfono es inválido')
    .optional(),
  role: UserRoleSchema,
  status: UserStatusSchema.optional(),
  password: PasswordSchema.optional(),
  sendInvitation: z.boolean().optional(),
});

/**
 * Update user schema
 */
export const UpdateUserSchema = z.object({
  firstName: z
    .string()
    .min(2)
    .max(50)
    .optional(),
  lastName: z
    .string()
    .min(2)
    .max(50)
    .optional(),
  phone: z
    .string()
    .regex(/^[\d\s\-\+\(\)]+$/, 'El teléfono es inválido')
    .optional(),
  avatar: z.string().url().optional(),
  bio: z.string().max(500).optional(),
  company: z.string().max(100).optional(),
  nationality: z.string().max(50).optional(),
  maritalStatus: z.string().max(50).optional(),
  location: z.string().max(100).optional(),
  licenseNumber: z.string().max(50).optional(),
});

/**
 * Update user status schema
 */
export const UpdateUserStatusSchema = z.object({
  status: UserStatusSchema,
});

/**
 * Update user role schema
 */
export const UpdateUserRoleSchema = z.object({
  role: UserRoleSchema,
});

/**
 * Change password schema
 */
export const ChangePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'La contraseña actual es requerida'),
    newPassword: PasswordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  });

/**
 * User query params schema
 */
export const UserQuerySchema = z.object({
  page: z.coerce.number().positive().default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  search: z.string().optional(),
  role: UserRoleSchema.optional(),
  status: UserStatusSchema.optional(),
  verified: z.coerce.boolean().optional(),
  sortField: z.enum(['createdAt', 'email', 'firstName']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

/**
 * Infer TypeScript types
 */
export type CreateUserInput = z.infer<typeof CreateUserSchema>;
export type UpdateUserInput = z.infer<typeof UpdateUserSchema>;
export type UpdateUserStatusInput = z.infer<typeof UpdateUserStatusSchema>;
export type UpdateUserRoleInput = z.infer<typeof UpdateUserRoleSchema>;
export type ChangePasswordInput = z.infer<typeof ChangePasswordSchema>;
export type UserQueryInput = z.infer<typeof UserQuerySchema>;