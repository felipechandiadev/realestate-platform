export type PortalNavItem = {
  id: string;
  label: string;
  enabled: boolean;
  href?: string;
  action?: 'contact';
  children?: PortalNavItem[];
};

export type PortalAccountItem = {
  id: string;
  label: string;
  href: string;
  enabled: boolean;
};

export type PortalHeaderConfig = {
  logoUrl?: string | null;
  showCompanyName: boolean;
  showMail: boolean;
  showPhone: boolean;
  showUf: boolean;
  ufLabel: string;
  showLogin: boolean;
  showRegister: boolean;
  loginLabel: string;
  registerLabel: string;
  navItems: PortalNavItem[];
  accountItems: PortalAccountItem[];
};

export const FALLBACK_PORTAL_HEADER: PortalHeaderConfig = {
  logoUrl: null,
  showCompanyName: true,
  showMail: true,
  showPhone: true,
  showUf: true,
  ufLabel: 'UF hoy',
  showLogin: true,
  showRegister: true,
  loginLabel: 'Ingresar',
  registerLabel: 'Registrarse',
  navItems: [
    {
      id: 'propiedades',
      label: 'Propiedades',
      enabled: true,
      children: [
        { id: 'ventas', label: 'Ventas', href: '/properties/sale', enabled: true },
        { id: 'arriendos', label: 'Arriendos', href: '/properties/rent', enabled: true },
        { id: 'administraciones', label: 'Administraciones', href: '/services/management', enabled: true },
      ],
    },
    {
      id: 'nosotros',
      label: 'Nosotros',
      enabled: true,
      children: [
        { id: 'quienes-somos', label: 'Quiénes somos', href: '/aboutUs', enabled: true },
        { id: 'nuestro-equipo', label: 'Nuestro Equipo', href: '/ourTeam', enabled: true },
        { id: 'testimonios', label: 'Testimonios', href: '/testimonials', enabled: true },
      ],
    },
    { id: 'vende', label: 'Vende tu Propiedad', href: '/sell-property', enabled: true },
    { id: 'arrienda', label: 'Arrienda tu Propiedad', href: '/rent-property', enabled: true },
    { id: 'valoriza', label: 'Valoriza tu Propiedad', href: '/valuation', enabled: true },
    { id: 'blog', label: 'Blog', href: '/blog', enabled: true },
    { id: 'contacto', label: 'Contacto', action: 'contact', enabled: true },
  ],
  accountItems: [
    { id: 'mis-datos', label: 'Mis Datos', href: '/personalInfo', enabled: true },
    { id: 'notificaciones', label: 'Notificaciones', href: '/notifications', enabled: true },
    { id: 'mis-propiedades', label: 'Mis Propiedades', href: '/myProperties', enabled: true },
    { id: 'favoritos', label: 'Favoritos', href: '/favorites', enabled: true },
    { id: 'mis-contratos', label: 'Mis Contratos', href: '/myContracts', enabled: true },
  ],
};

export function visibleNavItems(items: PortalNavItem[]): PortalNavItem[] {
  return items
    .filter((item) => item.enabled !== false)
    .map((item) =>
      item.children
        ? { ...item, children: item.children.filter((child) => child.enabled !== false) }
        : item,
    )
    .filter((item) => !item.children || item.children.length > 0);
}

const NAV_ITEM_CLASS: Record<string, string> = {
  propiedades: 'relative',
  nosotros: 'relative hidden md:list-item',
  valoriza: 'hidden md:list-item',
  blog: 'hidden sm:block',
  contacto: 'hidden sm:list-item',
};

export function navItemClassName(id: string): string {
  return NAV_ITEM_CLASS[id] ?? '';
}
