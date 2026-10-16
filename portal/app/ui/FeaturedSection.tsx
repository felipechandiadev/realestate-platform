'use client';

import React from 'react';
import FeaturedPropertiesBand from './FeaturedPropertiesBand';
import FeaturedPropertiesList from './FeaturedPropertiesList';
import type { FeaturedLayoutDesktop } from '@/features/cms/actions/portal-featured.action';

type FeaturedPropertyItem = React.ComponentProps<typeof FeaturedPropertiesBand>['properties'][number];

interface PaginationData {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

interface FeaturedSectionProps {
  layoutDesktop: FeaturedLayoutDesktop;
  gridColumns: number;
  /** All (or many) featured items for the scrollable carousel */
  bandProperties: FeaturedPropertyItem[];
  /** Current page for desktop grid */
  gridProperties?: FeaturedPropertyItem[];
  pagination?: PaginationData;
}

export default function FeaturedSection({
  layoutDesktop,
  gridColumns,
  bandProperties,
  gridProperties = [],
  pagination,
}: FeaturedSectionProps) {
  const showDesktopGrid = layoutDesktop === 'grid';

  return (
    <>
      {/* Mobile always carousel; desktop carousel when layout is band */}
      <div className={showDesktopGrid ? 'md:hidden' : undefined}>
        <FeaturedPropertiesBand properties={bandProperties} />
      </div>

      {showDesktopGrid ? (
        <div className="relative hidden w-full bg-card px-4 pb-6 md:block md:px-6">
          {/* Narrower than listings (max-w-7xl) so featured cards keep carousel scale */}
          <div className="mx-auto max-w-5xl">
            <FeaturedPropertiesList
              properties={gridProperties as any}
              pagination={pagination}
              columns={gridColumns}
            />
          </div>
        </div>
      ) : null}
    </>
  );
}
