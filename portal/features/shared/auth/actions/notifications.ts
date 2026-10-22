export interface UserGridNotificationsParams {
  page?: number;
  limit?: number;
  search?: string;
  isRead?: boolean;
  type?: string;
}

export interface UserGridNotificationItem {
  id: string;
  title?: string;
  message?: string;
  type?: string;
  isRead?: boolean;
  createdAt?: string;
  [key: string]: unknown;
}

export interface UserGridNotificationsResponse {
  data?: UserGridNotificationItem[];
  items?: UserGridNotificationItem[];
  total?: number;
  page?: number;
  limit?: number;
  [key: string]: unknown;
}
