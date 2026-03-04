import { z } from "zod";

export const ContactSubjectSchema = z.enum([
  "general_inquiry",
  "property_inquiry",
  "partnership",
  "complaint",
  "other",
]);

export const ContactStatusSchema = z.enum(["new", "in_progress", "resolved", "closed"]);

export const ContactPrioritySchema = z.enum(["low", "medium", "high"]);

export const CreateContactSchema = z.object({
  fullName: z.string().min(2).max(100),
  email: z.string().email(),
  phone: z.string().min(7).max(20).optional(),
  subject: ContactSubjectSchema,
  message: z.string().min(10).max(5000),
  attachmentUrl: z.string().url().optional(),
  metadata: z.record(z.any()).optional(),
});

export const ContactMessageSchema = z.object({
  id: z.string().uuid(),
  fullName: z.string().min(2).max(100),
  email: z.string().email(),
  phone: z.string().min(7).max(20).optional(),
  subject: ContactSubjectSchema,
  message: z.string().min(10).max(5000),
  status: ContactStatusSchema,
  priority: ContactPrioritySchema,
  attachmentUrl: z.string().url().optional(),
  assignedTo: z.string().uuid().optional(),
  responseMessage: z.string().max(5000).optional(),
  respondedAt: z.coerce.date().optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  metadata: z.record(z.any()).optional(),
});

export const ContactResponseSchema = z.object({
  id: z.string().uuid(),
  messageId: z.string().uuid(),
  respondedBy: z.string().uuid(),
  response: z.string().min(1).max(5000),
  createdAt: z.coerce.date(),
});

export const UpdateContactStatusSchema = z.object({
  status: ContactStatusSchema,
  priority: ContactPrioritySchema.optional(),
});

export const SendResponseSchema = z.object({
  response: z.string().min(1).max(5000),
});

export type ContactInput = z.infer<typeof CreateContactSchema>;
export type ContactResponseInput = z.infer<typeof SendResponseSchema>;