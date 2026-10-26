import type { Metadata, Viewport } from 'next';
import './globals.css';
import ClientProviders from './ClientProviders';
import BackofficeShell from './BackofficeShell';
import AdminAmbientBackground from '@/shared/components/AdminAmbientBackground/AdminAmbientBackground';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getIdentity } from '@/features/cms/actions/identity.action';
import { getAppearance } from '@/features/cms/actions/appearance.action';
import {
  DEFAULT_APPEARANCE,
  appearanceStyle,
  resolveAppearance,
} from '@realestate/ui/theme/appearance-theme';

const APP_NAME = 'Bravo Backoffice';
const APP_DEFAULT_TITLE = 'Bravo Backoffice';

export const viewport: Viewport = {
  themeColor: '#1B5E20',
};

export async function generateMetadata(): Promise<Metadata> {
  let title = APP_DEFAULT_TITLE;
  try {
    const identity = await getIdentity();
    title = identity?.name || APP_DEFAULT_TITLE;
  } catch {
    // keep default
  }

  return {
    applicationName: APP_NAME,
    title,
    description: 'Backoffice Bravo — gestión inmobiliaria',
    // Herramienta interna: no debe aparecer en buscadores.
    robots: { index: false, follow: false },
    appleWebApp: {
      capable: true,
      statusBarStyle: 'default',
      title: APP_NAME,
    },
    formatDetection: {
      telephone: false,
    },
    icons: {
      icon: [
        { url: '/favicon.ico', sizes: 'any' },
        { url: '/icon.png', sizes: '512x512', type: 'image/png' },
        { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
        { url: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
      ],
      apple: [{ url: '/apple-icon.png', sizes: '180x180', type: 'image/png' }],
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [session, identity, appearance] = await Promise.all([
    getServerSession(authOptions),
    getIdentity(),
    getAppearance().catch(() => DEFAULT_APPEARANCE),
  ]);
  return (
    <html lang="es" style={{ colorScheme: 'only light', ...appearanceStyle(resolveAppearance(appearance)) }}>
      <body className="min-h-full flex flex-col">
        <div className="backoffice-app-shell flex min-h-dvh flex-1 flex-col">
          <AdminAmbientBackground />
          <div className="relative z-10 flex min-h-dvh flex-1 flex-col">
            <ClientProviders session={session}>
              <BackofficeShell initialIdentity={identity}>{children}</BackofficeShell>
            </ClientProviders>
          </div>
        </div>
      </body>
    </html>
  );
}
