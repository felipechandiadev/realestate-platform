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
import { portalPublicOrigin } from '@/shared/lib/seo-core';

const DEFAULT_SITE_NAME = 'Bravo Shott Propiedades';
const DEFAULT_DESCRIPTION =
  'Propiedades en venta y arriendo, administración y tasación de propiedades. Encuentra tu próxima casa, departamento o terreno.';

function siteMetadata(siteName: string, icons: Metadata['icons']): Metadata {
  return {
    metadataBase: new URL(portalPublicOrigin()),
    title: { default: siteName, template: `%s | ${siteName}` },
    description: DEFAULT_DESCRIPTION,
    applicationName: siteName,
    openGraph: {
      siteName,
      title: siteName,
      description: DEFAULT_DESCRIPTION,
      type: 'website',
      locale: 'es_CL',
    },
    icons,
  };
}

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
    return siteMetadata(identity?.name?.trim() || DEFAULT_SITE_NAME, icons);
  } catch {
    return siteMetadata(DEFAULT_SITE_NAME, icons);
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
