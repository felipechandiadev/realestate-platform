import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Persons - Contracts | Real Estate Platform',
  description: 'Manage persons in contracts',
};

export default function PersonsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
