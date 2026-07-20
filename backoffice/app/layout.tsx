import type { Metadata } from 'next';
import './globals.css';
import ClientProviders from './ClientProviders';
import BackofficeShell from './BackofficeShell';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getIdentity } from '@/features/cms/actions/identity.action';

export async function generateMetadata(): Promise<Metadata> {
  try {
    const identity = await getIdentity();
    return { title: identity?.name || 'Real Estate Backoffice' };
  } catch {
    return { title: 'Real Estate Backoffice' };
  }
}

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await getServerSession(authOptions);
  return (
    <html lang="es">
      <body>
        <ClientProviders session={session}>
          <BackofficeShell>{children}</BackofficeShell>
        </ClientProviders>
      </body>
    </html>
  );
}
