/**
 * @fileoverview Zod schemas for contract validation
 * Validates inputs at form boundaries and API boundaries
 */

import { z } from 'zod';

/**
 * Contract operation type schema
 */
export const ContractOperationSchema = z.enum(['COMPRAVENTA', 'ARRIENDO'], {
  errorMap: () => ({ message: 'La operación debe ser COMPRAVENTA o ARRIENDO' }),
});

/**
 * Contract status schema
 */
export const ContractStatusSchema = z.enum(
  ['DRAFT', 'ACTIVE', 'COMPLETED', 'CANCELLED', 'SUSPENDED'],
  {
    errorMap: () => ({ message: 'Estado de contrato inválido' }),
  }
);

/**
 * Contract role schema
 */
export const ContractRoleSchema = z.enum(
  ['BUYER', 'SELLER', 'TENANT', 'LANDLORD', 'WITNESS', 'AGENCY'],
  {
    errorMap: () => ({ message: 'Rol en contrato inválido' }),
  }
);

/**
 * Currency schema
 */
export const CurrencySchema = z.enum(['CLP', 'USD', 'UF'], {
  errorMap: () => ({ message: 'Moneda debe ser CLP, USD o UF' }),
});

/**
 * Payment type schema
 */
export const PaymentTypeSchema = z.enum(
  ['CASH', 'BANK_TRANSFER', 'CHECK', 'INSTALLMENT'],
  {
    errorMap: () => ({ message: 'Tipo de pago inválido' }),
  }
);

/**
 * Payment status schema
 */
export const PaymentStatusSchema = z.enum(
  ['PENDING', 'COMPLETED', 'FAILED', 'CANCELLED'],
  {
    errorMap: () => ({ message: 'Estado de pago inválido' }),
  }
);

/**
 * Create contract schema
 */
export const CreateContractSchema = z.object({
  propertyId: z.string().uuid('ID de propiedad inválido'),
  operation: ContractOperationSchema,
  value: z.coerce
    .number()
    .positive('El valor debe ser positivo')
    .max(999999999999, 'El valor es demasiado alto'),
  currency: CurrencySchema,
  startDate: z.coerce
    .date()
    .min(new Date('2000-01-01'), 'Fecha de inicio inválida'),
  endDate: z.coerce.date().optional(),
  notes: z.string().max(1000, 'Las notas no pueden exceder 1000 caracteres').optional(),
  persons: z
    .array(
      z.object({
        personId: z.string().uuid('ID de persona inválido'),
        role: ContractRoleSchema,
      })
    )
    .min(1, 'Al menos una persona es requerida em el contrato'),
});
export const ContractSchema = CreateContractSchema;

/**
 * Update contract schema
 */
export const UpdateContractSchema = z.object({
  status: ContractStatusSchema.optional(),
  value: z.coerce.number().positive('El valor debe ser positivo').optional(),
  endDate: z.coerce.date().optional(),
  notes: z.string().max(1000, 'Las notas no pueden exceder 1000 caracteres').optional(),
});
export const ContractUpdateSchema = UpdateContractSchema;

export const ContractFinancialsSchema = z.object({
  value: z.coerce.number().positive('El valor debe ser positivo').optional(),
  commissionPercentage: z.coerce.number().min(0).max(100).optional(),
  commissionAmount: z.coerce.number().min(0).optional(),
  currency: CurrencySchema.optional(),
});

/**
 * Add payment schema
 */
export const AddPaymentSchema = z.object({
  amount: z.coerce.number().positive('El monto debe ser positivo'),
  date: z.coerce.date().min(new Date('2000-01-01'), 'Fecha de pago inválida'),
  type: PaymentTypeSchema,
  description: z.string().max(500, 'Descripción demasiado larga').optional(),
  isAgencyRevenue: z.boolean().optional(),
});

/**
 * Update payment status schema
 */
export const UpdatePaymentStatusSchema = z.object({
  status: PaymentStatusSchema,
  paidAt: z.coerce.date().optional(),
});

/**
 * Contract query params schema
 */
export const ContractQuerySchema = z.object({
  page: z.coerce.number().positive().default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  search: z.string().optional(),
  operation: ContractOperationSchema.optional(),
  status: ContractStatusSchema.optional(),
  sortField: z.enum(['createdAt', 'value', 'startDate']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  userId: z.string().uuid().optional(),
  propertyId: z.string().uuid().optional(),
});

/**
 * Infer TypeScript types from schemas
 */
export type CreateContractInput = z.infer<typeof CreateContractSchema>;
export type UpdateContractInput = z.infer<typeof UpdateContractSchema>;
export type AddPaymentInput = z.infer<typeof AddPaymentSchema>;
export type UpdatePaymentStatusInput = z.infer<typeof UpdatePaymentStatusSchema>;
export type ContractQueryInput = z.infer<typeof ContractQuerySchema>;