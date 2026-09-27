import type { Metadata } from 'next';
import './globals.css';
import ClientProviders from './ClientProviders';
import PortalShell from './layout.portal';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getIdentity } from '@/features/cms/actions/identity.action';
import { getPortalHeader } from '@/features/cms/actions/portal-header.action';

export async function generateMetadata(): Promise<Metadata> {
  try {
    const identity = await getIdentity();
    return { title: identity?.name || 'Real Estate Portal' };
  } catch {
    return { title: 'Real Estate Portal' };
  }
}

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [session, identity, portalHeader] = await Promise.all([
    getServerSession(authOptions),
    getIdentity(),
    getPortalHeader(),
  ]);
  return (
    <html lang="es" style={{ colorScheme: 'only light' }}>
      <body>
        <ClientProviders session={session}>
          <PortalShell initialIdentity={identity} initialHeader={portalHeader}>{children}</PortalShell>
        </ClientProviders>
      </body>
    </html>
  );
}
