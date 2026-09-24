export type DocumentType = "contract" | "invoice" | "receipt" | "agreement" | "report" | "other";
export type DocumentStatus = "draft" | "pending_review" | "approved" | "rejected" | "archived";
export type FileType = "pdf" | "docx" | "xlsx" | "jpg" | "png" | "txt";

export interface Document {
  id: string;
  title: string;
  description?: string;
  type: DocumentType;
  status: DocumentStatus;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  fileType: FileType;
  mimeType: string;
  uploadedBy: string;
  uploadedAt: Date;
  updatedAt: Date;
  relatedPropertyId?: string;
  relatedContractId?: string;
  tags: string[];
  metadata?: Record<string, unknown>;
}

export interface DocumentFilter {
  type?: DocumentType;
  status?: DocumentStatus;
  tags?: string[];
  dateRange?: { startDate: Date; endDate: Date };
  uploadedBy?: string;
}

export type DocumentFilterInput = DocumentFilter;

export interface UploadedFile {
  name: string;
  size: number;
  type: FileType;
  mimeType: string;
  url: string;
  uploadedAt: Date;
}

export type CreateDocumentInput = Omit<Document, "id" | "uploadedAt" | "updatedAt" | "fileUrl" | "fileSize" | "mimeType">;
export type UpdateDocumentInput = Partial<Omit<Document, "id" | "uploadedBy" | "uploadedAt" | "fileUrl" | "fileName" | "fileSize" | "fileType" | "mimeType">>;