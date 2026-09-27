'use client'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronDown, ChevronUp } from 'lucide-react'
import ContactDialog from '@/shared/components/ui/ContactDialog/ContactDialog'
import { navItemClassName, visibleNavItems, type PortalNavItem } from './portal-header'

export default function NavBar({ navItems }: { navItems: PortalNavItem[] }) {
  const router = useRouter();
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [showContactDialog, setShowContactDialog] = useState(false);
  const items = visibleNavItems(navItems);

  const handleNavigation = (path: string) => {
    router.push(path);
    setOpenMenu(null);
  };

  const toggleMenu = (menuName: string) => {
    setOpenMenu(openMenu === menuName ? null : menuName);
  };

  const handleBlur = (e: React.FocusEvent<HTMLLIElement>) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
      setOpenMenu(null);
    }
  };

  return (
    <nav className="w-full bg-background" aria-label="Main navigation">
      <ul className="flex items-center justify-center gap-2 md:gap-6 px-2 md:px-4 py-1.5 md:py-3">
        {items.map((item) => {
          if (item.children?.length) {
            return (
              <li key={item.id} className={navItemClassName(item.id)} onBlur={handleBlur}>
                <button
                  onClick={() => toggleMenu(item.id)}
                  aria-haspopup="true"
                  aria-expanded={openMenu === item.id}
                  className="flex items-center gap-0.5 md:gap-2 cursor-pointer py-1 md:py-2 px-0.5 md:px-1"
                >
                  <span className="text-xs md:text-sm font-medium text-neutral-900 uppercase tracking-wide">{item.label}</span>
                  {openMenu === item.id ? <ChevronUp size={16} className="text-primary" /> : <ChevronDown size={16} className="text-primary" />}
                </button>
                {openMenu === item.id && (
                  <ul className="absolute left-0 top-full mt-1 w-56 bg-white border border-neutral-200 rounded shadow-lg z-20">
                    {item.children.map((child) => (
                      <li key={child.id}>
                        <button
                          onClick={() => child.href && handleNavigation(child.href)}
                          className="w-full text-left block px-4 py-2 text-sm text-neutral-900 hover:bg-primary/10 transition-colors"
                        >
                          {child.label}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          }

          return (
            <li key={item.id} className={navItemClassName(item.id)}>
              <button
                onClick={() => {
                  if (item.action === 'contact') {
                    setShowContactDialog(true);
                    return;
                  }
                  if (item.href) handleNavigation(item.href);
                }}
                className="text-xs md:text-sm font-medium text-neutral-900 hover:text-primary uppercase tracking-wide"
              >
                {item.label}
              </button>
            </li>
          );
        })}
      </ul>

      <ContactDialog open={showContactDialog} onClose={() => setShowContactDialog(false)} />
    </nav>
  )
}
