'use client';

import React, { useEffect, useState } from 'react';
import { SlidersHorizontal } from 'lucide-react';

type Props = {
  onClick: () => void;
  /** Kept for call-site compat; visibility follows the properties section via sticky. */
  containerId?: string;
  activeCount?: number;
};

/**
 * Barra sticky "Filtrar" en mobile, alineada justo bajo TopBar + NavBar.
 * Al salir del bloque de propiedades (p. ej. testimonios) deja de verse sola.
 */
export default function StickyFilterButton({
  onClick,
  activeCount = 0,
}: Props) {
  const [topPx, setTopPx] = useState(96);

  useEffect(() => {
    const header = document.getElementById('portal-sticky-header');
    if (!header) return;

    const update = () => {
      const h = Math.ceil(header.getBoundingClientRect().height);
      if (h > 0) setTopPx(h);
    };

    update();
    const ro =
      typeof ResizeObserver !== 'undefined' ? new ResizeObserver(update) : null;
    ro?.observe(header);
    window.addEventListener('resize', update);
    return () => {
      ro?.disconnect();
      window.removeEventListener('resize', update);
    };
  }, []);

  return (
    <div
      className="sticky z-40 -mx-2 mb-3 border-b border-border bg-background/95 px-2 py-2 backdrop-blur md:hidden"
      style={{ top: topPx }}
      data-test-id="sticky-filter-bar"
    >
      <button
        type="button"
        onClick={onClick}
        aria-label="Abrir filtros"
        data-test-id="sticky-filter-button"
        className="mx-auto flex w-full max-w-sm items-center justify-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-md"
      >
        <SlidersHorizontal size={18} aria-hidden />
        Filtrar
        {activeCount > 0 ? (
          <span className="min-w-5 rounded-full bg-background/20 px-1.5 text-center text-xs">
            {activeCount}
          </span>
        ) : null}
      </button>
    </div>
  );
}
