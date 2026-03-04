import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authService } from "../services";
import type { LoginCredentials, RegisterInput, PasswordResetRequest, PasswordReset } from "../types";

const AUTH_QUERY_KEY = ["auth"];
const CURRENT_USER_QUERY_KEY = [...AUTH_QUERY_KEY, "current-user"];

export function useCurrentUser() {
  return useQuery({
    queryKey: CURRENT_USER_QUERY_KEY,
    queryFn: () => authService.getCurrentUser(),
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
}

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (credentials: LoginCredentials) => authService.login(credentials),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CURRENT_USER_QUERY_KEY });
    },
  });
}

export function useRegister() {
  return useMutation({
    mutationFn: (data: RegisterInput) => authService.register(data),
  });
}

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEY });
      queryClient.clear();
    },
  });
}

export function useRefreshToken() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => authService.refreshToken(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CURRENT_USER_QUERY_KEY });
    },
  });
}

export function useRequestPasswordReset() {
  return useMutation({
    mutationFn: (data: PasswordResetRequest) => authService.requestPasswordReset(data),
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: (data: PasswordReset) => authService.resetPassword(data),
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Parameters<typeof authService.updateProfile>[0]) => authService.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CURRENT_USER_QUERY_KEY });
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: ({ currentPassword, newPassword }: { currentPassword: string; newPassword: string }) =>
      authService.changePassword(currentPassword, newPassword),
  });
}

export function useVerifyEmail() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (token: string) => authService.verifyEmail(token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CURRENT_USER_QUERY_KEY });
    },
  });
}

export function useResendVerificationEmail() {
  return useMutation({
    mutationFn: () => authService.resendVerificationEmail(),
  });
}

export function useLoginWithProvider() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ provider, token }: { provider: "google" | "github"; token: string }) =>
      authService.loginWithProvider(provider, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CURRENT_USER_QUERY_KEY });
    },
  });
}

export function useAuth() {
  const currentUser = useCurrentUser();
  const login = useLogin();
  const register = useRegister();
  const logout = useLogout();

  return {
    user: currentUser.data,
    isLoading: currentUser.isLoading,
    isError: currentUser.isError,
    login: login.mutateAsync,
    register: register.mutateAsync,
    logout: logout.mutateAsync,
  };
}