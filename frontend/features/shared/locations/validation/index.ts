import { z } from "zod";

export const CoordinatePointSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

export const RegionSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  code: z.string().min(1).max(10),
});

export const CitySchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  regionId: z.string().uuid(),
});

export const CommuneSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  cityId: z.string().uuid(),
});

export const LocationSchema = z.object({
  id: z.string().uuid(),
  regionId: z.string().uuid(),
  cityId: z.string().uuid(),
  communeId: z.string().uuid(),
  coordinates: CoordinatePointSchema.optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const LocationSearchFiltersSchema = z.object({
  regionId: z.string().uuid().optional(),
  cityId: z.string().uuid().optional(),
  query: z.string().min(1).max(100).optional(),
  limit: z.number().min(1).max(1000).default(50),
  offset: z.number().min(0).default(0),
});

export type CoordinatePoint = z.infer<typeof CoordinatePointSchema>;
export type Region = z.infer<typeof RegionSchema>;
export type City = z.infer<typeof CitySchema>;
export type Commune = z.infer<typeof CommuneSchema>;
export type Location = z.infer<typeof LocationSchema>;