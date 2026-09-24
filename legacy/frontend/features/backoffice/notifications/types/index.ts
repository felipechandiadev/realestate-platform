export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
  actionUrl?: string;
  metadata?: Record<string, unknown>;
}

export interface NotificationPreferences {
  id: string;
  userId: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  newPropertyListings: boolean;
  contractUpdates: boolean;
  systemAlerts: boolean;
  marketingEmails: boolean;
}

export interface NotificationStats {
  unreadCount: number;
  totalCount: number;
  lastNotificationAt: Date | null;
}

export type CreateNotificationInput = Omit<Notification, "id" | "createdAt" | "updatedAt" | "isRead">;
export type UpdateNotificationInput = Partial<Omit<Notification, "id" | "userId" | "createdAt" | "updatedAt">>;
export type UpdatePreferencesInput = Partial<Omit<NotificationPreferences, "id" | "userId">>;