"use client";

import type { Metadata } from 'next';
import { AlertProvider } from '@/providers/AlertContext';

// Note: Metadata export not supported in client components
// export const metadata: Metadata = {
//   title: 'Documents - Contracts | Real Estate Platform',
//   description: 'Manage contract related documents',
// };

export default function DocumentsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AlertProvider>
      {children}
    </AlertProvider>
  );
}
