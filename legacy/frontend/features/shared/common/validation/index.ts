import { z } from "zod";

export const FeatureFlagStatusSchema = z.enum(["ENABLED", "DISABLED", "BETA"]);

export const FeatureFlagSchema = z.object({
  id: z.string().uuid(),
  key: z.string().min(1).max(100),
  name: z.string().min(1).max(150),
  description: z.string().max(500).optional(),
  status: FeatureFlagStatusSchema,
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const UFValueSchema = z.object({
  id: z.string().uuid(),
  value: z.number().positive(),
  date: z.string().date(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const SystemSettingSchema = z.object({
  id: z.string().uuid(),
  key: z.string().min(1).max(100),
  value: z.string(),
  type: z.enum(["string", "number", "boolean", "json"]),
  description: z.string().max(500).optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const ConfigSchema = z.object({
  id: z.string().uuid(),
  key: z.string().min(1).max(100),
  value: z.unknown(),
  group: z.string().max(100).optional(),
  description: z.string().max(500).optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type FeatureFlag = z.infer<typeof FeatureFlagSchema>;
export type UFValue = z.infer<typeof UFValueSchema>;
export type SystemSetting = z.infer<typeof SystemSettingSchema>;
export type Config = z.infer<typeof ConfigSchema>;