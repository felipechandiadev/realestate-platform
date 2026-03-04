'use client';

import { useRouter } from 'next/navigation';
import ListProperties from '../../ui/ListProperties';

interface PaginationWrapperProps {
  properties: any[];
  pagination: any;
  searchParams: { [key: string]: string | string[] | undefined };
}

export default function PaginationWrapper({
  properties,
  pagination,
  searchParams
}: PaginationWrapperProps) {
  const router = useRouter();

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams();

    // Preserve existing filters
    if (searchParams.typeProperty) params.set('typeProperty', String(searchParams.typeProperty));
    if (searchParams.state) params.set('state', String(searchParams.state));
    if (searchParams.city) params.set('city', String(searchParams.city));
    if (searchParams.currency) params.set('currency', String(searchParams.currency));
    if (searchParams.sort) params.set('sort', String(searchParams.sort));

    // Update page
    params.set('page', page.toString());

    // Navigate to new URL
    router.push(`/portal/properties/sale?${params.toString()}`);
  };

  return (
    <ListProperties
      properties={properties}
      pagination={pagination}
      onPageChange={handlePageChange}
    />
  );
}