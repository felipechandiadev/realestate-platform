'use client';

import React, { useEffect, useState } from 'react';
import { SlidersHorizontal } from 'lucide-react';

type Props = {
  onClick: () => void;
  containerId?: string;
  activeCount?: number;
};

export default function StickyFilterButton({
  onClick,
  containerId = 'properties-container',
  activeCount = 0,
}: Props) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const el = document.getElementById(containerId);
    if (!el || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setVisible(entry.isIntersecting && entry.intersectionRatio > 0);
      },
      { threshold: [0, 0.01, 0.1] },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [containerId]);

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Abrir filtros"
      data-test-id="sticky-filter-button"
      className={`fixed bottom-5 left-1/2 z-40 flex -translate-x-1/2 items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-lg transition-all duration-300 md:hidden ${
        visible ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-6 opacity-0'
      }`}
    >
      <SlidersHorizontal size={18} />
      Filtrar
      {activeCount > 0 ? (
        <span className="rounded-full bg-background/20 px-1.5 text-xs">{activeCount}</span>
      ) : null}
    </button>
  );
}
