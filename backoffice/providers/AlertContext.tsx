"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useEffect,
  ReactNode,
  useMemo,
} from "react";
import { Toast, ToastViewport } from "@realestate/ui";

export type AppAlert = {
  id: string;
  message: string;
  type?: "success" | "error" | "info" | "warning";
  duration?: number; // ms; 0 = no auto-dismiss
  exiting?: boolean;
};

type AlertContextType = {
  alerts: AppAlert[];
  showAlert: (alert: Omit<AppAlert, "id" | "exiting">) => void;
  removeAlert: (id: string) => void;
  success: (message: string, opts?: Omit<AppAlert, "id" | "message" | "type" | "exiting">) => void;
  error: (message: string, opts?: Omit<AppAlert, "id" | "message" | "type" | "exiting">) => void;
  info: (message: string, opts?: Omit<AppAlert, "id" | "message" | "type" | "exiting">) => void;
  warning: (message: string, opts?: Omit<AppAlert, "id" | "message" | "type" | "exiting">) => void;
};

const AlertContext = createContext<AlertContextType | undefined>(undefined);

const MAX_STACK = 3;
const EXIT_MS = 220;

const DEFAULT_DURATION: Record<NonNullable<AppAlert["type"]>, number> = {
  success: 4000,
  info: 4000,
  warning: 5000,
  error: 6000,
};

type TimerEntry = {
  remaining: number;
  startedAt: number;
  timeoutId: ReturnType<typeof setTimeout> | null;
};

