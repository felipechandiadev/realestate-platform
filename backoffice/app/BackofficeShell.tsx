'use client';

import TopBar from '@/shared/components/ui/TopBar/TopBar';
import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { getIdentityLogoUrl, getIdentity } from '@/features/cms/actions/identity.action';
import MyAccountDialog from './users/ui/myAccount/MyAccountDialog';

const menuItems = [
  { label: 'Dashboard', url: '/' },
  {
    label: 'Propiedades',
    children: [
      { label: 'Venta', url: '/properties/sales' },
      { label: 'Arriendo', url: '/properties/rent' },
      { label: 'Tipos de propiedad', url: '/properties/propertyTypes' },
    ],
  },
  {
    label: 'Contratos',
    children: [
      { label: 'Compraventa', url: '/contracts/sales' },
      { label: 'Arriendo', url: '/contracts/rent' },
      { label: 'Personas', url: '/contracts/persons' },
      { label: 'Documentos', url: '/contracts/documents' },
      { label: 'Tipos de Documentos', url: '/contracts/documentTypes' },
    ],
  },
  {
    label: 'Usuarios',
    children: [
      { label: 'Administradores', url: '/users/administrators' },
      { label: 'Agentes', url: '/users/agents' },
      { label: 'Comunidad', url: '/users/community' },
    ],
  },
  {
    label: 'CMS',
    children: [
      { label: 'Slider', url: '/cms/slider' },
      { label: 'Sobre nosotros', url: '/cms/aboutUs' },
      { label: 'Nuestro Equipo', url: '/cms/ourTeam' },
      { label: 'Testimonios', url: '/cms/testimonials' },
      { label: 'Artículos de blog', url: '/cms/articles' },
      { label: 'Identidad de la empresa', url: '/cms/identity' },
      { label: 'Top Bar', url: '/cms/topBar' },
    ],
  },
  { label: 'Notificaciones', url: '/notifications' },
];

type IdentityBranding = {
  name?: string | null;
  urlLogo?: string | null;
};

export default function BackofficeShell({
  children,
  initialIdentity = null,
}: {
  children: React.ReactNode;
  initialIdentity?: IdentityBranding | null;
}) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const seededName = initialIdentity?.name?.trim() || '';
  const seededLogo = initialIdentity?.urlLogo?.trim() || null;
  const [logoUrl, setLogoUrl] = useState<string | null>(seededLogo);
  const [companyName, setCompanyName] = useState<string>(seededName);
  const [showMyAccountDialog, setShowMyAccountDialog] = useState(false);

  useEffect(() => {
    if (pathname?.startsWith('/login')) return;
    if (seededName || seededLogo) return;
    async function fetchIdentityData() {
      try {
        const url = await getIdentityLogoUrl();
        setLogoUrl(url);
        const identity = await getIdentity();
        setCompanyName(identity?.name || '');
      } catch {
        setCompanyName('');
      }
    }
    fetchIdentityData();
  }, [pathname, seededName, seededLogo]);

  if (pathname?.startsWith('/login')) {
    return <>{children}</>;
  }

  const userName = session?.user?.name || 'Invitado';

  return (
    <div className="flex min-h-dvh flex-1 flex-col">
      <TopBar
        title={companyName}
        menuItems={menuItems}
        userName={userName}
        logoSrc={logoUrl || undefined}
        showNotifications={true}
        onAccountClick={() => setShowMyAccountDialog(true)}
      />
      <div className="min-h-screen flex-1 p-2 sm:p-6">
        <MyAccountDialog
          open={showMyAccountDialog}
          onClose={() => setShowMyAccountDialog(false)}
        />
        <main className="mx-auto w-full max-w-[98%] px-2 pt-14 sm:px-4 sm:pt-16">{children}</main>
      </div>
    </div>
  );
}
