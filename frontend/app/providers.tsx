"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import { logoutAction } from "@/features/shared/auth/actions/auth.action";
import { getUserFavoriteIds } from "@/features/backoffice/users/actions/users.action";
import { useEffect } from "react";

type AuthContextUser = {
  id?: string;
  name?: string | null;
  email?: string | null;
  role?: string;
  personId?: string;
};

type LoginResult =
  | { success: true }
  | { success: false; error: string };

type AuthContextValue = {
  user: AuthContextUser | null;
  status: "loading" | "authenticated" | "unauthenticated";
  isAuthenticated: boolean;
  accessToken?: string;
  login: (email: string, password: string) => Promise<LoginResult>;
  logout: (options?: { redirectTo?: string }) => Promise<void>;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

type AuthContextProviderProps = {
  children: ReactNode;
};

export function AuthContextProvider({ children }: AuthContextProviderProps) {
  const { data: session, status, update } = useSession();

  const accessToken = (session as (typeof session & { accessToken?: string }) | null)?.accessToken;

  const login = useCallback<AuthContextValue["login"]>(
    async (email, password) => {
      try {
        // Usar el endpoint API personalizado para obtener el token
        const apiResponse = await fetch('/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password }),
        });

        const apiPayload = await apiResponse.json();

        // Si hay error específico del backend
        if (!apiResponse.ok || !apiPayload.success) {
          if (apiPayload.error === 'EMAIL_NOT_VERIFIED') {
            return {
              success: false,
              error: 'EMAIL_NOT_VERIFIED',
            };
          }
          return {
            success: false,
            error: apiPayload.error || 'Credenciales inválidas',
          };
        }

        // Si el login fue exitoso, usar NextAuth para establecer la sesión
        const result = await signIn("credentials", {
          redirect: false,
          email,
          password,
        });

        if (!result?.ok) {
          return {
            success: false,
            error: 'Error al establecer la sesión',
          };
        }

        const updatedSession = await update();

        const userRole =
          updatedSession?.user && "role" in updatedSession.user
            ? (updatedSession.user as { role?: string }).role
            : undefined;

        if (userRole === "ADMIN" || userRole === "AGENT") {
          window.location.href = "/backOffice";
        }

        return { success: true };
      } catch (error) {
        console.error("AuthContext login error", error);
        return {
          success: false,
          error: "Error de red o backend",
        };
      }
    },
    [update],
  );

  const logout = useCallback<AuthContextValue["logout"]>(
    async (options) => {
      const result = await logoutAction(accessToken ?? undefined);
      if (!result.success) {
        console.error(result.error);
      }

      const redirectTo = options?.redirectTo;
      if (redirectTo) {
        await signOut({ callbackUrl: redirectTo, redirect: true });
        return;
      }

      await signOut({ redirect: false });
      await update();
    },
    [accessToken, update],
  );

  const refresh = useCallback(async () => {
    await update();
  }, [update]);

  // Sync favorites cookie when authenticated
  useEffect(() => {
    if (status === "authenticated" && session?.user?.id) {
      const userId = session.user.id;
      const syncFavorites = async () => {
        try {
          const favoriteIds = await getUserFavoriteIds(userId);
          
          // Save to cookie (same format and path as PropertyCard)
          const expires = new Date();
          expires.setTime(expires.getTime() + 365 * 24 * 60 * 60 * 1000);
          document.cookie = `favorites=${encodeURIComponent(JSON.stringify(favoriteIds))}; expires=${expires.toUTCString()}; path=/`;
          
          console.log("✅ Favorites synchronized for user:", userId);
        } catch (error) {
          console.error("❌ Error syncing favorites:", error);
        }
      };
      
      syncFavorites();
    }
  }, [status, session?.user?.id]);

  const value = useMemo<AuthContextValue>(() => {
    const authUser = session?.user
      ? {
          id: "id" in session.user ? (session.user as { id?: string }).id : undefined,
          role:
            "role" in session.user
              ? (session.user as { role?: string }).role
              : undefined,
          personId:
            "personId" in session.user
              ? (session.user as { personId?: string }).personId
              : undefined,
          name: session.user.name,
          email: session.user.email,
        }
      : null;

    return {
      user: authUser,
      status,
      isAuthenticated: status === "authenticated",
      accessToken,
      login,
      logout,
      refresh,
    };
  }, [session, status, login, logout, refresh, accessToken]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthContextProvider");
  }
  return context;
}
