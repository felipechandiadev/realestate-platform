import type { Metadata } from 'next';
import './globals.css';
import ClientProviders from './ClientProviders';
import BackofficeShell from './BackofficeShell';
import AdminAmbientBackground from '@/shared/components/AdminAmbientBackground/AdminAmbientBackground';
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
      <body className="min-h-full flex flex-col">
        <div className="backoffice-app-shell flex min-h-dvh flex-1 flex-col">
          <AdminAmbientBackground />
          <div className="relative z-10 flex min-h-dvh flex-1 flex-col">
            <ClientProviders session={session}>
              <BackofficeShell>{children}</BackofficeShell>
            </ClientProviders>
          </div>
        </div>
      </body>
    </html>
  );
}
