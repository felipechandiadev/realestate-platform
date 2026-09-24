import { apiClient } from "@/lib/api/client";
import type {
  AuthSession,
  User,
  LoginCredentials,
  RegisterInput,
  PasswordResetRequest,
  PasswordReset,
  AuthResponse,
} from "../types";

const BASE_URL = "/auth";

export const authService = {
  async login(credentials: LoginCredentials) {
    try {
      const response = await apiClient.post<AuthSession>(`${BASE_URL}/login`, credentials);
      return response.data;
    } catch (error: any) {
      // Si el error es un string, intenta parsear JSON
      let message = error?.message;
      try {
        const parsed = JSON.parse(message);
        message = parsed?.message || message;
      } catch {}
      throw { message };
    }
  },

  async register(data: RegisterInput) {
    const response = await apiClient.post<AuthResponse>(`${BASE_URL}/register`, data);
    return response.data;
  },

  async logout() {
    await apiClient.post(`${BASE_URL}/logout`);
  },

  async getCurrentUser() {
    const response = await apiClient.get<User>(`${BASE_URL}/me`);
    return response.data;
  },

  async refreshToken() {
    const response = await apiClient.post<AuthSession>(`${BASE_URL}/refresh`);
    return response.data;
  },

  async requestPasswordReset(data: PasswordResetRequest) {
    const response = await apiClient.post<AuthResponse>(`${BASE_URL}/password-reset/request`, data);
    return response.data;
  },

  async resetPassword(data: PasswordReset) {
    const response = await apiClient.post<AuthResponse>(`${BASE_URL}/password-reset/confirm`, data);
    return response.data;
  },

  async updateProfile(data: Partial<User>) {
    const response = await apiClient.patch<User>(`${BASE_URL}/profile`, data);
    return response.data;
  },

  async changePassword(currentPassword: string, newPassword: string) {
    const response = await apiClient.post<AuthResponse>(`${BASE_URL}/change-password`, {
      currentPassword,
      newPassword,
    });
    return response.data;
  },

  async verifyEmail(token: string) {
    const response = await apiClient.post<AuthResponse>(`${BASE_URL}/verify-email`, { token });
    return response.data;
  },

  async resendVerificationEmail() {
    const response = await apiClient.post<AuthResponse>(`${BASE_URL}/resend-verification`);
    return response.data;
  },

  async loginWithProvider(provider: "google" | "github", token: string) {
    const response = await apiClient.post<AuthSession>(`${BASE_URL}/oauth/${provider}`, { token });
    return response.data;
  },
};