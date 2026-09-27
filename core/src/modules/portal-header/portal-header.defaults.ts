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

export const DEFAULT_NAV_ITEMS: PortalNavItem[] = [
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
];

export const DEFAULT_ACCOUNT_ITEMS: PortalAccountItem[] = [
  { id: 'mis-datos', label: 'Mis Datos', href: '/personalInfo', enabled: true },
  { id: 'notificaciones', label: 'Notificaciones', href: '/notifications', enabled: true },
  { id: 'mis-propiedades', label: 'Mis Propiedades', href: '/myProperties', enabled: true },
  { id: 'favoritos', label: 'Favoritos', href: '/favorites', enabled: true },
  { id: 'mis-contratos', label: 'Mis Contratos', href: '/myContracts', enabled: true },
];

export function applyEnabledFlags<T extends { id: string; enabled: boolean; children?: T[] }>(
  catalog: T[],
  incoming: unknown,
): T[] {
  const rows = Array.isArray(incoming) ? incoming : [];
  return catalog.map((item) => {
    const match = rows.find((row) => row && typeof row === 'object' && (row as { id?: string }).id === item.id) as
      | { enabled?: boolean; children?: unknown }
      | undefined;
    const enabled = typeof match?.enabled === 'boolean' ? match.enabled : item.enabled;
    if (!item.children) {
      return { ...item, enabled };
    }
    return {
      ...item,
      enabled,
      children: applyEnabledFlags(item.children, match?.children),
    };
  });
}
