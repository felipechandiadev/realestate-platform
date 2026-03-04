"use client";
import React, { createContext, useContext, useState, useCallback, ReactNode, useMemo } from 'react';
import Alert from '@/shared/components/ui/Alert/Alert';
import IconButton from '@/shared/components/ui/IconButton/IconButton';

export type AppAlert = {
  id: string;
  message: string;
  type?: 'success' | 'error' | 'info' | 'warning';
  duration?: number; // ms
};

type AlertContextType = {
  alerts: AppAlert[];
  showAlert: (alert: Omit<AppAlert, 'id'>) => void;
  removeAlert: (id: string) => void;
  success: (message: string, opts?: Omit<AppAlert, 'id' | 'message' | 'type'>) => void;
  error: (message: string, opts?: Omit<AppAlert, 'id' | 'message' | 'type'>) => void;
  info: (message: string, opts?: Omit<AppAlert, 'id' | 'message' | 'type'>) => void;
  warning: (message: string, opts?: Omit<AppAlert, 'id' | 'message' | 'type'>) => void;
};

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export function AlertProvider({ children }: { children: ReactNode }) {
  const [alerts, setAlerts] = useState<AppAlert[]>([]);

  const showAlert = useCallback((alert: Omit<AppAlert, 'id'>) => {
    const id = Math.random().toString(36).slice(2, 10);
    setAlerts((prev) => [...prev, { ...alert, id }]);
    if (alert.duration && alert.duration > 0) {
      setTimeout(() => {
        setAlerts((prev) => prev.filter((a) => a.id !== id));
      }, alert.duration);
    }
  }, []);

  const removeAlert = useCallback((id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  }, []);

  // Helper shortcuts
  const success = useCallback<AlertContextType['success']>((message, opts) => {
    showAlert({ message, type: 'success', duration: opts?.duration ?? 4000 });
  }, [showAlert]);

  const error = useCallback<AlertContextType['error']>((message, opts) => {
    showAlert({ message, type: 'error', duration: opts?.duration ?? 6000 });
  }, [showAlert]);

  const info = useCallback<AlertContextType['info']>((message, opts) => {
    showAlert({ message, type: 'info', duration: opts?.duration ?? 4000 });
  }, [showAlert]);

  const warning = useCallback<AlertContextType['warning']>((message, opts) => {
    showAlert({ message, type: 'warning', duration: opts?.duration ?? 5000 });
  }, [showAlert]);

  const value = useMemo<AlertContextType>(() => ({
    alerts,
    showAlert,
    removeAlert,
    success,
    error,
    info,
    warning,
  }), [alerts, showAlert, removeAlert, success, error, info, warning]);

  return (
    <AlertContext.Provider value={value}>
      {children}
      {/* Alerts stack (top-right) */}
      {alerts.length > 0 && (
        <div className="fixed top-20 right-4 z-50 flex flex-col gap-3 max-w-md">
          {alerts.map(({ id, message, type = 'info' }) => (
            <div key={id} className="shadow-sm">
              <Alert variant={type}>
                <div className="flex items-start gap-3 w-full pr-7">
                  <div className="flex-1 break-words">{message}</div>
                  <IconButton
                    icon="close"
                    variant="text"
                    size="sm"
                    ariaLabel="Cerrar alerta"
                    className="absolute right-1 top-1 text-secondary"
                    onClick={() => removeAlert(id)}
                  />
                </div>
              </Alert>
            </div>
          ))}
        </div>
      )}
    </AlertContext.Provider>
  );
}

export function useAlertContext() {
  const ctx = useContext(AlertContext);
  if (!ctx) throw new Error('useAlertContext must be used within an AlertProvider');
  return ctx;
}

// Convenience alias that reads better in components
export const useAlert = useAlertContext;
