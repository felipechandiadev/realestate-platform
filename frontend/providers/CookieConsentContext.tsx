'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

type ConsentStatus = 'pending' | 'accepted' | 'rejected';

interface CookieConsentContextType {
  consentStatus: ConsentStatus;
  acceptCookies: () => void;
  rejectCookies: () => void;
  hasConsented: boolean;
}

const CookieConsentContext = createContext<CookieConsentContextType | null>(null);

export function CookieConsentProvider({ children }: { children: ReactNode }) {
  const [consentStatus, setConsentStatus] = useState<ConsentStatus>('pending');

  // Check initial consent status on mount
  useEffect(() => {
    const consentCookie = document.cookie
      .split('; ')
      .find((row) => row.startsWith('cookieConsent='));

    if (consentCookie) {
      const value = consentCookie.split('=')[1];
      if (value === 'accepted') {
        setConsentStatus('accepted');
      } else if (value === 'rejected') {
        setConsentStatus('rejected');
      }
    }
  }, []);

  const setCookieConsent = useCallback((status: 'accepted' | 'rejected') => {
    const date = new Date();
    date.setTime(date.getTime() + 365 * 24 * 60 * 60 * 1000);
    const expires = `expires=${date.toUTCString()}`;
    document.cookie = `cookieConsent=${status}; ${expires}; path=/`;
    setConsentStatus(status);
  }, []);

  const acceptCookies = useCallback(() => {
    setCookieConsent('accepted');
  }, [setCookieConsent]);

  const rejectCookies = useCallback(() => {
    setCookieConsent('rejected');
  }, [setCookieConsent]);

  const hasConsented = consentStatus === 'accepted';

  return (
    <CookieConsentContext.Provider
      value={{
        consentStatus,
        acceptCookies,
        rejectCookies,
        hasConsented,
      }}
    >
      {children}
    </CookieConsentContext.Provider>
  );
}

export function useCookieConsent() {
  const context = useContext(CookieConsentContext);
  if (!context) {
    throw new Error('useCookieConsent must be used within a CookieConsentProvider');
  }
  return context;
}
