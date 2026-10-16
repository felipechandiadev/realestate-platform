'use client';

import type { PersonDetailSectionId, PersonDetailTabItem } from './person-detail-section.types';

type PersonDetailSectionNavProps = {
  tabs: PersonDetailTabItem[];
  activeId: PersonDetailSectionId;
  onSelect: (id: PersonDetailSectionId) => void;
};

export function PersonDetailSectionNav({
  tabs,
  activeId,
  onSelect,
}: PersonDetailSectionNavProps) {
  return (
    <nav
      className="flex flex-wrap border-b border-border"
      aria-label="Secciones de la persona"
      data-test-id="person-detail-section-nav"
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeId;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            aria-controls={`person-section-panel-${tab.id}`}
            id={`person-section-tab-${tab.id}`}
            className={`fs-tabs__link cursor-pointer border-0 bg-transparent ${
              isActive ? 'fs-tabs__link--active' : 'fs-tabs__link--inactive'
            }`}
            onClick={() => onSelect(tab.id)}
            data-test-id={`person-detail-tab-${tab.id}`}
          >
            {tab.label}
          </button>
        );
      })}
    </nav>
  );
}
