import { z } from "zod";

export const PropertyCharacteristicValueTypeSchema = z.enum(["string", "number", "boolean", "enum"]);

export const PropertyCharacteristicSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  code: z.string().min(1).max(50),
  valueType: PropertyCharacteristicValueTypeSchema,
  values: z.array(z.string()).optional(),
  isRequired: z.boolean(),
  order: z.number().min(0),
});

export const PropertyTypeCategorySchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  code: z.string().min(1).max(50),
  icon: z.string().max(255).optional(),
  description: z.string().max(500).optional(),
});

export const PropertyTypeSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  code: z.string().min(1).max(50),
  categoryId: z.string().uuid(),
  description: z.string().max(500).optional(),
  isActive: z.boolean(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const PropertyTypeDetailSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  code: z.string().min(1).max(50),
  categoryId: z.string().uuid(),
  description: z.string().max(500).optional(),
  characteristics: z.array(PropertyCharacteristicSchema),
  isActive: z.boolean(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type PropertyCharacteristic = z.infer<typeof PropertyCharacteristicSchema>;
export type PropertyTypeCategory = z.infer<typeof PropertyTypeCategorySchema>;
export type PropertyType = z.infer<typeof PropertyTypeSchema>;
export type PropertyTypeDetail = z.infer<typeof PropertyTypeDetailSchema>;