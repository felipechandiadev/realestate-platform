import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Documents - Contracts | Real Estate Platform',
  description: 'Manage contract related documents',
};

export default function DocumentsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
