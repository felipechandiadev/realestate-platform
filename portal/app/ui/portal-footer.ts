export type PortalFooterMenuItem = {
  id: string;
  label: string;
  href: string;
  enabled: boolean;
};

export type PortalFooterConfig = {
  logoUrl?: string | null;
  showCompany: boolean;
  showAddress: boolean;
  showPhone: boolean;
  showHours: boolean;
  showMail: boolean;
  showSocial: boolean;
  showPartnerships: boolean;
  showFaqs: boolean;
  showCopyright: boolean;
  menuTitle: string;
  contactTitle: string;
  socialTitle: string;
  partnershipsTitle: string;
  faqsTitle: string;
  copyrightSuffix: string;
  menuItems: PortalFooterMenuItem[];
};

export const FALLBACK_PORTAL_FOOTER: PortalFooterConfig = {
  logoUrl: null,
  showCompany: true,
  showAddress: true,
  showPhone: true,
  showHours: true,
  showMail: true,
  showSocial: true,
  showPartnerships: true,
  showFaqs: true,
  showCopyright: true,
  menuTitle: 'Menu',
  contactTitle: 'Contacto',
  socialTitle: 'Síguenos en redes sociales',
  partnershipsTitle: 'Nuestras alianzas',
  faqsTitle: 'FAQs',
  copyrightSuffix: 'Todos los derechos reservados.',
  menuItems: [
    { id: 'inicio', label: 'Inicio', href: '/', enabled: true },
    { id: 'arriendos', label: 'Arriendos', href: '/properties/rent', enabled: true },
    { id: 'ventas', label: 'Ventas', href: '/properties/sale', enabled: true },
    { id: 'administraciones', label: 'Administraciones', href: '/services/management', enabled: true },
    { id: 'publica', label: 'Publica tu propiedad', href: '/publish', enabled: true },
    { id: 'equipo', label: 'Nuestro equipo', href: '/ourTeam', enabled: true },
    { id: 'testimonios', label: 'Testimonios', href: '/testimonials', enabled: true },
    { id: 'blog', label: 'Blog', href: '/blog', enabled: true },
    { id: 'privacidad', label: 'Privacidad', href: '/privacidad', enabled: true },
  ],
};
