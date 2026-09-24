export type ContactSubject = "general_inquiry" | "property_inquiry" | "partnership" | "complaint" | "other";
export type ContactStatus = "new" | "in_progress" | "resolved" | "closed";
export type ContactPriority = "low" | "medium" | "high";

export interface ContactMessage {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  subject: ContactSubject;
  message: string;
  status: ContactStatus;
  priority: ContactPriority;
  attachmentUrl?: string;
  assignedTo?: string;
  responseMessage?: string;
  respondedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  metadata?: Record<string, unknown>;
}

export interface ContactResponse {
  id: string;
  messageId: string;
  respondedBy: string;
  response: string;
  createdAt: Date;
}

export interface ContactsListResponse {
  items: ContactMessage[];
  total: number;
  page: number;
  pageSize: number;
}

export type CreateContactInput = Omit<ContactMessage, "id" | "status" | "priority" | "assignedTo" | "responseMessage" | "respondedAt" | "createdAt" | "updatedAt">;