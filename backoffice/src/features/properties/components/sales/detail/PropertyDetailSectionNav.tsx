'use client';

import type {
  PropertyDetailSectionId,
  PropertyDetailTabItem,
} from './property-detail-section.types';

type PropertyDetailSectionNavProps = {
  tabs: PropertyDetailTabItem[];
  activeId: PropertyDetailSectionId;
  onSelect: (id: PropertyDetailSectionId) => void;
};

export function PropertyDetailSectionNav({
  tabs,
  activeId,
  onSelect,
}: PropertyDetailSectionNavProps) {
  return (
    <nav
      className="flex flex-wrap border-b border-border"
      aria-label="Secciones de la propiedad"
      data-test-id="property-sales-detail-section-nav"
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeId;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            aria-controls={`property-section-panel-${tab.id}`}
            id={`property-section-tab-${tab.id}`}
            className={`fs-tabs__link cursor-pointer border-0 bg-transparent ${
              isActive ? 'fs-tabs__link--active' : 'fs-tabs__link--inactive'
            }`}
            onClick={() => onSelect(tab.id)}
            data-test-id={`property-sales-detail-tab-${tab.id}`}
          >
            {tab.label}
          </button>
        );
      })}
    </nav>
  );
}
