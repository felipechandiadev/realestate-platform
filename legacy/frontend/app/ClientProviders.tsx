"use client";

import { SessionProvider } from 'next-auth/react';
import { ReactNode } from 'react';
import { AlertProvider } from '@/providers/AlertContext';
import { NotificationProvider } from '@/providers/NotificationContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { SliderImagesReadyProvider } from '@/providers/SliderImagesReadyContext';
import { SplashCompletedProvider } from '@/providers/SplashCompletedContext';

import { AuthContextProvider } from "./providers";

type Props = {
  children: ReactNode;
};

export default function ClientProviders({ children, session }: Props & { session?: any }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 10, // 10 minutes (formerly cacheTime)
        retry: 1,
      },
    },
  }));

  return (
    <SessionProvider session={session} refetchOnWindowFocus={false}>
      <QueryClientProvider client={queryClient}>
        <AuthContextProvider>
          <AlertProvider>
            <NotificationProvider>
              <SplashCompletedProvider>
                <SliderImagesReadyProvider>
                  {children}
                </SliderImagesReadyProvider>
              </SplashCompletedProvider>
            </NotificationProvider>
          </AlertProvider>
        </AuthContextProvider>
      </QueryClientProvider>
    </SessionProvider>
  );
}
