'use client';

import React, { createContext, useContext, useState } from 'react';

interface SplashCompletedContextType {
  splashCompleted: boolean;
  setSplashCompleted: (completed: boolean) => void;
}

const SplashCompletedContext = createContext<SplashCompletedContextType | undefined>(undefined);

export function SplashCompletedProvider({ children }: { children: React.ReactNode }) {
  // Track if splash has been shown and hidden once in this session
  const [splashCompleted, setSplashCompleted] = useState(false);

  return (
    <SplashCompletedContext.Provider value={{ splashCompleted, setSplashCompleted }}>
      {children}
    </SplashCompletedContext.Provider>
  );
}

export function useSplashCompleted() {
  const context = useContext(SplashCompletedContext);
  if (!context) {
    throw new Error('useSplashCompleted must be used within SplashCompletedProvider');
  }
  return context;
}
