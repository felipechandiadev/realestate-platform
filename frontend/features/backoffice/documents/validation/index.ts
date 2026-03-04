import { z } from "zod";

const ALLOWED_FILE_TYPES = ["pdf", "docx", "xlsx", "jpg", "png", "txt"] as const;
const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "image/jpeg",
  "image/png",
  "text/plain",
] as const;

export const DocumentTypeSchema = z.enum(["contract", "invoice", "receipt", "agreement", "report", "other"]);

export const DocumentStatusSchema = z.enum(["draft", "pending_review", "approved", "rejected", "archived"]);

export const FileTypeSchema = z.enum(ALLOWED_FILE_TYPES);

export const DocumentSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).max(255),
  description: z.string().max(2000).optional(),
  type: DocumentTypeSchema,
  status: DocumentStatusSchema,
  fileUrl: z.string().url(),
  fileName: z.string().min(1).max(255),
  fileSize: z.number().positive(),
  fileType: FileTypeSchema,
  mimeType: z.string(),
  uploadedBy: z.string().uuid(),
  uploadedAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  relatedPropertyId: z.string().uuid().optional(),
  relatedContractId: z.string().uuid().optional(),
  tags: z.array(z.string().min(1).max(50)),
  metadata: z.record(z.any()).optional(),
});

export const CreateDocumentSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().max(2000).optional(),
  type: DocumentTypeSchema,
  status: DocumentStatusSchema.default("draft"),
  fileName: z.string().min(1).max(255),
  fileSize: z.number().positive().max(52428800), // 50MB
  fileType: FileTypeSchema,
  mimeType: z.enum(ALLOWED_MIME_TYPES),
  relatedPropertyId: z.string().uuid().optional(),
  relatedContractId: z.string().uuid().optional(),
  tags: z.array(z.string().min(1).max(50)).default([]),
  metadata: z.record(z.any()).optional(),
});

export const UpdateDocumentSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().max(2000).optional().nullable(),
  type: DocumentTypeSchema.optional(),
  status: DocumentStatusSchema.optional(),
  tags: z.array(z.string().min(1).max(50)).optional(),
  metadata: z.record(z.any()).optional(),
});

export const DocumentFilterSchema = z.object({
  type: DocumentTypeSchema.optional(),
  status: DocumentStatusSchema.optional(),
  tags: z.array(z.string()).optional(),
  dateRange: z.object({ startDate: z.coerce.date(), endDate: z.coerce.date() }).optional(),
  uploadedBy: z.string().uuid().optional(),
});

export type DocumentInput = z.infer<typeof CreateDocumentSchema>;
export type UpdateDocumentInput = z.infer<typeof UpdateDocumentSchema>;
export type DocumentFilterInput = z.infer<typeof DocumentFilterSchema>;