import { apiClient } from "@/lib/api/client";
import type {
  Notification,
  NotificationPreferences,
  NotificationStats,
  CreateNotificationInput,
  UpdateNotificationInput,
  UpdatePreferencesInput,
} from "../types";

const BASE_URL = "/notifications";
const PREFERENCES_URL = "/notifications/preferences";

export const notificationsService = {
  async getNotifications(params?: { limit?: number; offset?: number; unreadOnly?: boolean }) {
    const response = await apiClient.get<Notification[]>(BASE_URL, { params });
    return response.data;
  },

  async getNotification(id: string) {
    const response = await apiClient.get<Notification>(`${BASE_URL}/${id}`);
    return response.data;
  },

  async createNotification(data: CreateNotificationInput) {
    const response = await apiClient.post<Notification>(BASE_URL, data);
    return response.data;
  },

  async updateNotification(id: string, data: UpdateNotificationInput) {
    const response = await apiClient.patch<Notification>(`${BASE_URL}/${id}`, data);
    return response.data;
  },

  async markAsRead(id: string) {
    const response = await apiClient.patch<Notification>(`${BASE_URL}/${id}`, { isRead: true });
    return response.data;
  },

  async markAllAsRead() {
    const response = await apiClient.patch<void>(`${BASE_URL}/mark-all-read`);
    return response.data;
  },

  async deleteNotification(id: string) {
    await apiClient.delete(`${BASE_URL}/${id}`);
  },

  async getStats() {
    const response = await apiClient.get<NotificationStats>(`${BASE_URL}/stats`);
    return response.data;
  },

  async getPreferences() {
    const response = await apiClient.get<NotificationPreferences>(PREFERENCES_URL);
    return response.data;
  },

  async updatePreferences(data: UpdatePreferencesInput) {
    const response = await apiClient.patch<NotificationPreferences>(PREFERENCES_URL, data);
    return response.data;
  },
};