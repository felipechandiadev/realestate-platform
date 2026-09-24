"use client";

import React from 'react';
import { createRoot } from 'react-dom/client';
import Alert, { type AlertVariant } from '@/shared/components/ui/Alert/Alert';

export type AppAlert = {
  id: string;
  message: string;
  type?: AlertVariant;
  duration?: number; // ms
};

// Global state for alerts
let globalAlerts: AppAlert[] = [];
let globalRoot: any = null;
let alertContainer: HTMLElement | null = null;
let isRendering = false;

// Create alert container if it doesn't exist
function ensureAlertContainer() {
  if (!alertContainer) {
    // Create custom animation styles
    if (!document.getElementById('alert-custom-animations')) {
      const style = document.createElement('style');
      style.id = 'alert-custom-animations';
      style.textContent = `
        @keyframes slideInFadeIn {
          0% {
            transform: translateX(100%);
            opacity: 0;
          }
          100% {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        @keyframes fadeOut {
          0% {
            opacity: 1;
          }
          100% {
            opacity: 0;
          }
        }
        
        .alert-slide-fade-in {
          animation: slideInFadeIn 0.5s ease-out forwards;
        }
        
        .alert-fade-out {
          animation: fadeOut 0.3s ease-in forwards;
        }
      `;
      document.head.appendChild(style);
    }

    alertContainer = document.createElement('div');
    alertContainer.id = 'alert-container';
    alertContainer.style.position = 'fixed';
    alertContainer.style.top = '0';
    alertContainer.style.right = '0';
    alertContainer.style.zIndex = '9999';
    alertContainer.style.pointerEvents = 'none';
    alertContainer.style.width = '100%';
    alertContainer.style.height = '100%';
    document.body.appendChild(alertContainer);
  }
  return alertContainer;
}

// Render alerts component with stable rendering
function renderAlerts() {
  // Prevent concurrent renders
  if (isRendering) {
    return;
  }
  isRendering = true;

  // Use requestAnimationFrame for smooth rendering
  requestAnimationFrame(() => {
    try {
      const container = ensureAlertContainer();
      
      if (!globalRoot) {
        globalRoot = createRoot(container);
      }

      // Create stable component with custom animations
      const AlertsComponent = () => (
        <div className="fixed top-[10vh] right-4 z-50 space-y-2" style={{ pointerEvents: 'auto' }}>
          {globalAlerts.map((alert) => (
            <div
              key={alert.id}
              data-alert-id={alert.id}
              className="alert-slide-fade-in"
            >
              <Alert variant={alert.type || 'info'}>
                {alert.message}
              </Alert>
            </div>
          ))}
        </div>
      );

      globalRoot.render(<AlertsComponent />);
    } finally {
      isRendering = false;
    }
  });
}

function removeAlert(id: string) {
  // Find the alert element and apply fade-out animation
  const alertElement = document.querySelector(`[data-alert-id="${id}"]`) as HTMLElement;
  if (alertElement) {
    // Remove slide-in animation and apply fade-out
    alertElement.classList.remove('alert-slide-fade-in');
    alertElement.classList.add('alert-fade-out');
    
    // Wait for animation to complete before removing from state
    setTimeout(() => {
      globalAlerts = globalAlerts.filter(alert => alert.id !== id);
      renderAlerts();
    }, 300); // Match the fadeOut animation duration
  } else {
    // Fallback if element not found
    globalAlerts = globalAlerts.filter(alert => alert.id !== id);
    renderAlerts();
  }
}

// Singleton functions to avoid multiple instances
const showAlert = (alert: Omit<AppAlert, 'id'>) => {
  const id = Math.random().toString(36).slice(2, 10);
  const newAlert: AppAlert = { ...alert, id };
  
  // Check for duplicate messages to avoid spam
  const isDuplicate = globalAlerts.some(existingAlert => 
    existingAlert.message === alert.message && 
    existingAlert.type === alert.type
  );
  
  if (isDuplicate) {
    return; // Don't add duplicate alerts
  }
  
  globalAlerts.push(newAlert);
  
  // Render immediately without delay
  renderAlerts();
  
  // Auto-remove after longer duration for better visibility
  const duration = alert.duration || 8000; // Increased default from 5s to 8s
  setTimeout(() => {
    removeAlert(id);
  }, duration);
};

const clearAlerts = () => {
  globalAlerts = [];
  renderAlerts();
};

export function useAlert() {
  return { 
    showAlert,
    removeAlert,
    clearAlerts
  };
}
