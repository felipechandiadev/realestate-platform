import { z } from "zod";

export const PropertyTypeSchema = z.enum(["apartment", "house", "land", "commercial", "office"]);

export const PropertyStatusSchema = z.enum(["available", "sold", "rented", "pending", "inactive"]);

export const ListingTypeSchema = z.enum(["sale", "rent"]);

export const LocationSchema = z.object({
  address: z.string().min(5).max(255),
  city: z.string().min(2).max(100),
  state: z.string().min(2).max(100),
  zipCode: z.string().min(3).max(20),
  coordinates: z.object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
  }),
});

export const PropertyFeaturesSchema = z.object({
  bedrooms: z.number().nonnegative().int(),
  bathrooms: z.number().nonnegative().int(),
  kitchens: z.number().nonnegative().int(),
  parkingSpaces: z.number().nonnegative().int(),
  totalArea: z.number().positive(),
  builtArea: z.number().positive(),
  hasPool: z.boolean().default(false),
  hasGarden: z.boolean().default(false),
  hasGym: z.boolean().default(false),
  hasSecurity: z.boolean().default(false),
});

export const PropertySchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(3).max(255),
  description: z.string().min(10).max(5000),
  type: PropertyTypeSchema,
  status: PropertyStatusSchema,
  listingType: ListingTypeSchema,
  price: z.number().positive(),
  location: LocationSchema,
  features: PropertyFeaturesSchema,
  images: z.array(z.string().url()),
  thumbnail: z.string().url(),
  owner: z.object({
    id: z.string().uuid(),
    name: z.string().min(1),
    email: z.string().email(),
    phone: z.string().min(7),
  }),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  viewsCount: z.number().nonnegative().int(),
  isFavorited: z.boolean().optional(),
});

export const CreatePropertySchema = z.object({
  title: z.string().min(3).max(255),
  description: z.string().min(10).max(5000),
  type: PropertyTypeSchema,
  listingType: ListingTypeSchema,
  price: z.number().positive(),
  location: LocationSchema,
  features: PropertyFeaturesSchema,
  images: z.array(z.string().url()),
  thumbnail: z.string().url(),
});

export const UpdatePropertySchema = z.object({
  title: z.string().min(3).max(255).optional(),
  description: z.string().min(10).max(5000).optional(),
  type: PropertyTypeSchema.optional(),
  listingType: ListingTypeSchema.optional(),
  price: z.number().positive().optional(),
  location: LocationSchema.optional(),
  features: PropertyFeaturesSchema.partial().optional(),
  images: z.array(z.string().url()).optional(),
  thumbnail: z.string().url().optional(),
  status: PropertyStatusSchema.optional(),
});

export const PropertyFilterSchema = z.object({
  searchQuery: z.string().max(255).optional(),
  listingType: ListingTypeSchema.optional(),
  type: PropertyTypeSchema.optional(),
  priceRange: z.object({ min: z.number().nonnegative(), max: z.number().positive() }).optional(),
  bedrooms: z.number().nonnegative().int().optional(),
  bathrooms: z.number().nonnegative().int().optional(),
  city: z.string().max(100).optional(),
  radius: z.number().positive().optional(),
});

export type PropertyInput = z.infer<typeof CreatePropertySchema>;
export type UpdatePropertyInput = z.infer<typeof UpdatePropertySchema>;
export type PropertyFilterInput = z.infer<typeof PropertyFilterSchema>;