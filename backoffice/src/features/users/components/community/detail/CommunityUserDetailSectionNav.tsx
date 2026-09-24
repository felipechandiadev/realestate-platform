'use client';

import type {
  CommunityUserDetailSectionId,
  CommunityUserDetailTabItem,
} from './community-user-detail-section.types';

type CommunityUserDetailSectionNavProps = {
  tabs: CommunityUserDetailTabItem[];
  activeId: CommunityUserDetailSectionId;
  onSelect: (id: CommunityUserDetailSectionId) => void;
};

export function CommunityUserDetailSectionNav({
  tabs,
  activeId,
  onSelect,
}: CommunityUserDetailSectionNavProps) {
  return (
    <nav
      className="flex flex-wrap border-b border-border"
      aria-label="Secciones del usuario"
      data-test-id="community-user-detail-section-nav"
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeId;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            aria-controls={`community-user-section-panel-${tab.id}`}
            id={`community-user-section-tab-${tab.id}`}
            className={`fs-tabs__link cursor-pointer border-0 bg-transparent ${
              isActive ? 'fs-tabs__link--active' : 'fs-tabs__link--inactive'
            }`}
            onClick={() => onSelect(tab.id)}
            data-test-id={`community-user-detail-tab-${tab.id}`}
          >
            {tab.label}
          </button>
        );
      })}
    </nav>
  );
}
