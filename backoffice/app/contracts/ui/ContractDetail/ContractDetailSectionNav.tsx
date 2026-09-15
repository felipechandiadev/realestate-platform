'use client';

import type {
  ContractDetailSectionId,
  ContractDetailTabItem,
} from './contract-detail-section.types';

type ContractDetailSectionNavProps = {
  tabs: ContractDetailTabItem[];
  activeId: ContractDetailSectionId;
  onSelect: (id: ContractDetailSectionId) => void;
};

export function ContractDetailSectionNav({
  tabs,
  activeId,
  onSelect,
}: ContractDetailSectionNavProps) {
  return (
    <nav
      className="flex flex-wrap border-b border-border"
      aria-label="Secciones del contrato"
      data-test-id="contract-detail-section-nav"
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeId;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            aria-controls={`contract-section-panel-${tab.id}`}
            id={`contract-section-tab-${tab.id}`}
            className={`fs-tabs__link cursor-pointer border-0 bg-transparent ${
              isActive ? 'fs-tabs__link--active' : 'fs-tabs__link--inactive'
            }`}
            onClick={() => onSelect(tab.id)}
            data-test-id={`contract-detail-tab-${tab.id}`}
          >
            {tab.label}
          </button>
        );
      })}
    </nav>
  );
}
