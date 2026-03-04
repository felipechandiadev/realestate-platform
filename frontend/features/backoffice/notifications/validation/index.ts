import { z } from "zod";

export const NotificationSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  title: z.string().min(1).max(200),
  message: z.string().min(1).max(5000),
  type: z.enum(["info", "success", "warning", "error"]),
  isRead: z.boolean(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  actionUrl: z.string().url().optional(),
  metadata: z.record(z.any()).optional(),
});

export const CreateNotificationSchema = z.object({
  title: z.string().min(1).max(200),
  message: z.string().min(1).max(5000),
  type: z.enum(["info", "success", "warning", "error"]),
  actionUrl: z.string().url().optional(),
  metadata: z.record(z.any()).optional(),
});

export const UpdateNotificationSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  message: z.string().min(1).max(5000).optional(),
  type: z.enum(["info", "success", "warning", "error"]).optional(),
  isRead: z.boolean().optional(),
  actionUrl: z.string().url().optional().nullable(),
  metadata: z.record(z.any()).optional(),
});

export const NotificationPreferencesSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  emailNotifications: z.boolean(),
  pushNotifications: z.boolean(),
  newPropertyListings: z.boolean(),
  contractUpdates: z.boolean(),
  systemAlerts: z.boolean(),
  marketingEmails: z.boolean(),
});

export const UpdatePreferencesSchema = z.object({
  emailNotifications: z.boolean().optional(),
  pushNotifications: z.boolean().optional(),
  newPropertyListings: z.boolean().optional(),
  contractUpdates: z.boolean().optional(),
  systemAlerts: z.boolean().optional(),
  marketingEmails: z.boolean().optional(),
});

export type NotificationInput = z.infer<typeof CreateNotificationSchema>;
export type UpdateNotificationInput = z.infer<typeof UpdateNotificationSchema>;
export type PreferencesInput = z.infer<typeof UpdatePreferencesSchema>;