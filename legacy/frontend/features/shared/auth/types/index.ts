export type UserRole = "admin" | "agent" | "user" | "guest";
export type AuthProvider = "credentials" | "google" | "github";

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: UserRole;
  isEmailVerified: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthSession {
  user: User;
  accessToken: string;
  refreshToken?: string;
  expiresAt: Date;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterInput {
  email: string;
  password: string;
  passwordConfirm: string;
  name: string;
  acceptTerms: boolean;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordReset {
  token: string;
  password: string;
  passwordConfirm: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  data?: unknown;
}

export interface AuthError {
  code: string;
  message: string;
  statusCode: number;
}