export function AlertProvider({ children }: { children: ReactNode }) {
  const [alerts, setAlerts] = useState<AppAlert[]>([]);
  const timersRef = useRef<Map<string, TimerEntry>>(new Map());
  const exitTimeoutsRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const clearTimer = useCallback((id: string) => {
    const entry = timersRef.current.get(id);
    if (entry?.timeoutId) {
      clearTimeout(entry.timeoutId);
    }
    timersRef.current.delete(id);
  }, []);

  const clearExitTimeout = useCallback((id: string) => {
    const exitTimeout = exitTimeoutsRef.current.get(id);
    if (exitTimeout) {
      clearTimeout(exitTimeout);
      exitTimeoutsRef.current.delete(id);
    }
  }, []);

  const beginExit = useCallback(
    (id: string) => {
      clearTimer(id);
      let shouldSchedule = false;
      setAlerts((prev) => {
        const target = prev.find((a) => a.id === id);
        if (!target || target.exiting) return prev;
        shouldSchedule = true;
        return prev.map((a) => (a.id === id ? { ...a, exiting: true } : a));
      });

      if (!shouldSchedule) return;

      clearExitTimeout(id);
      const timeoutId = setTimeout(() => {
        exitTimeoutsRef.current.delete(id);
        setAlerts((prev) => prev.filter((a) => a.id !== id));
      }, EXIT_MS);
      exitTimeoutsRef.current.set(id, timeoutId);
    },
    [clearExitTimeout, clearTimer],
  );

  const dropAlert = useCallback(
    (id: string) => {
      clearTimer(id);
      clearExitTimeout(id);
    },
    [clearExitTimeout, clearTimer],
  );

  const scheduleDismiss = useCallback(
    (id: string, duration: number) => {
      if (duration <= 0) return;
      clearTimer(id);
      const timeoutId = setTimeout(() => beginExit(id), duration);
      timersRef.current.set(id, {
        remaining: duration,
        startedAt: Date.now(),
        timeoutId,
      });
    },
    [beginExit, clearTimer],
  );

  const pauseTimer = useCallback((id: string) => {
    const entry = timersRef.current.get(id);
    if (!entry?.timeoutId) return;
    clearTimeout(entry.timeoutId);
    const elapsed = Date.now() - entry.startedAt;
    entry.remaining = Math.max(0, entry.remaining - elapsed);
    entry.timeoutId = null;
  }, []);

  const resumeTimer = useCallback(
    (id: string) => {
      const entry = timersRef.current.get(id);
      if (!entry || entry.timeoutId) return;
      if (entry.remaining <= 0) {
        beginExit(id);
        return;
      }
      entry.startedAt = Date.now();
      entry.timeoutId = setTimeout(() => beginExit(id), entry.remaining);
    },
    [beginExit],
  );

  useEffect(() => {
    return () => {
      timersRef.current.forEach((entry) => {
        if (entry.timeoutId) clearTimeout(entry.timeoutId);
      });
      timersRef.current.clear();
      exitTimeoutsRef.current.forEach((timeoutId) => clearTimeout(timeoutId));
      exitTimeoutsRef.current.clear();
    };
  }, []);

  const showAlert = useCallback(
    (alert: Omit<AppAlert, "id" | "exiting">) => {
      const type = alert.type ?? "info";
      const duration = alert.duration ?? DEFAULT_DURATION[type];
      let scheduled: { id: string; duration: number } | null = null;

      setAlerts((prev) => {
        const isDuplicate = prev.some(
          (existing) =>
            !existing.exiting &&
            existing.message === alert.message &&
            (existing.type ?? "info") === type,
        );
        if (isDuplicate) return prev;

        const id = Math.random().toString(36).slice(2, 10);
        const next: AppAlert = {
          id,
          message: alert.message,
          type,
          duration,
        };

        const active = prev.filter((a) => !a.exiting);
        const overflow = active.length + 1 - MAX_STACK;
        let base = prev;
        if (overflow > 0) {
          const toDrop = active.slice(0, overflow);
          toDrop.forEach((a) => dropAlert(a.id));
          const dropIds = new Set(toDrop.map((a) => a.id));
          base = prev.filter((a) => !dropIds.has(a.id));
        }

        scheduled = { id, duration };
        return [...base, next];
      });

      if (scheduled) {
        scheduleDismiss(scheduled.id, scheduled.duration);
      }
    },
    [dropAlert, scheduleDismiss],
  );

  const removeAlert = useCallback(
    (id: string) => {
      beginExit(id);
    },
    [beginExit],
  );

  const success = useCallback<AlertContextType["success"]>(
    (message, opts) => {
      showAlert({ message, type: "success", duration: opts?.duration ?? 4000 });
    },
    [showAlert],
  );

  const error = useCallback<AlertContextType["error"]>(
    (message, opts) => {
      showAlert({ message, type: "error", duration: opts?.duration ?? 6000 });
    },
    [showAlert],
  );

  const info = useCallback<AlertContextType["info"]>(
    (message, opts) => {
      showAlert({ message, type: "info", duration: opts?.duration ?? 4000 });
    },
    [showAlert],
  );

  const warning = useCallback<AlertContextType["warning"]>(
    (message, opts) => {
      showAlert({ message, type: "warning", duration: opts?.duration ?? 5000 });
    },
    [showAlert],
  );

  const value = useMemo<AlertContextType>(
    () => ({
      alerts,
      showAlert,
      removeAlert,
      success,
      error,
      info,
      warning,
    }),
    [alerts, showAlert, removeAlert, success, error, info, warning],
  );

  return (
    <AlertContext.Provider value={value}>
      {children}
      <ToastViewport>
        {alerts.map(({ id, message, type = "info", exiting }) => (
          <Toast
            key={id}
            variant={type}
            message={message}
            exiting={Boolean(exiting)}
            onClose={() => removeAlert(id)}
            onMouseEnter={() => pauseTimer(id)}
            onMouseLeave={() => resumeTimer(id)}
          />
        ))}
      </ToastViewport>
    </AlertContext.Provider>
  );
}

export function useAlertContext() {
  const ctx = useContext(AlertContext);
  if (!ctx) throw new Error("useAlertContext must be used within an AlertProvider");
  return ctx;
}

export const useAlert = useAlertContext;
