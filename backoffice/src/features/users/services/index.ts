/**
 * @fileoverview HTTP service layer for user operations
 */

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { env } from '@/lib/env';
import type {
  User,
  UserProfile,
  UserGridResponse,
  Team,
  CreateUserDto,
  UpdateUserDto,
  UpdateUserStatusDto,
  UpdateUserRoleDto,
  ChangePasswordDto,
  UserQueryParams,
} from '../types';

async function getAccessToken(): Promise<string> {
  const session = await getServerSession(authOptions);
  const accessToken = session?.accessToken;

  if (!accessToken) {
    throw new Error('No hay una sesión activa.');
  }

  return accessToken;
}

async function apiFetch<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const accessToken = await getAccessToken();
  const url = new URL(endpoint, env.backendApiUrl).toString();

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
      ...options?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`Error: ${response.status}`);
  }

  return response.json();
}

/**
 * Get current user profile
 */
export async function getCurrentUserService(): Promise<UserProfile> {
  return apiFetch<UserProfile>('/users/me');
}

/**
 * Get all users
 */
export async function getUsersService(
  params?: UserQueryParams
): Promise<UserGridResponse> {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.append('page', String(params.page));
  if (params?.limit) searchParams.append('limit', String(params.limit));
  if (params?.search) searchParams.append('search', params.search);
  if (params?.role) searchParams.append('role', params.role);
  if (params?.status) searchParams.append('status', params.status);
  if (params?.verified !== undefined)
    searchParams.append('verified', String(params.verified));

  const queryString = searchParams.toString();
  const endpoint = `/users${queryString ? `?${queryString}` : ''}`;

  return apiFetch<UserGridResponse>(endpoint);
}

/**
 * Get user by ID
 */
export async function getUserByIdService(id: string): Promise<User> {
  return apiFetch<User>(`/users/${id}`);
}

/**
 * Create user
 */
export async function createUserService(
  data: CreateUserDto
): Promise<User> {
  return apiFetch<User>('/users', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Update user
 */
export async function updateUserService(
  id: string,
  data: UpdateUserDto
): Promise<User> {
  return apiFetch<User>(`/users/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

/**
 * Update user status
 */
export async function updateUserStatusService(
  id: string,
  data: UpdateUserStatusDto
): Promise<User> {
  return apiFetch<User>(`/users/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

/**
 * Update user role
 */
export async function updateUserRoleService(
  id: string,
  data: UpdateUserRoleDto
): Promise<User> {
  return apiFetch<User>(`/users/${id}/role`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

/**
 * Change password
 */
export async function changePasswordService(
  data: ChangePasswordDto
): Promise<void> {
  await apiFetch(`/users/password/change`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Update user avatar
 */
export async function updateUserAvatarService(
  id: string,
  file: File
): Promise<User> {
  const accessToken = await getAccessToken();
  const url = new URL(`/users/${id}/avatar`, env.backendApiUrl).toString();

  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(url, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Error updating avatar');
  }

  return response.json();
}

/**
 * Get teams
 */
export async function getTeamsService(): Promise<Team[]> {
  return apiFetch<Team[]>('/teams');
}

/**
 * Get team by ID
 */
export async function getTeamByIdService(id: string): Promise<Team> {
  return apiFetch<Team>(`/teams/${id}`);
}

/**
 * Delete user
 */
export async function deleteUserService(id: string): Promise<void> {
  await apiFetch(`/users/${id}`, { method: 'DELETE' });
}

/**
 * Verify user email
 */
export async function verifyUserEmailService(
  id: string,
  token: string
): Promise<void> {
  await apiFetch(`/users/${id}/verify-email`, {
    method: 'POST',
    body: JSON.stringify({ token }),
  });
}

/**
 * Resend verification email
 */
export async function resendVerificationEmailService(
  id: string
): Promise<void> {
  await apiFetch(`/users/${id}/resend-verification-email`, {
    method: 'POST',
  });
}