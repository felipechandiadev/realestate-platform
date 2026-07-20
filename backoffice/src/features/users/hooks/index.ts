/**
 * @fileoverview React Query hooks for user operations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { UserQueryParams } from '../types';
import * as usersService from '../services';

export const userKeys = {
  all: () => ['users'] as const,
  list: (params?: UserQueryParams) =>
    [...userKeys.all(), 'list', params] as const,
  detail: (id: string) => [...userKeys.all(), 'detail', id] as const,
  current: () => [...userKeys.all(), 'current'] as const,
  teams: () => ['teams'] as const,
  teamDetail: (id: string) => [...userKeys.teams(), 'detail', id] as const,
};

/**
 * Get current user profile
 */
export function useCurrentUser() {
  return useQuery({
    queryKey: userKeys.current(),
    queryFn: usersService.getCurrentUserService,
    staleTime: 10 * 60 * 1000,
  });
}

/**
 *Get all users
 */
export function useUsers(params?: UserQueryParams) {
  return useQuery({
    queryKey: userKeys.list(params),
    queryFn: () => usersService.getUsersService(params),
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Get user by ID
 */
export function useUserById(id: string) {
  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: () => usersService.getUserByIdService(id),
    enabled: !!id,
  });
}

/**
 * Create user mutation
 */
export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: usersService.createUserService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.list() });
    },
  });
}

/**
 * Update user mutation
 */
export function useUpdateUser(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => usersService.updateUserService(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: userKeys.list() });
      if (id === 'me') {
        queryClient.invalidateQueries({ queryKey: userKeys.current() });
      }
    },
  });
}

/**
 * Update user status mutation
 */
export function useUpdateUserStatus(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => usersService.updateUserStatusService(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: userKeys.list() });
    },
  });
}

/**
 * Update user role mutation
 */
export function useUpdateUserRole(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => usersService.updateUserRoleService(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: userKeys.list() });
    },
  });
}

/**
 * Change password mutation
 */
export function useChangePassword() {
  return useMutation({
    mutationFn: usersService.changePasswordService,
  });
}

/**
 * Update user avatar mutation
 */
export function useUpdateUserAvatar(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) =>
      usersService.updateUserAvatarService(id, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.detail(id) });
      if (id === 'me') {
        queryClient.invalidateQueries({ queryKey: userKeys.current() });
      }
    },
  });
}

/**
 * Get teams query
 */
export function useTeams() {
  return useQuery({
    queryKey: userKeys.teams(),
    queryFn: usersService.getTeamsService,
    staleTime: 10 * 60 * 1000,
  });
}

/**
 * Get team by ID
 */
export function useTeamById(id: string) {
  return useQuery({
    queryKey: userKeys.teamDetail(id),
    queryFn: () => usersService.getTeamByIdService(id),
    enabled: !!id,
  });
}

/**
 * Delete user mutation
 */
export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: usersService.deleteUserService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.list() });
    },
  });
}

/**
 * Verify user email mutation
 */
export function useVerifyUserEmail(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (token: string) =>
      usersService.verifyUserEmailService(id, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.detail(id) });
    },
  });
}

/**
 * Resend verification email mutation
 */
export function useResendVerificationEmail(id: string) {
  return useMutation({
    mutationFn: () =>
      usersService.resendVerificationEmailService(id),
  });
}