import { z } from "zod";

export const AuditActionSchema = z.enum([
  "CREATE",
  "UPDATE",
  "DELETE",
  "READ",
  "LOGIN",
  "LOGOUT",
  "EXPORT",
  "IMPORT",
]);

export const AuditEntrySchema = z.object({
  id: z.string().uuid(),
  action: AuditActionSchema,
  entity: z.string().min(1).max(100),
  entityId: z.string().min(1).max(100),
  userId: z.string().uuid(),
  userName: z.string().min(1).max(100),
  userEmail: z.string().email(),
  description: z.string().max(1000).optional(),
  changes: z.record(z.unknown()).optional(),
  ipAddress: z.string().ip().optional(),
  userAgent: z.string().max(500).optional(),
  timestamp: z.string().datetime(),
  createdAt: z.string().datetime(),
});

export const AuditLogSchema = z.object({
  id: z.string().uuid(),
  action: AuditActionSchema,
  entity: z.string().min(1).max(100),
  entityId: z.string().min(1).max(100),
  userId: z.string().uuid(),
  userName: z.string().min(1).max(100),
  userEmail: z.string().email(),
  description: z.string().max(1000).optional(),
  changes: z.record(z.unknown()).optional(),
  ipAddress: z.string().ip().optional(),
  userAgent: z.string().max(500).optional(),
  timestamp: z.string().datetime(),
  createdAt: z.string().datetime(),
});

export const AuditSearchFiltersSchema = z.object({
  action: AuditActionSchema.optional(),
  entity: z.string().min(1).max(100).optional(),
  entityId: z.string().min(1).max(100).optional(),
  userId: z.string().uuid().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  limit: z.number().min(1).max(1000).default(50),
  offset: z.number().min(0).default(0),
});

export type AuditAction = z.infer<typeof AuditActionSchema>;
export type AuditEntry = z.infer<typeof AuditEntrySchema>;
export type AuditLog = z.infer<typeof AuditLogSchema>;