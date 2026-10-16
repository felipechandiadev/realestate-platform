export type PortalFooterMenuItem = {
  id: string;
  label: string;
  href: string;
  enabled: boolean;
};

export const DEFAULT_FOOTER_MENU: PortalFooterMenuItem[] = [
  { id: 'inicio', label: 'Inicio', href: '/', enabled: true },
  { id: 'arriendos', label: 'Arriendos', href: '/properties/rent', enabled: true },
  { id: 'ventas', label: 'Ventas', href: '/properties/sale', enabled: true },
  { id: 'administraciones', label: 'Administraciones', href: '/services/management', enabled: true },
  { id: 'publica', label: 'Publica tu propiedad', href: '/publish', enabled: true },
  { id: 'equipo', label: 'Nuestro equipo', href: '/ourTeam', enabled: true },
  { id: 'testimonios', label: 'Testimonios', href: '/testimonials', enabled: true },
  { id: 'blog', label: 'Blog', href: '/blog', enabled: true },
  { id: 'privacidad', label: 'Privacidad', href: '/privacidad', enabled: true },
];

function asBool(value: unknown, fallback: boolean): boolean {
  if (typeof value === 'boolean') return value;
  if (value === 'true' || value === '1' || value === 1) return true;
  if (value === 'false' || value === '0' || value === 0) return false;
  return fallback;
}

export function applyFooterMenu(incoming: unknown): PortalFooterMenuItem[] {
  const rows = Array.isArray(incoming) ? incoming : [];
  return DEFAULT_FOOTER_MENU.map((item) => {
    const match = rows.find(
      (row) => row && typeof row === 'object' && (row as { id?: string }).id === item.id,
    ) as { label?: unknown; enabled?: unknown } | undefined;
    const label =
      typeof match?.label === 'string' && match.label.trim()
        ? match.label.trim().slice(0, 80)
        : item.label;
    const enabled = match ? asBool(match.enabled, item.enabled) : item.enabled;
    return { ...item, label, enabled };
  });
}
