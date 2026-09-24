'use client'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Home, ChevronDown, ChevronUp } from 'lucide-react'
import ContactDialog from '@/shared/components/ui/ContactDialog/ContactDialog'

export default function NavBar() {
  const router = useRouter();
  // Un solo estado para controlar qué menú está abierto
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [showContactDialog, setShowContactDialog] = useState(false);

  // Función para navegar y cerrar todos los menús
  const handleNavigation = (path: string) => {
    router.push(path);
    setOpenMenu(null);
  };

  // Función para abrir/cerrar un menú específico
  const toggleMenu = (menuName: string) => {
    setOpenMenu(openMenu === menuName ? null : menuName);
  };

  // Cierra el menú si el foco sale del contenedor del menú
  const handleBlur = (e: React.FocusEvent<HTMLLIElement>) => {
    // We check if the new focused element is a child of the menu.
    // If it is not, we close the menu.
    if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
      setOpenMenu(null);
    }
  };

  return (
    <nav className="w-full bg-background" aria-label="Main navigation">
      <ul className="flex items-center justify-center gap-2 md:gap-6 px-2 md:px-4 py-1.5 md:py-3">
        {/* --- Home Link --- */}
        <li>
          <button onClick={() => router.push('/portal')} className="flex items-center gap-1 md:gap-2 text-xs md:text-sm font-medium text-neutral-900 hover:text-primary uppercase tracking-wide">
            <Home size={20} className="md:w-6 md:h-6 text-primary" />
          </button>
        </li>

        {/* --- DROPDOWN PROPIEDADES --- */}
        <li className="relative" onBlur={handleBlur}>
          <button
            onClick={() => toggleMenu('propiedades')}
            aria-haspopup="true"
            aria-expanded={openMenu === 'propiedades'}
            className="flex items-center gap-0.5 md:gap-2 cursor-pointer py-1 md:py-2 px-0.5 md:px-1"
          >
            <span className="text-xs md:text-sm font-medium text-neutral-900 uppercase tracking-wide">Propiedades</span>
            {openMenu === 'propiedades' ? <ChevronUp size={16} className="text-primary" /> : <ChevronDown size={16} className="text-primary" />}
          </button>
          
          {openMenu === 'propiedades' && (
            <ul className="absolute left-0 top-full mt-1 w-56 bg-white border border-neutral-200 rounded shadow-lg z-20">
              <li><button onClick={() => handleNavigation('/portal/properties/sale')} className="w-full text-left block px-4 py-2 text-sm text-neutral-900 hover:bg-primary/10 transition-colors">Ventas</button></li>
              <li><button onClick={() => handleNavigation('/portal/properties/rent')} className="w-full text-left block px-4 py-2 text-sm text-neutral-900 hover:bg-primary/10 transition-colors">Arriendos</button></li>
              <li><button onClick={() => handleNavigation('/portal/services/management')} className="w-full text-left block px-4 py-2 text-sm text-neutral-900 hover:bg-primary/10 transition-colors">Administraciones</button></li>
            </ul>
          )}
        </li>

        {/* --- DROPDOWN NOSOTROS --- */}
        <li className="relative hidden md:list-item" onBlur={handleBlur}>
          <button
            onClick={() => toggleMenu('nosotros')}
            aria-haspopup="true"
            aria-expanded={openMenu === 'nosotros'}
            className="flex items-center gap-1 md:gap-2 cursor-pointer py-2 px-1"
          >
            <span className="text-xs md:text-sm font-medium text-neutral-900 uppercase tracking-wide">Nosotros</span>
            {openMenu === 'nosotros' ? <ChevronUp size={16} className="text-primary" /> : <ChevronDown size={16} className="text-primary" />}
          </button>
          
          {openMenu === 'nosotros' && (
            <ul className="absolute left-0 top-full mt-1 w-56 bg-white border border-neutral-200 rounded shadow-lg z-20">
              <li>
                <button onClick={() => handleNavigation('/portal/aboutUs')} className="w-full text-left px-4 py-2 text-sm text-neutral-900 hover:bg-primary/10 transition-colors">
                  Quiénes somos
                </button>
              </li>
              <li>
                <button onClick={() => handleNavigation('/portal/ourTeam')} className="w-full text-left px-4 py-2 text-sm text-neutral-900 hover:bg-primary/10 transition-colors">
                  Nuestro Equipo
                </button>
              </li>
              <li>
                <button onClick={() => handleNavigation('/portal/testimonials')} className="w-full text-left px-4 py-2 text-sm text-neutral-900 hover:bg-primary/10 transition-colors">
                  Testimonios
                </button>
              </li>
            </ul>
          )}
        </li>

        {/* --- Vende tu Propiedad --- */}
        <li>
          <button onClick={() => handleNavigation('/portal/sell-property')} className="text-xs md:text-sm font-medium text-neutral-900 hover:text-primary uppercase tracking-wide">
            Vende tu Propiedad
          </button>
        </li>

        {/* --- Arrienda tu Propiedad --- */}
        <li>
          <button onClick={() => handleNavigation('/portal/rent-property')} className="text-xs md:text-sm font-medium text-neutral-900 hover:text-primary uppercase tracking-wide">
            Arrienda tu Propiedad
          </button>
        </li>

        {/* --- Valoriza tu Propiedad --- */}
        <li className="hidden md:list-item">
          <button onClick={() => handleNavigation('/portal/valuation')} className="text-xs md:text-sm font-medium text-neutral-900 hover:text-primary uppercase tracking-wide">
            Valoriza tu Propiedad
          </button>
        </li>

        {/* --- Otros Links --- */}
        <li className="hidden sm:block">
          <button onClick={() => handleNavigation('/portal/blog')} className="text-xs md:text-sm font-medium text-neutral-900 hover:text-primary uppercase tracking-wide">
            Blog
          </button>
        </li>
        <li className="hidden sm:list-item">
          <button onClick={() => setShowContactDialog(true)} className="text-xs md:text-sm font-medium text-neutral-900 hover:text-primary uppercase tracking-wide">
            Contacto
          </button>
        </li>
      </ul>

      <ContactDialog open={showContactDialog} onClose={() => setShowContactDialog(false)} />
    </nav>
  )
}
