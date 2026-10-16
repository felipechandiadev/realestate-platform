import type { Metadata } from 'next';
import './globals.css';
import ClientProviders from './ClientProviders';
import PortalShell from './layout.portal';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getIdentity } from '@/features/cms/actions/identity.action';
import { getPortalHeader } from '@/features/cms/actions/portal-header.action';
import { getPortalFooter } from '@/features/cms/actions/portal-footer.action';
import { getAppearance } from '@/features/cms/actions/appearance.action';
import { appearanceStyle } from '@realestate/ui/theme/appearance-theme';

export async function generateMetadata(): Promise<Metadata> {
  const icons: Metadata['icons'] = {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon.png', sizes: '512x512', type: 'image/png' },
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: [{ url: '/apple-icon.png', sizes: '180x180', type: 'image/png' }],
  };

  try {
    const identity = await getIdentity();
    return {
      title: identity?.name || 'Real Estate Portal',
      icons,
    };
  } catch {
    return { title: 'Real Estate Portal', icons };
  }
}

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [session, identity, portalHeader, portalFooter, appearance] = await Promise.all([
    getServerSession(authOptions),
    getIdentity(),
    getPortalHeader(),
    getPortalFooter(),
    getAppearance(),
  ]);
  return (
    <html lang="es" style={{ colorScheme: 'only light', ...appearanceStyle(appearance) }}>
      <body>
        <ClientProviders session={session}>
          <PortalShell initialIdentity={identity} initialHeader={portalHeader} initialFooter={portalFooter}>{children}</PortalShell>
        </ClientProviders>
      </body>
    </html>
  );
}
