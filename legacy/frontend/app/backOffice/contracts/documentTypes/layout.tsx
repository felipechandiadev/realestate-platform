"use client";

import { AlertProvider } from '@/providers/AlertContext';

export default function DocumentTypesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="p-6">
      <AlertProvider>
        {children}
      </AlertProvider>
    </div>
  );
}
