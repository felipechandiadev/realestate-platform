"use client";

import TopBar from '@/shared/components/ui/TopBar/TopBar';
import React, { useEffect, useState } from 'react';
import { useSession } from "next-auth/react";
import { getIdentityLogoUrl, getIdentity } from '@/features/backoffice/cms/actions/identity.action';
import MyAccountDialog from './users/ui/myAccount/MyAccountDialog';

const menuItems = [
  { label: 'Dashboard', url: '/backOffice' },
  {
    label: 'Propiedades',
    children: [
      { label: 'Venta', url: '/backOffice/properties/sales' },
      { label: 'Arriendo', url: '/backOffice/properties/rent' },
      { label: 'Tipos de propiedad', url: '/backOffice/properties/propertyTypes' },
      // { label: 'Solicitudes de publicación' },
      // { label: 'Valoraciones' },
    ],
  },
  // {
  //   label: 'Contratos',
  //   children: [
  //     { label: 'Contratos' },
  //     { label: 'Personas' },
  //     { label: 'Documentos' },
  //   ],
  // },
  {
    label: 'Contratos',
    children: [
      { label: 'Compraventa', url: '/backOffice/contracts/sales' },
      { label: 'Arriendo', url: '/backOffice/contracts/rent' },
      { label: 'Personas', url: '/backOffice/contracts/persons' },
      { label: 'Documentos', url: '/backOffice/contracts/documents' },
      { label: 'Tipos de Documentos', url: '/backOffice/contracts/documentTypes' },
      // { label: 'Contratos' },
      // { label: 'Documentos' },
    ],
  },
  {
    label: 'Usuarios',
    children: [
      { label: 'Administradores', url: '/backOffice/users/administrators' },
      { label: 'Agentes', url: '/backOffice/users/agents' },
      { label: 'Comunidad', url: '/backOffice/users/community' },
    ],
  },
  {
    label: 'CMS',
    children: [
      { label: 'Slider', url: '/backOffice/cms/slider' },
      { label: 'Sobre nosotros', url: '/backOffice/cms/aboutUs' },
      { label: 'Nuestro Equipo', url: '/backOffice/cms/ourTeam' },
      { label: 'Testimonios', url: '/backOffice/cms/testimonials' },
      { label: 'Artículos de blog', url: '/backOffice/cms/articles' },
      { label: 'Identidad de la empresa', url: '/backOffice/cms/identity' },
    ],
  },
  // { label: 'Reportes' },
  // { label: 'Auditoría' },
  { label: 'Notificaciones', url: '/backOffice/notifications' },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();

  // State to store the logo URL
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  
  // State to store the company name
  const [companyName, setCompanyName] = useState<string>("");

  // State for MyAccount dialog
  const [showMyAccountDialog, setShowMyAccountDialog] = useState(false);

  // Fetch the logo URL and company name on component mount
  useEffect(() => {
    async function fetchIdentityData() {
      try {
        // Fetch logo URL
        const url = await getIdentityLogoUrl();
        setLogoUrl(url);
        console.log("Fetched logo URL:", url);
        
        // Fetch company name
        const identity = await getIdentity();
        if (identity?.name) {
          setCompanyName(identity.name);
          console.log("Fetched company name:", identity.name);
        } else {
          setCompanyName("");
        }
      } catch (error) {
        console.error("Error fetching identity data:", error);
        setCompanyName("");
      }
    }
    fetchIdentityData();
  }, []);

  // Extrae el nombre de la persona desde la sesión NextAuth
  const userName =
    session?.user?.name ||
    "Invitado";

  return (
    <div>
      <TopBar
        title={companyName}
        menuItems={menuItems}
        userName={userName}
        logoSrc={logoUrl || undefined} // Convert null to undefined
        showNotifications={true}
      />
      <div className="min-h-screen bg-background p-6">
        <MyAccountDialog
          open={showMyAccountDialog}
          onClose={() => setShowMyAccountDialog(false)}
        />

        <main className="w-full max-w-[98%] mx-auto px-4 pt-16">{children}</main>
      </div>
    </div>
  );
}

